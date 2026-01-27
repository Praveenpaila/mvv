import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Title } from "../components/Title";
import DispayCartItems from "./DispayCartItems";
import styles from "./Cart.module.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";
import api from "../api";
import { addAddress, removeAddress } from "../store/address";
import { clearCart } from "../store/cart";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart.cart);
  const addresses = useSelector((state) => state.address.address);

  const [checkOutAddress, setCheckoutAddress] = useState(null);
  const [priceMap, setPriceMap] = useState({});
  const [totalSum, setTotalSum] = useState(0);
  const [paymentType, setPaymentType] = useState("cash");

  const onPriceChange = (productId, price, quantity) => {
    setPriceMap((prev) => {
      const updated = { ...prev };
      if (quantity === 0) delete updated[productId];
      else updated[productId] = price * quantity;
      setTotalSum(Object.values(updated).reduce((a, b) => a + b, 0));
      return updated;
    });
  };

  useEffect(() => {
    const getAddress = async () => {
      try {
        const res = await api.get("/address", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        dispatch(addAddress(res.data.address));
      } catch {
        toast.error("Server error");
      }
    };
    if (localStorage.getItem("token")) getAddress();
  }, [dispatch]);

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

  const handleOrder = async () => {
    if (!checkOutAddress) return toast.error("Please select address");
    if (cart.length === 0) return toast.error("Cart is empty");

    try {
      await api.post(
        "/order",
        {
          items: cart,
          addressId: checkOutAddress._id,
          totalAmount: totalSum,
          paymentType,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      dispatch(clearCart());
      navigate("/buy-now");
    } catch {
      toast.error("Order failed");
    }
  };

  return (
    <div className={styles.cartPage}>
      <div className={styles.left}>
        <Title text1="Shopping" text2="Cart" />
        {cart.length === 0 ? (
          <p className={styles.empty}>Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <DispayCartItems
              key={item._id}
              item={item}
              onPriceChange={onPriceChange}
            />
          ))
        )}
      </div>

      <div className={styles.right}>
        <h3>Check your address</h3>

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
                <p>
                  {addr.firstName} {addr.secondName}, {addr.block}, {addr.floor}
                  , {addr.roomNo}
                </p>
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
          <strong>₹{totalSum}</strong>
        </div>

        <button
          className={styles.checkout}
          disabled={!checkOutAddress || cart.length === 0}
          onClick={handleOrder}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
