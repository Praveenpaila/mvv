import React, { useEffect, useState } from "react";
import DisplayProducts from "./DisplayProducts";
import styles from "./BestSeller.module.css";
import api from "../api";
import { toast } from "react-toastify";

const BestSeller = () => {
  const [products, setProducts] = useState([]);

  const getOrganicProducts = async () => {
    try {
      const res = await api.get("/products", {
        params: { isOrganic: "true" },
      });

      if (res?.data?.products) {
        setProducts(res.data.products);
      } else {
        toast.error("Organic products are not available at this time");
      }
    } catch {
      toast.error("Failed to load organic products");
    }
  };

  useEffect(() => {
    getOrganicProducts();
  }, []);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Organic Products</h2>

      <div className={styles.grid}>
        {products.length === 0 ? (
          <p className={styles.empty}>No organic products found</p>
        ) : (
          products.map((item) => <DisplayProducts key={item._id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default BestSeller;
