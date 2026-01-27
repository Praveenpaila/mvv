import React from "react";
import styles from "./Nav.module.css";
import { useNavigate } from "react-router";

const Nav = ({ setToken, setRole }) => {
  const navigate = useNavigate();
  return (
    <nav className={styles.nav}>
      {/* LEFT */}
      <div className={styles.left}>
        <span className={styles.brand}>MK Gold Coast</span>
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
