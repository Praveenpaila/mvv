import React from "react";
import { useSelector } from "react-redux";
import DisplayProducts from "./DisplayProducts";
import styles from "./BestSeller.module.css";

const BestSeller = () => {
  const products = useSelector((state) => state.product.products);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Best Sellers</h2>

      <div className={styles.grid}>
        {products.length === 0 ? (
          <p className={styles.empty}>No products found</p>
        ) : (
          products.map((item) => <DisplayProducts key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default BestSeller;
