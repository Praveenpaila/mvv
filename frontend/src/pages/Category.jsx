import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DisplayProducts from "./DisplayProducts";
import { useEffect } from "react";
import api from "../api";
import { add } from "../store/product";
import styles from "./Category.module.css";

const Category = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const products = useSelector((state) => state.product.products);

  useEffect(() => {
    const getItems = async () => {
      try {
        const res = await api.get(`/home/${id}`);
        if (res.data) {
          dispatch(add(res.data.products));
        }
      } catch (err) {
        console.log(err || "error");
      }
    };
    getItems();
  }, [dispatch, id]);
  // console.log(filteredProducts);

  return (
    <div className={styles.page}>
      {products.length === 0 && <p className={styles.empty}>No products found</p>}

      <div className={styles.grid}>
        {products.map((item) => (
          <DisplayProducts key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Category;
