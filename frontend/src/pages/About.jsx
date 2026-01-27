import React from "react";
import styles from "./About.module.css";
import { asset } from "../assets/assets";

const About = () => {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1>About MK Gold Coast</h1>
          <p>Fresh groceries delivered to your doorstep in minutes.</p>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {/* LEFT */}
          <div className={styles.text}>
            <h2>Who We Are</h2>
            <p>
              MK Gold Coast is a fast and reliable online grocery delivery
              platform inspired by modern quick-commerce services like Blinkit.
              We focus on delivering fresh fruits, vegetables, and daily
              essentials at lightning speed.
            </p>

            <h2>Our Mission</h2>
            <p>
              To simplify everyday shopping by providing quality products,
              affordable prices, and super-fast delivery — all from the comfort
              of your home.
            </p>

            <h2>Why Choose Us?</h2>
            <ul>
              <li>✔ Fresh & quality products</li>
              <li>✔ Fast delivery</li>
              <li>✔ Trusted local sourcing</li>
              <li>✔ Easy & secure shopping</li>
            </ul>
          </div>

          {/* RIGHT */}
          <div className={styles.imageBox}>
            <img src={asset.mkLogo} alt="MK Gold Coast" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
