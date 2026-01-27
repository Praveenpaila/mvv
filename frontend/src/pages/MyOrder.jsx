import React, { useEffect, useState } from "react";
import api from "../api";
import Orders from "./Orders";
import styles from "./MyOrder.module.css";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await api.get("/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  if (loading) return <p className={styles.loading}>Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No orders yet</h2>
        <p>Your past orders will appear here</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Orders</h2>

      {orders.map((order) => (
        <Orders key={order._id} order={order} />
      ))}
    </div>
  );
};

export default MyOrder;
