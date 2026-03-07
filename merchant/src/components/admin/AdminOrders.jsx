import React, { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/merchant/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleConfirmation = async (merchantOrderId) => {
    try {
      const res = await api.post(
        "/merchant/toggle-confirm",
        { merchantOrderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (res.data.success) {
        toast.success(
          res.data.confirmed
            ? "Order confirmed ✓"
            : "Order confirmation removed"
        );
        setOrders((prev) =>
          prev.map((o) =>
            o.merchantOrderId === merchantOrderId
              ? { ...o, confirmed: res.data.confirmed }
              : o,
          ),
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update confirmation");
    }
  };

  if (loading) return <p className={styles.loading}>Loading orders…</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Customer Orders</h2>
      <ToastContainer />

      {orders.map((order) => (
        <div className={styles.orderCard} key={order.merchantOrderId}>
          {/* HEADER */}
          <div className={styles.header}>
            <div>
              <p className={`${styles.status} ${styles[order.orderStatus]}`}>
                {order.orderStatus?.replaceAll("_", " ")}
              </p>
              <p className={styles.date}>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <span className={styles.amount}>₹{order.merchantTotal}</span>
          </div>

          {/* ITEMS */}
          <div className={styles.items}>
            {order.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <img src={item.image} alt={item.name} />
                <span>{item.name}</span>
                <span>
                  {item.quantity} × ₹{item.price}
                </span>
              </div>
            ))}
          </div>

          {/* ADDRESS */}
          {order.address && (
            <div className={styles.address}>
              <strong>Address:</strong> {order.address.firstName},{" "}
              {order.address.block}, {order.address.floor},{" "}
              {order.address.roomNo}
            </div>
          )}

          {/* CONFIRMATION CHECKBOX */}
          <div className={styles.confirmationSection}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={order.confirmed || false}
                onChange={() => toggleConfirmation(order.merchantOrderId)}
                className={styles.confirmCheckbox}
              />
              <span>Confirm this order</span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
