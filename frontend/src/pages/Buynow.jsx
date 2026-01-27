import React from "react";
import { Link } from "react-router-dom";
import styles from "./Buynow.module.css";

const Buynow = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Success Animation */}
        <div className={styles.checkmarkWrapper}>
          <div className={styles.checkmark}></div>
        </div>

        <h1 className={styles.title}>Order Placed Successfully!</h1>
        <p className={styles.subtitle}>
          Thank you for shopping with us. Your order is being processed and will
          be delivered soon.
        </p>

        <Link to="/home" className={styles.homeBtn}>
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default Buynow;
