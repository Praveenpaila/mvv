import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DisplayProducts from "./DisplayProducts";
import styles from "./Search.module.css";
import api from "../api";

const Search = () => {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getItem = async () => {
      if (!query.trim()) {
        setItems([]);
        setHasSearched(false);
        setError(null);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      setError(null);
      try {
        const res = await api.get(`/search/${encodeURIComponent(query.trim())}`);
        if (res.data?.products) {
          setItems(res.data.products);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search products. Please try again.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    getItem();
  }, [query]);

  return (
    <div className={styles.page}>
      {loading ? (
        <div className={styles.center}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Searching...</p>
        </div>
      ) : error ? (
        <div className={styles.center}>
          <p className={styles.error}>{error}</p>
        </div>
      ) : hasSearched && items.length === 0 ? (
        <div className={styles.center}>
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.empty}>No products found</p>
          <p className={styles.emptySubtext}>
            Try searching with different keywords
          </p>
        </div>
      ) : !hasSearched ? (
        <div className={styles.center}>
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.empty}>Start searching for products</p>
          <p className={styles.emptySubtext}>
            Enter a product name in the search bar above
          </p>
        </div>
      ) : (
        <>
          <p className={styles.resultCount}>
            Found {items.length} {items.length === 1 ? "product" : "products"} for "{query}"
          </p>
          <div className={styles.grid}>
            {items.map((item) => (
              <DisplayProducts key={item._id || item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Search;
