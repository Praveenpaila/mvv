import React from "react";
import { Link } from "react-router-dom";
import styles from "./SideBar.module.css";

const SideBar = () => {
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.title}>Admin</h3>

      <nav className={styles.menu}>
        <Link to="/admin" className={styles.link}>
          Dashboard
        </Link>
        <Link to="/admin/upload" className={styles.link}>
          Upload Products
        </Link>

        <Link to="/admin/orders" className={styles.link}>
          Orders
        </Link>

        <Link to="/admin/manage" className={styles.link}>
          Manage Items
        </Link>
      </nav>
    </aside>
  );
};

export default SideBar;
