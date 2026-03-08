import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Title } from "../components/Title";
import DispayCartItems from "./DispayCartItems";
import api from "../api/api";
import { addAddress, removeAddress } from "../store/address";
import { clearCart } from "../store/cart";
import Toast from "react-native-toast-message";
import { useRazorpay } from "../hooks/useRazorpay";
import { RAZORPAY_KEY_ID } from "../config/apiConfig";
import colors from "../theme/colors";
import { useScrollToTopOnFocus } from "../hooks/useScrollToTopOnFocus";

const Cart = ({ navigation }) => {
  const { token } = useAuth();
  const dispatch = useDispatch();
  const { openCheckout, RazorpayUI } = useRazorpay();

  useEffect(() => {
    if (!token && navigation?.replace) navigation.replace("Login");
  }, [token, navigation]);

  const cart = useSelector((state) => state.cart.cart);
  const addresses = useSelector((state) => state.address.address);
  const [checkOutAddress, setCheckoutAddress] = useState(null);
  const [priceMap, setPriceMap] = useState({});
  const [totalSum, setTotalSum] = useState(0);
  const [paymentType, setPaymentType] = useState("cash");
  const [orderLoading, setOrderLoading] = useState(false);
  const scrollRef = useRef(null);
  useScrollToTopOnFocus(scrollRef);

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
    if (!token) return;
    const getAddress = async () => {
      try {
        const res = await api.get("/address");
        dispatch(addAddress(res.data.address || []));
      } catch {
        Toast.show({ type: "error", text1: "Server error" });
      }
    };
    getAddress();
  }, [dispatch, token]);

  const onRemoveHandler = async (id) => {
    if (checkOutAddress?._id === id) {
      Toast.show({ type: "error", text1: "Selected address cannot be removed" });
      return;
    }
    try {
      await api.delete("/address", { data: { id } });
      dispatch(removeAddress(id));
      Toast.show({ type: "success", text1: "Address removed" });
    } catch {
      Toast.show({ type: "error", text1: "Delete failed" });
    }
  };

  const handleOrder = async () => {
    if (!checkOutAddress) {
      Toast.show({ type: "error", text1: "Please select address" });
      return;
    }
    if (cart.length === 0) {
      Toast.show({ type: "error", text1: "Cart is empty" });
      return;
    }

    setOrderLoading(true);
    try {
      const orderRes = await api.post("/order", {
        items: cart,
        addressId: checkOutAddress._id,
        totalAmount: totalSum,
        paymentType,
      });

      if (!orderRes.data?.success || !orderRes.data?.orderId) {
        Toast.show({ type: "error", text1: orderRes.data?.message || "Order failed" });
        setOrderLoading(false);
        return;
      }

      const orderId = orderRes.data.orderId;
      dispatch(clearCart());

      if (paymentType === "cash") {
        Toast.show({ type: "success", text1: "Order placed successfully" });
        navigation?.navigate?.("Buynow");
        setOrderLoading(false);
        return;
      }

      const paymentRes = await api.post("/payment/create-order", { orderId });
      const amount = Number(paymentRes.data?.amount) || Math.round(totalSum * 100);
      const razorpayOrderId = paymentRes.data?.id;

      if (!razorpayOrderId) {
        Toast.show({ type: "error", text1: "Payment setup failed" });
        setOrderLoading(false);
        return;
      }

      openCheckout(
        {
          key: RAZORPAY_KEY_ID,
          amount,
          currency: "INR",
          order_id: razorpayOrderId,
          name: "MVV",
          description: "Order Payment",
          prefill: {
            name: checkOutAddress?.firstName || "Guest",
            email: checkOutAddress?.email || "guest@example.com",
            contact: String(checkOutAddress?.phoneNumber || "9999999999"),
          },
          theme: { color: colors.primary },
        },
        {
          onSuccess: async (data) => {
            try {
              const verifyRes = await api.post("/payment/verify", {
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
                orderId,
              });
              if (verifyRes.data?.success) {
                Toast.show({ type: "success", text1: "Payment successful" });
                navigation?.navigate?.("Buynow");
              } else {
                Toast.show({ type: "error", text1: "Payment verification failed" });
              }
            } catch {
              Toast.show({ type: "error", text1: "Verification failed" });
            } finally {
              setOrderLoading(false);
            }
          },
          onFailure: (error) => {
            Toast.show({ type: "error", text1: error?.description || "Payment failed" });
            setOrderLoading(false);
          },
          onClose: () => {
            setOrderLoading(false);
          },
        },
      );
    } catch (err) {
      Toast.show({ type: "error", text1: err?.response?.data?.message || "Order failed" });
      setOrderLoading(false);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.cartPage}
      contentContainerStyle={styles.content}
    >
      <View style={styles.left}>
        <Title text1="Shopping" text2="Cart" />
        {cart.length === 0 ? (
          <Text style={styles.empty}>Your cart is empty</Text>
        ) : (
          cart.map((c, idx) => (
            <DispayCartItems
              key={`cart-item-${idx}`}
              item={c}
              onPriceChange={onPriceChange}
              navigation={navigation}
            />
          ))
        )}
      </View>

      <View style={styles.right}>
        <Text style={styles.sectionTitle}>Check your address</Text>
        {(addresses || []).map((addr, idx) => (
          <TouchableOpacity
            key={`addr-${idx}`}
            style={[
              styles.checkAddress,
              checkOutAddress?._id === addr._id ? styles.selected : null,
            ]}
            onPress={() => setCheckoutAddress(addr)}
          >
            <View style={styles.addressLeft}>
              <View
                style={[
                  styles.radio,
                  checkOutAddress?._id === addr._id ? styles.radioChecked : null,
                ]}
              />
              <View style={styles.addressCard}>
                <Text style={styles.addrName}>{addr.firstName}</Text>
                <Text style={styles.addrText}>
                  {addr.firstName} {addr.secondName}, {addr.block}, {addr.floor},{" "}
                  {addr.roomNo}
                </Text>
                <Text style={styles.addrText}>{addr.phoneNumber}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => onRemoveHandler(addr._id)}>
              <Text style={styles.removeIcon}>X</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation?.navigate?.("Address")}
        >
          <Text style={styles.addBtnText}>Add Address</Text>
        </TouchableOpacity>

        <View style={styles.selectRow}>
          <Text style={styles.selectLabel}>Payment:</Text>
          <TouchableOpacity
            style={[
              styles.option,
              paymentType === "cash" ? styles.optionSelected : null,
            ]}
            onPress={() => setPaymentType("cash")}
          >
            <Text
              style={[
                styles.optionText,
                paymentType === "cash" ? styles.optionTextSelected : null,
              ]}
            >
              Cash
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.option,
              paymentType === "online" ? styles.optionSelected : null,
            ]}
            onPress={() => setPaymentType("online")}
          >
            <Text
              style={[
                styles.optionText,
                paymentType === "online" ? styles.optionTextSelected : null,
              ]}
            >
              Online
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryAmount}>{`\u20B9${totalSum}`}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkout,
            !checkOutAddress || cart.length === 0 || orderLoading
              ? styles.checkoutDisabled
              : null,
          ]}
          onPress={handleOrder}
          disabled={!checkOutAddress || cart.length === 0 || orderLoading}
        >
          {orderLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          )}
        </TouchableOpacity>
      </View>

      {RazorpayUI}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cartPage: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 100 },
  left: { marginBottom: 24 },
  empty: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 24,
  },
  right: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.text,
  },
  checkAddress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { borderColor: colors.primary, backgroundColor: "#EAF8EF" },
  addressLeft: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#9FB7A8",
    marginRight: 12,
    marginTop: 3,
  },
  radioChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  addressCard: { flex: 1 },
  addrName: { fontSize: 14, fontWeight: "700", color: colors.text },
  addrText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  removeIcon: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
    marginLeft: 8,
  },
  addBtn: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.primary,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
    backgroundColor: "transparent",
  },
  addBtnText: { color: colors.primaryDark, fontWeight: "700", fontSize: 14 },
  selectRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  selectLabel: { fontSize: 14, marginRight: 8, color: colors.text },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#CDDDCF",
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: 13, color: colors.text },
  optionTextSelected: { color: "#fff", fontWeight: "700" },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  summaryLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  summaryAmount: { fontSize: 20, fontWeight: "800", color: colors.primaryDark },
  checkout: {
    backgroundColor: colors.primary,
    padding: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutDisabled: { backgroundColor: "#9CA3AF" },
  checkoutText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default Cart;
