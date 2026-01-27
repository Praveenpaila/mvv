import React from "react";
import styles from "./AdminProduct.module.css";
import { useNavigate } from "react-router";
const AdminProduct = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div>
      <div className={styles.card}>
        <img
          src={item.image}
          alt={item.name}
          className={styles.image}
          onClick={() => {
            navigate(`items/${item._id}`);
          }}
        />

        <div className={styles.info}>
          <h3 className={styles.name}>{item.categoryName}</h3>
          {item.price && <p className={styles.price}>₹{item.price}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminProduct;
