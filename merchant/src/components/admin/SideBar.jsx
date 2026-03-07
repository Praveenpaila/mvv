import React from "react";
import { Link } from "react-router-dom";
import styles from "./SideBar.module.css";

const SideBar = () => {
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>Merchant</h3>

      <nav className={styles.menu}>
        <Link to="/merchant" className={styles.link}>
          Dashboard
        </Link>
        <Link to="/merchant/upload" className={styles.link}>
          Upload Products
        </Link>

        <Link to="/merchant/orders" className={styles.link}>
          Orders
        </Link>

        <Link to="/merchant/manage" className={styles.link}>
          Manage Items
        </Link>
        <Link to="/merchant/bulkManage" className={styles.link}>
          Bulk manage
        </Link>
        <Link to="/merchant/report" className={styles.link}>
          Report
        </Link>
      </nav>
    </aside>
  );
};

export default SideBar;
