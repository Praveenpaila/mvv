import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Product from "./Product";
import DisplayProducts from "./DisplayProducts";
import { useEffect } from "react";
import api from "../api";
import { add } from "../store/product";

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
  }, [dispatch]);
  // console.log(filteredProducts);

  return (
    // <div></div>
    <div style={{ padding: "80px" }}>
      {products.length === 0 && <p>No products found</p>}

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {products.map((item) => (
          <DisplayProducts key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Category;
