import React, { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/admin/orders", {
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

  // console.log(orders);
  const updateStatus = async (orderId, status) => {
    try {
      const res = await api.put(
        `/admin/orders/${orderId}`,
        { orderStatus: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      console.log(res.data);
      toast.success(res.data.message);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: status } : o,
        ),
      );

      toast.success("Order status updated");
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <p className={styles.loading}>Loading orders…</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}> Customer Orders</h2>
      <ToastContainer></ToastContainer>
      {orders.map((order) => (
        <div className={styles.orderCard} key={order._id}>
          {/* HEADER */}
          <div className={styles.header}>
            <div>
              <p className={`${styles.status} ${styles[order.orderStatus]}`}>
                {order.orderStatus.replaceAll("_", " ")}
              </p>
              <p className={styles.date}>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <span className={styles.amount}>₹{order.totalAmount}</span>
          </div>

          {/* ITEMS */}
          <div className={styles.items}>
            {Object.values(order.items).map((item, idx) => (
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
          <div className={styles.address}>
            <strong>Address:</strong> {order.address.firstName},{" "}
            {order.address.block}, {order.address.floor}, {order.address.roomNo}
          </div>

          {/* ACTIONS */}
          <div className={styles.actions}>
            <select
              value={order.orderStatus}
              onChange={(e) => updateStatus(order._id, e.target.value)}
            >
              <option
                value="placed"
                onClick={() => {
                  setState("Placed");
                }}
              >
                Placed
              </option>
              <option
                value="confirmed"
                onClick={() => {
                  setState("Confirmed");
                }}
              >
                Confirmed
              </option>
              <option
                value="out_for_delivery"
                onClick={() => {
                  setState("Out for delivery");
                }}
              >
                Out for delivery
              </option>
              <option
                value="delivered"
                onClick={() => {
                  setState("Delivered");
                }}
              >
                Delivered
              </option>
              <option
                value="cancelled"
                onClick={() => {
                  setState("Cancelled");
                }}
              >
                Cancelled
              </option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
