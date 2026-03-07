import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";
import { Title } from "../Title";
import styles from "./ParticularItem.module.css";
import { useSelector } from "react-redux";

const ParticularItem = () => {
  const [products, setProducts] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputsRef = useRef({});

  const items = useSelector((state) => state.product.products);

  // ✅ Sync Redux items to local state properly
  useEffect(() => {
    if (items) {
      setProducts(items);
      setLoading(false);
    }
  }, [items]);

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
      formData.append("mrp", product.mrp ?? 0); // ✅ fixed case
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
            p._id === res.data.product._id ? res.data.product : p,
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
      <Title text1="Manage" text2="Products" />

      {loading ? (
        <p className={styles.infoText}>Loading products…</p>
      ) : products.length === 0 ? (
        <p className={styles.infoText}>No products found in this category.</p>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <div key={product._id} className={styles.card}>
              <div className={styles.imageSection}>
                <div className={styles.imageBox}>
                  <img
                    src={product._preview || product.image}
                    alt={product.name}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      background: "#fafafa",
                    }}
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => {
                    fileInputsRef.current[product._id] = el;
                  }}
                  onChange={(e) =>
                    handleFileChange(product._id, e.target.files[0])
                  }
                  style={{ marginTop: "0.5rem" }}
                />
              </div>

              <div className={styles.form}>
                <label htmlFor={`name-${product._id}`} className={styles.label}>
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

                <label htmlFor={`desc-${product._id}`} className={styles.label}>
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
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
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
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: "0.5rem",
                    }}
                  >
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
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
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
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: "0.5rem",
                    }}
                  >
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
      )}
    </div>
  );
};

export default ParticularItem;
