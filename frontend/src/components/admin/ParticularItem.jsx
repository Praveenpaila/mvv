import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";
import { Title } from "../Title";
import styles from "./ParticularItem.module.css";

const ParticularItem = () => {
  const { id } = useParams(); // category id
  const [products, setProducts] = useState([]); // loaded pages (server filtered)
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const fileInputsRef = useRef({});
  const prevCategoryIdRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const categoryChanged = prevCategoryIdRef.current !== id;
    prevCategoryIdRef.current = id;

    const fetchFirstPage = async () => {
      const qs = new URLSearchParams();
      qs.set("page", "1");
      qs.set("limit", String(limit));

      const q = search.trim();
      if (q) qs.set("q", q);
      if (inStockOnly) qs.set("inStock", "true");
      if (minPrice !== "" && Number.isFinite(Number(minPrice))) {
        qs.set("minPrice", String(Number(minPrice)));
      }
      if (maxPrice !== "" && Number.isFinite(Number(maxPrice))) {
        qs.set("maxPrice", String(Number(maxPrice)));
      }

      setPage(1);
      setHasMore(true);
      setLoading(true);
      try {
        const res = await api.get(`/home/${id}?${qs.toString()}`);
        if (res.data?.success) {
          const next = Array.isArray(res.data.products)
            ? res.data.products
            : [];
          setProducts(next);
          setHasMore(next.length === limit);
        } else {
          setProducts([]);
          setHasMore(false);
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load products for category",
        );
      } finally {
        setLoading(false);
      }
    };

    if (categoryChanged) {
      setProducts([]);
      fetchFirstPage();
      return;
    }

    const t = setTimeout(fetchFirstPage, 350);
    return () => clearTimeout(t);
  }, [id, search, inStockOnly, minPrice, maxPrice, limit]);

  const visibleProducts = useMemo(() => {
    const list = [...products];

    if (sort === "name_asc")
      list.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    if (sort === "name_desc")
      list.sort((a, b) => (b?.name || "").localeCompare(a?.name || ""));
    if (sort === "price_asc")
      list.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    if (sort === "price_desc")
      list.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    if (sort === "stock_asc")
      list.sort((a, b) => Number(a?.stock || 0) - Number(b?.stock || 0));
    if (sort === "stock_desc")
      list.sort((a, b) => Number(b?.stock || 0) - Number(a?.stock || 0));

    return list;
  }, [products, sort]);

  const handleChange = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, [field]: value } : p)),
    );
  };

  const handleFileChange = (productId, file) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId
          ? {
              ...p,
              _localFile: file || null,
              _preview: file ? URL.createObjectURL(file) : null,
            }
          : p,
      ),
    );
  };

  const handleSave = async (product) => {
    try {
      setSavingId(product._id);

      const formData = new FormData();
      formData.append("name", product.name || "");
      formData.append("description", product.description || "");
      formData.append("packSize", product.packSize || "");
      formData.append("price", product.price ?? 0);
      formData.append("Mrp", product.mrp ?? 0);
      formData.append("stock", product.stock ?? 0);

      if (product._localFile) {
        formData.append("image", product._localFile);
      }

      const res = await api.put(`/products/${product._id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product updated");

      if (res.data?.product) {
        setProducts((prev) =>
          prev.map((p) =>
            p._id === res.data.product._id
              ? { ...res.data.product, _preview: null, _localFile: null }
              : p,
          ),
        );

        if (fileInputsRef.current[product._id]) {
          fileInputsRef.current[product._id].value = "";
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setDeletingId(productId);
      await api.delete(`/products/${productId}`);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <ToastContainer autoClose={2000} />

      <div className={styles.header}>
        <Title text1="Manage" text2="Products" />

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name..."
              aria-label="Search products"
            />
          </div>

          <div className={styles.filters}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In stock
            </label>

            <input
              className={styles.num}
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min ₹"
              aria-label="Minimum price"
            />
            <input
              className={styles.num}
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max ₹"
              aria-label="Maximum price"
            />

            <select
              className={styles.select}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
            >
              <option value="newest">Newest</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="price_asc">Price low-high</option>
              <option value="price_desc">Price high-low</option>
              <option value="stock_asc">Stock low-high</option>
              <option value="stock_desc">Stock high-low</option>
            </select>
          </div>
        </div>

        <div className={styles.meta}>
          <span className={styles.count}>
            Showing {visibleProducts.length} item
            {visibleProducts.length === 1 ? "" : "s"}
          </span>
          {(search.trim() || inStockOnly || minPrice !== "" || maxPrice !== "") && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => {
                setSearch("");
                setInStockOnly(false);
                setMinPrice("");
                setMaxPrice("");
                setSort("newest");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className={styles.infoText}>Loading products…</p>
      ) : visibleProducts.length === 0 ? (
        <p className={styles.infoText}>No products found in this category.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {visibleProducts.map((product) => (
              <div key={product._id} className={styles.card}>
                <div className={styles.imageSection}>
                  <div className={styles.imageBox}>
                    <img
                      src={product._preview || product.image}
                      alt={product.name}
                    />
                  </div>
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept="image/*"
                    ref={(el) => {
                      fileInputsRef.current[product._id] = el;
                    }}
                    onChange={(e) =>
                      handleFileChange(product._id, e.target.files[0])
                    }
                  />
                </div>

                <div className={styles.form}>
                  <label
                    htmlFor={`name-${product._id}`}
                    className={styles.label}
                  >
                    Product Name
                  </label>
                  <input
                    id={`name-${product._id}`}
                    value={product.name || ""}
                    onChange={(e) =>
                      handleChange(product._id, "name", e.target.value)
                    }
                    placeholder="Product Name"
                  />

                  <label
                    htmlFor={`desc-${product._id}`}
                    className={styles.label}
                  >
                    Description
                  </label>
                  <textarea
                    id={`desc-${product._id}`}
                    value={product.description || ""}
                    onChange={(e) =>
                      handleChange(product._id, "description", e.target.value)
                    }
                    placeholder="Description"
                  />

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label
                        htmlFor={`packSize-${product._id}`}
                        className={styles.label}
                      >
                        Pack Size
                      </label>
                      <input
                        id={`packSize-${product._id}`}
                        value={product.packSize || ""}
                        onChange={(e) =>
                          handleChange(product._id, "packSize", e.target.value)
                        }
                        placeholder="Pack Size (1 kg)"
                      />
                    </div>
                    <div className={styles.field}>
                      <label
                        htmlFor={`stock-${product._id}`}
                        className={styles.label}
                      >
                        Stock
                      </label>
                      <input
                        id={`stock-${product._id}`}
                        type="number"
                        value={product.stock ?? 0}
                        onChange={(e) =>
                          handleChange(
                            product._id,
                            "stock",
                            Number(e.target.value),
                          )
                        }
                        placeholder="Stock"
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label
                        htmlFor={`price-${product._id}`}
                        className={styles.label}
                      >
                        Price
                      </label>
                      <input
                        id={`price-${product._id}`}
                        type="number"
                        value={product.price ?? 0}
                        onChange={(e) =>
                          handleChange(
                            product._id,
                            "price",
                            Number(e.target.value),
                          )
                        }
                        placeholder="Price"
                      />
                    </div>
                    <div className={styles.field}>
                      <label
                        htmlFor={`mrp-${product._id}`}
                        className={styles.label}
                      >
                        MRP
                      </label>
                      <input
                        id={`mrp-${product._id}`}
                        type="number"
                        value={product.mrp ?? 0}
                        onChange={(e) =>
                          handleChange(
                            product._id,
                            "mrp",
                            Number(e.target.value),
                          )
                        }
                        placeholder="MRP"
                      />
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.delete}
                      type="button"
                      disabled={deletingId === product._id}
                      onClick={() => handleDelete(product._id)}
                    >
                      {deletingId === product._id ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      className={styles.save}
                      type="button"
                      disabled={savingId === product._id}
                      onClick={() => handleSave(product)}
                    >
                      {savingId === product._id ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className={styles.more}>
              <button
                type="button"
                className={styles.moreBtn}
                disabled={loadingMore}
                onClick={async () => {
                  const nextPage = page + 1;
                  setPage(nextPage);

                  const qs = new URLSearchParams();
                  qs.set("page", String(nextPage));
                  qs.set("limit", String(limit));
                  const q = search.trim();
                  if (q) qs.set("q", q);
                  if (inStockOnly) qs.set("inStock", "true");
                  if (minPrice !== "" && Number.isFinite(Number(minPrice))) {
                    qs.set("minPrice", String(Number(minPrice)));
                  }
                  if (maxPrice !== "" && Number.isFinite(Number(maxPrice))) {
                    qs.set("maxPrice", String(Number(maxPrice)));
                  }

                  try {
                    setLoadingMore(true);
                    const res = await api.get(`/home/${id}?${qs.toString()}`);
                    if (res.data?.success) {
                      const next = Array.isArray(res.data.products)
                        ? res.data.products
                        : [];
                      setProducts((prev) => [...prev, ...next]);
                      setHasMore(next.length === limit);
                    } else {
                      setHasMore(false);
                    }
                  } catch (err) {
                    toast.error(
                      err.response?.data?.message || "Failed to load more",
                    );
                  } finally {
                    setLoadingMore(false);
                  }
                }}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParticularItem;
