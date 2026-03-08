import React from "react";
import styles from "./Manage.module.css";
import { useSelector } from "react-redux";
import { Title } from "../Title";
import AdminProduct from "./AdminProduct";
const Manage = () => {
  const category = useSelector((state) => state.category.category);
  // console.log(product);
  return (
    <div className={styles.home}>
      {/* CATEGORY SECTION */}
      <section className={styles.section}>
        <Title text1="Shop by" text2="Category" />

        <div className={styles.grid}>
          {category.map((cat) => (
            <AdminProduct key={cat._id} item={cat} />
          ))}
        </div>
      </section>

      {/* PRODUCT SECTION */}
      {/* <section className={styles.section}>
        <Title text1="Popular" text2="Products" />

        <div className={styles.grid}>
          {product.map((item) => (
            <DisplayProducts key={item._id} item={item} />
          ))}
        </div>
      </section> */}
    </div>
  );
};

export default Manage;
