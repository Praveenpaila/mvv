import React from "react";
import { Link } from "react-router-dom";
import styles from "./SideBar.module.css";

const SideBar = ({ open, sidebarRef, onNavigate }) => {
  return (
    <aside
      id="merchant-sidebar"
      ref={sidebarRef}
      className={`${styles.sidebar} ${open ? styles.open : ""}`}
    >
      <h3 className={styles.title}>Merchant</h3>

      <nav className={styles.menu}>
        <Link to="/merchant" className={styles.link} onClick={onNavigate}>
          Dashboard
        </Link>
        <Link
          to="/merchant/upload"
          className={styles.link}
          onClick={onNavigate}
        >
          Upload Products
        </Link>

        <Link
          to="/merchant/orders"
          className={styles.link}
          onClick={onNavigate}
        >
          Orders
        </Link>

        <Link
          to="/merchant/manage"
          className={styles.link}
          onClick={onNavigate}
        >
          Manage Items
        </Link>
        <Link
          to="/merchant/bulkManage"
          className={styles.link}
          onClick={onNavigate}
        >
          Bulk manage
        </Link>
      </nav>
    </aside>
  );
};

export default SideBar;
