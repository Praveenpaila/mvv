import React from "react";
import styles from "./Nav.module.css";
import { useNavigate } from "react-router";

const Nav = ({ setToken, setRole, toggleSidebar, isSidebarOpen, menuButtonRef }) => {
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
        <button
          type="button"
          className={styles.menuBtn}
          aria-label="Toggle menu"
          aria-controls="merchant-sidebar"
          aria-expanded={Boolean(isSidebarOpen)}
          ref={menuButtonRef}
          onClick={toggleSidebar}
        >
          Menu
        </button>
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

