import React from "react";
import styles from "./Nav.module.css";
import { useNavigate } from "react-router";

const Nav = ({ setToken, setRole }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    setRole("");
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
    window.location.reload(); // Ensure state is reset
  };
  return (
    <nav className={styles.nav}>
      {/* LEFT */}
      <div className={styles.left}>
        <span className={styles.brand}>MVV</span>
        <span className={styles.panel}>Merchant Panel</span>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Nav;

