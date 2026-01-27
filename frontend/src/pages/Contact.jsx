import React from "react";
import styles from "./Contact.module.css";

const Contact = () => {
  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1>Contact Us</h1>
          <p>We’re here to help. Reach out anytime.</p>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {/* LEFT INFO */}
          <div className={styles.info}>
            <h2>Get in Touch</h2>

            <p>
              Have questions about orders, delivery, or products? Our support
              team is always ready to assist you.
            </p>

            <div className={styles.details}>
              <p>
                <strong>Email:</strong> support@mkgoldcoast.com
              </p>
              <p>
                <strong>Phone:</strong> +91 98765 43210
              </p>
              <p>
                <strong>Address:</strong> Hyderabad, India
              </p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <form className={styles.form}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="5" required />
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
