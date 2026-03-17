import React from "react";
import { Link } from "react-router-dom";
import styles from "./SideBar.module.css";

const SideBar = ({ open, sidebarRef, onNavigate }) => {
  return (
    <aside
      id="admin-sidebar"
      ref={sidebarRef}
      className={`${styles.sidebar} ${open ? styles.open : ""}`}
    >
      <h3 className={styles.title}>Admin</h3>

      <nav className={styles.menu}>
        <Link to="/admin" className={styles.link} onClick={onNavigate}>
          Dashboard
        </Link>
        <Link to="/admin/upload" className={styles.link} onClick={onNavigate}>
          Upload Products
        </Link>

        <Link to="/admin/orders" className={styles.link} onClick={onNavigate}>
          Orders
        </Link>

        <Link to="/admin/manage" className={styles.link} onClick={onNavigate}>
          Manage Items
        </Link>
        <Link to="/admin/bulkManage" className={styles.link} onClick={onNavigate}>
          Bulk manage
        </Link>
        <Link to="/admin/authorize-users" className={styles.link} onClick={onNavigate}>
          Add DeliveryPerson
        </Link>
        <Link to="/admin/users" className={styles.link} onClick={onNavigate}>
          Authorization
        </Link>
      </nav>
    </aside>
  );
};

export default SideBar;
