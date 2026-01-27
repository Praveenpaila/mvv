import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import DisplayProducts from "./DisplayProducts";
import styles from "./Search.module.css";
import api from "../api";

const Search = () => {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [items, setItems] = useState([]);

  useEffect(() => {
    const getItem = async () => {
      try {
        if (query == "") {
          return;
        }
        const res = await api.get(`/search/${query}`);
        if (res.data) setItems(res.data.products);
      } catch (err) {
        console.log(err || "server fault");
      }
    };
    getItem();

    // const filtered = products.filter((item) =>
    //   item.name.toLowerCase().includes(query.toLowerCase()),
    // );
    // setItems(filtered);
  }, [query]);

  return (
    <div className={styles.page}>
      {items.length === 0 ? (
        <p className={styles.empty}>No products found</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <DisplayProducts key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
