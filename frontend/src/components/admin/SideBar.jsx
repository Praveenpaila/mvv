import React from "react";
import { Link } from "react-router-dom";
import styles from "./SideBar.module.css";

const SideBar = ({ open }) => {
  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
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
        <Link to="/admin/bulkManage" className={styles.link}>
          Bulk manage
        </Link>
        <Link to="/admin/authorize-users" className={styles.link}>
          Add DeliveryPerson
        </Link>
        <Link to="/admin/users" className={styles.link}>
          Authorization
        </Link>
      </nav>
    </aside>
  );
};

export default SideBar;
