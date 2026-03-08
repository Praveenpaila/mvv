import React from "react";
import { asset } from "../assets/assets";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        {/* BRAND */}
        <div className={styles.brand}>
          <img src={asset.mkLogo} alt="MVV" />
          <h3>MVV</h3>
          <p>Fresh groceries delivered to your doorstep.</p>
        </div>

        {/* LINKS */}
        <div className={styles.links}>
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/cart">Cart</Link>
        </div>

        {/* SUPPORT */}
        <div className={styles.links}>
          <h4>Support</h4>
          <Link to="/">Privacy Policy</Link>
          <Link to="/">Terms & Conditions</Link>
          <Link to="/">Refund Policy</Link>
        </div>

        {/* CONTACT */}
        <div className={styles.contact}>
          <h4>Contact</h4>
          <p>📍 India</p>
          <p>📞 +91 9XXXXXXXXX</p>
          <p>✉️ support@mkgoldcoast.com</p>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} MVV. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

