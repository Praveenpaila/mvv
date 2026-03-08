import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Title } from "../components/Title";
import DispayCartItems from "./DispayCartItems";
import styles from "./Cart.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";
import api from "../api";
import { addAddress, removeAddress } from "../store/address";
import { addToCart, clearCart } from "../store/cart";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartRaw = useSelector((state) => state.cart.cart);
  const cart = useMemo(() => (Array.isArray(cartRaw) ? cartRaw : []), [cartRaw]);
  const addresses = useSelector((state) => state.address.address) || [];

  const [checkOutAddress, setCheckoutAddress] = useState(null);
  const [paymentType, setPaymentType] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [itemPrices, setItemPrices] = useState({}); // Track prices by item ID

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(clearCart());
        return;
      }

      try {
        const res = await api.get("/cart");
        if (res.data?.success && Array.isArray(res.data.cart)) {
          dispatch(clearCart());
          res.data.cart.forEach((entry) => {
            const productId = entry?.productId?._id;
            if (!productId) return;
            dispatch(
              addToCart({
                _id: productId,
                quantity: entry.quantity,
              }),
            );
          });
        }
      } catch {
        toast.error("Failed to load cart");
      }
    };

    loadCart();
  }, [dispatch]);

  /* ================= TOTAL CALCULATION ================= */
  useEffect(() => {
    if (!Array.isArray(cart)) return;

    let hasAllPrices = true;
    const sum = cart.reduce((acc, item) => {
      const price = itemPrices[item._id];
      const quantity = Number(item?.quantity) || 0;

      // Check if price is available
      if (price === undefined) {
        hasAllPrices = false;
        return acc;
      }

      return acc + price * quantity;
    }, 0);

    // Only update total if we have prices for all items or partial prices exist
    if (hasAllPrices || Object.keys(itemPrices).length > 0) {
      setTotal(sum);
    }
  }, [cart, itemPrices]);

  /* ================= LOAD ADDRESS ================= */
  useEffect(() => {
    const getAddress = async () => {
      try {
        const res = await api.get("/address", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        dispatch(addAddress(res.data.address || []));
      } catch {
        toast.error("Failed to load addresses");
      }
    };

    if (localStorage.getItem("token")) getAddress();
  }, [dispatch]);

  /* ================= REMOVE ADDRESS ================= */
  const onRemoveHandler = async (id) => {
    if (checkOutAddress?._id === id)
      return toast.error("Selected address cannot be removed");

    try {
      await api.delete("/address", {
        data: { id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(removeAddress(id));
      toast.success("Address removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= LOAD RAZORPAY ================= */
  const loadScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true); // prevent multiple loads

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ================= HANDLE ORDER ================= */
  const handleOrder = async () => {
    if (!checkOutAddress) return toast.error("Select address");
    if (cart.length === 0) return toast.error("Cart empty");
    if (loading) return;

    setLoading(true);

    try {
      const validItems = cart.filter(item => item && item._id);
      if (validItems.length === 0) {
        toast.error("No valid products in cart");
        setLoading(false);
        return;
      }
      const orderRes = await api.post(
        "/order", // ✅ correct route
        {
          items: validItems.map((item) => ({
            _id: item._id,
            quantity: item.quantity,
          })),
          addressId: checkOutAddress._id,
          totalAmount: total, // ✅ send totalAmount
          paymentType,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const { orderId } = orderRes.data;

      if (!orderId) {
        throw new Error("Order creation failed");
      }

      // totalAmount is received from backend

      if (paymentType === "cash") {
        dispatch(clearCart());
        toast.success("Order placed successfully");
        navigate("/buy-now");
        setLoading(false);
        return;
      }

      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        toast.error("Razorpay failed to load");
        setLoading(false);
        return;
      }

      const paymentRes = await api.post(
        "/payment/create-order",
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const options = {
        key: "rzp_test_SHwgaPZxmn05yq",
        amount: Number(paymentRes.data.amount),
        currency: "INR",
        order_id: paymentRes.data.id,
        name: "MVV",
        description: "Order Payment",
        prefill: {
          name: checkOutAddress?.firstName || "Guest",
          email: checkOutAddress?.email || "guest@example.com",
          contact: String(checkOutAddress?.phoneNumber || "9999999999"),
        },
        handler: async function (response) {
          try {
            const verifyRes = await api.post(
              "/payment/verify",
              { ...response, orderId },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            );

            if (verifyRes.data.success) {
              dispatch(clearCart());
              toast.success("Payment successful");
              navigate("/buy-now");
            } else {
              toast.error("Payment verification failed");
            }
          } catch {
            toast.error("Verification error");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Order failed");
      setLoading(false);
    }
  };

  return (
    <div className={styles.cartPage}>
      <div className={styles.left}>
        <Title text1="Shopping" text2="Cart" />
        {cart.length === 0 ? (
          <p className={styles.empty}>Your cart is empty</p>
        ) : (
          <>
            {cart.filter(item => item && item._id).map((item) => (
              <DispayCartItems
                key={item._id}
                item={item}
                onPriceChange={(id, price) => {
                  // Update price tracking whenever product data changes
                  setItemPrices((prev) => {
                    const newPrices = { ...prev, [id]: price };
                    // Log for debugging
                    console.debug("Item prices updated:", newPrices);
                    return newPrices;
                  });
                }}
              />
            ))}
          </>
        )}
      </div>

      <div className={styles.right}>
        <h3>Select Address</h3>

        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`${styles.checkAddress} ${
              checkOutAddress?._id === addr._id ? styles.selected : ""
            }`}
            onClick={() => setCheckoutAddress(addr)}
          >
            <div className={styles.addressLeft}>
              <span
                className={`${styles.radio} ${
                  checkOutAddress?._id === addr._id ? styles.radioChecked : ""
                }`}
              />
              <div className={styles.addressCard}>
                <h4>{addr.firstName}</h4>
                <p>{addr.phoneNumber}</p>
              </div>
            </div>

            <MdDeleteForever
              className={styles.remove}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHandler(addr._id);
              }}
            />
          </div>
        ))}

        <button className={styles.addBtn} onClick={() => navigate("/address")}>
          Add Address
        </button>

        <select
          className={styles.select}
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          <option value="cash">Cash on Delivery</option>
          <option value="online">Online Payment</option>
        </select>

        <div className={styles.summary}>
          <span>Total Amount</span>
          <strong>₹{total}</strong>
        </div>

        <button
          className={styles.checkout}
          disabled={!checkOutAddress || cart.length === 0 || loading}
          onClick={handleOrder}
        >
          {loading ? "Processing..." : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;

