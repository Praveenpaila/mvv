import React, { useEffect, useMemo, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

import api from "../../api";
import { Title } from "../Title";
import styles from "./ParticularItem.module.css";

const snapshotOf = (p) => ({
  name: String(p?.name || ""),
  description: String(p?.description || ""),
  packSize: String(p?.packSize || ""),
  price: Number(p?.price ?? 0),
  mrp: Number(p?.mrp ?? 0),
  stock: Number(p?.stock ?? 0),
  image: String(p?.image || ""),
});

const isDirtyComparedToSnapshot = (p, snap) => {
  if (!snap) return false;
  if (p?._localFile) return true;
  if (String(p?.name || "") !== snap.name) return true;
  if (String(p?.description || "") !== snap.description) return true;
  if (String(p?.packSize || "") !== snap.packSize) return true;
  if (Number(p?.price ?? 0) !== snap.price) return true;
  if (Number(p?.mrp ?? 0) !== snap.mrp) return true;
  if (Number(p?.stock ?? 0) !== snap.stock) return true;
  if (String(p?.image || "") !== snap.image) return true;
  return false;
};

const ParticularItem = () => {
  const [products, setProducts] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const originalsByIdRef = useRef({});
  const fileInputsRef = useRef({});

  const items = useSelector((state) => state.product.products);

  // Optional: render immediately from Redux if it is already hydrated.
  useEffect(() => {
    if (Array.isArray(items) && items.length && products.length === 0) {
      setProducts(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Reset pagination when filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, inStockOnly, minPrice, maxPrice, sort, limit]);

  const dirtyCount = useMemo(
    () =>
      Array.isArray(products) ? products.filter((p) => p?._dirty).length : 0,
    [products],
  );

  const discardAllLocalChanges = () => {
    setProducts((prev) => {
      (prev || []).forEach((p) => {
        if (p?._preview && String(p._preview).startsWith("blob:")) {
          try {
            URL.revokeObjectURL(p._preview);
          } catch {
            // ignore
          }
        }
      });
      return [];
    });
    originalsByIdRef.current = {};
  };

  const confirmDiscardIfDirty = () => {
    if (dirtyCount === 0) return true;
    const ok = window.confirm(
      "You have unsaved changes. Continue and discard them?",
    );
    if (ok) discardAllLocalChanges();
    return ok;
  };

  const mergeFromServer = (prev, incoming, { replace }) => {
    const prevById = new Map((prev || []).map((p) => [p._id, p]));
    const out = replace ? [] : [...(prev || [])];

    incoming.forEach((sp) => {
      const existing = prevById.get(sp._id);
      if (existing && existing._dirty) {
        if (replace) out.push(existing);
        return;
      }

      originalsByIdRef.current[sp._id] = snapshotOf(sp);

      const next = {
        ...sp,
        _dirty: false,
        _localFile: null,
        _preview: null,
      };

      if (replace) {
        out.push(next);
        return;
      }

      if (!existing) {
        out.push(next);
        return;
      }

      const idx = out.findIndex((p) => p._id === sp._id);
      if (idx >= 0) out[idx] = next;
    });

    return out;
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoadError("");
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const q = debouncedSearch.trim();
        const params = {
          page,
          limit,
          q: q || undefined,
          inStock: inStockOnly ? "true" : undefined,
          minPrice: minPrice !== "" ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
          sort: sort || undefined,
        };

        const res = await api.cachedGet(
          "/merchant/stock",
          { params },
          { ttlMs: 15_000 },
        );

        if (cancelled) return;

        const list = Array.isArray(res.data?.products) ? res.data.products : [];
        const pagination = res.data?.pagination || null;

        setTotal(Number(res.data?.total ?? list.length));
        setHasNext(Boolean(pagination?.hasNext));
        setProducts((prev) =>
          mergeFromServer(prev, list, { replace: page === 1 }),
        );
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.response?.data?.message || "Failed to load products");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    limit,
    debouncedSearch,
    inStockOnly,
    minPrice,
    maxPrice,
    sort,
  ]);

  const handleChange = (productId, field, value) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p._id !== productId) return p;
        const next = { ...p, [field]: value };
        const snap = originalsByIdRef.current[productId];
        next._dirty = isDirtyComparedToSnapshot(next, snap);
        return next;
      }),
    );
  };

  const handleFileChange = (productId, file) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p._id !== productId) return p;

        if (p._preview && String(p._preview).startsWith("blob:")) {
          try {
            URL.revokeObjectURL(p._preview);
          } catch {
            // ignore
          }
        }

        const next = {
          ...p,
          _localFile: file || null,
          _preview: file ? URL.createObjectURL(file) : null,
        };
        const snap = originalsByIdRef.current[productId];
        next._dirty = isDirtyComparedToSnapshot(next, snap);
        return next;
      }),
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
      formData.append("mrp", product.mrp ?? 0);
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
      api.clearCache();

      if (res.data?.product) {
        originalsByIdRef.current[res.data.product._id] = snapshotOf(
          res.data.product,
        );

        setProducts((prev) =>
          prev.map((p) =>
            p._id === res.data.product._id
              ? {
                  ...res.data.product,
                  _preview: null,
                  _localFile: null,
                  _dirty: false,
                }
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
      api.clearCache();
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
              onChange={(e) => {
                const next = e.target.value;
                if (next !== search && !confirmDiscardIfDirty()) return;
                setSearch(next);
              }}
              placeholder="Search product name..."
              aria-label="Search products"
            />
          </div>

          <div className={styles.filters}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  const next = e.target.checked;
                  if (next !== inStockOnly && !confirmDiscardIfDirty()) return;
                  setInStockOnly(next);
                }}
              />
              In stock
            </label>

            <input
              className={styles.num}
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => {
                const next = e.target.value;
                if (next !== minPrice && !confirmDiscardIfDirty()) return;
                setMinPrice(next);
              }}
              placeholder="Min Rs."
              aria-label="Minimum price"
            />
            <input
              className={styles.num}
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => {
                const next = e.target.value;
                if (next !== maxPrice && !confirmDiscardIfDirty()) return;
                setMaxPrice(next);
              }}
              placeholder="Max Rs."
              aria-label="Maximum price"
            />

            <select
              className={styles.select}
              value={sort}
              onChange={(e) => {
                const next = e.target.value;
                if (next !== sort && !confirmDiscardIfDirty()) return;
                setSort(next);
              }}
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

            <select
              className={styles.select}
              value={String(limit)}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (next !== limit && !confirmDiscardIfDirty()) return;
                setLimit(next);
              }}
              aria-label="Products per page"
              title="Products per page"
            >
              <option value="12">12 / page</option>
              <option value="24">24 / page</option>
              <option value="48">48 / page</option>
            </select>
          </div>
        </div>

        <div className={styles.meta}>
          <span className={styles.count}>
            Showing {products.length} of {total}
          </span>
          <div className={styles.metaRight}>
            {dirtyCount > 0 && (
              <span className={styles.dirtyPill}>Unsaved: {dirtyCount}</span>
            )}
            <button
              type="button"
              className={styles.clear}
              onClick={() => {
                if (!confirmDiscardIfDirty()) return;
                setSearch("");
                setInStockOnly(false);
                setMinPrice("");
                setMaxPrice("");
                setSort("newest");
                setLimit(12);
                api.clearCache();
                setPage(1);
              }}
            >
              Reset
            </button>
            <button
              type="button"
              className={styles.refresh}
              onClick={() => {
                if (!confirmDiscardIfDirty()) return;
                api.clearCache();
                setPage(1);
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className={styles.infoText}>Loading products...</p>
      ) : loadError ? (
        <div className={styles.infoBox}>
          <p className={styles.infoText}>{loadError}</p>
          <button
            type="button"
            className={styles.moreBtn}
            onClick={() => {
              api.clearCache();
              setPage(1);
            }}
          >
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className={styles.infoText}>No products found.</p>
      ) : (
        <>
          <div className={styles.grid}>
            {products.map((product) => (
              <div key={product._id} className={styles.card}>
                <div className={styles.imageSection}>
                  <div className={styles.imageBox}>
                    <img
                      src={product._preview || product.image || ""}
                      alt={product.name || "Product image"}
                      loading="lazy"
                    />
                  </div>

                  <div className={styles.fileRow}>
                    <input
                      id={`file-${product._id}`}
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
                    <label
                      className={styles.fileLabel}
                      htmlFor={`file-${product._id}`}
                    >
                      Change image
                    </label>
                  </div>
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
                    className={styles.input}
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
                    className={styles.textarea}
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
                        className={styles.input}
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
                        className={styles.input}
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
                        className={styles.input}
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
                        className={styles.input}
                        type="number"
                        value={product.mrp ?? 0}
                        onChange={(e) =>
                          handleChange(product._id, "mrp", Number(e.target.value))
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
                      disabled={savingId === product._id || !product._dirty}
                      onClick={() => handleSave(product)}
                      title={product._dirty ? "Save changes" : "No changes to save"}
                    >
                      {savingId === product._id ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasNext && (
            <div className={styles.more}>
              <button
                type="button"
                className={styles.moreBtn}
                disabled={loadingMore}
                onClick={() => setPage((p) => p + 1)}
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
