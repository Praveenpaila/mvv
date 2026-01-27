import React from "react";
import styles from "./Orders.module.css";

const Orders = ({ order }) => {
  return (
    <div className={styles.orderBox}>
      {/* TOP */}
      <div className={styles.top}>
        <div>
          <p className={`${styles.status} ${styles[order.orderStatus]}`}>
            {order.orderStatus.replaceAll("_", " ")}
          </p>
          <p className={styles.date}>
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <p className={styles.amount}>₹{order.totalAmount}</p>
      </div>

      {/* ITEMS */}
      <div className={styles.items}>
        {Object.values(order.items).map((item, idx) => (
          <div className={styles.itemRow} key={idx}>
            <img
              src={item.image}
              alt={item.name}
              className={styles.productImage}
            />

            <div className={styles.itemInfo}>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemMeta}>
                {item.quantity} × ₹{item.price}
              </p>
            </div>

            <span className={styles.itemTotal}>
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* DELIVERY STATUS */}
      <div className={styles.deliveryStatus}>
        <span className={styles.label}>Delivery Status</span>
        <span className={`${styles.badge} ${styles[order.orderStatus]}`}>
          {order.orderStatus.replaceAll("_", " ")}
        </span>
      </div>

      {/* BOTTOM */}
      <div className={styles.bottom}>
        <span>Delivery in {order.deliveryTime}</span>
        <span className={styles.payment}> paymentType:{order.paymentType}</span>
        <span className={styles.payment}>
          {" "}
          payment Status:{order.paymentStatus}
        </span>
      </div>
    </div>
  );
};

export default Orders;
