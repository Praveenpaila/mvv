import React from "react";
import styles from "./Product.module.css";
import { useNavigate } from "react-router-dom";

const Product = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <img
        src={item.image}
        alt={item.name}
        className={styles.image}
        onClick={() => {
          navigate(`/${item._id}`);
        }}
      />

      <div className={styles.info}>
        <h3 className={styles.name}>{item.categoryName}</h3>
        {item.price && <p className={styles.price}>₹{item.price}</p>}
      </div>
    </div>
  );
};

export default Product;
