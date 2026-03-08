import React from "react";
import styles from "./Nav.module.css";
import { useNavigate } from "react-router";

const Nav = ({ setToken, setRole, toggleSidebar }) => {
  const navigate = useNavigate();
  return (
    <nav className={styles.nav}>
      {/* LEFT */}
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuBtn}
          aria-label="Toggle sidebar"
          onClick={toggleSidebar}
        >
          Menu
        </button>
        <span className={styles.brand}>MVV</span>
        <span className={styles.panel}>Admin Panel</span>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <button
          className={styles.logout}
          onClick={() => {
            navigate("/admin/login");
            setRole("");
            setToken("");
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Nav;

