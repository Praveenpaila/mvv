import React, { useRef, useState } from "react";
import { asset } from "../../assets/assets";
import styles from "./Upload.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";

const Upload = () => {
  const [image, setImage] = useState(asset.Upload); // preview
  const [file, setFile] = useState(null); // actual file
  const fileRef = useRef(null);

  const nameRef = useRef(null);
  const desRef = useRef(null);
  const catRef = useRef(null);
  const packRef = useRef(null);
  const priceRef = useRef(null);
  const MrpRef = useRef(null);
  const discountRef = useRef(null);
  const stockRef = useRef(null);

  const removeImage = (e) => {
    e.stopPropagation();
    setImage(asset.Upload);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmitHandler = async () => {
    try {
      if (!file) {
        toast.error("Please upload an image");
        return;
      }

      const formData = new FormData();

      // IMAGE
      formData.append("image", file);

      // DATA
      formData.append("name", nameRef.current.value);
      formData.append("description", desRef.current.value);
      formData.append("category", catRef.current.value.toLowerCase());
      formData.append("packSize", packRef.current.value);
      formData.append("price", priceRef.current.value);
      formData.append("Mrp", MrpRef.current.value);
      formData.append("discount", discountRef.current.value);
      formData.append("stock", stockRef.current.value);

      await api.post("/add-product", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Product added successfully");

      // RESET FORM
      setImage(asset.Upload);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";

      nameRef.current.value = "";
      desRef.current.value = "";
      catRef.current.value = "";
      packRef.current.value = "";
      priceRef.current.value = "";
      MrpRef.current.value = "";
      discountRef.current.value = "";
      stockRef.current.value = "";
    } catch (err) {
      toast.error(err.response?.data?.message || "Server failed");
    }
  };

  return (
    <div className={styles.page}>
      <ToastContainer autoClose={2000} />

      <div className={styles.card}>
        {/* IMAGE INPUT */}
        <label htmlFor="upload" className={styles.imageBox}>
          {image !== asset.Upload && (
            <span className={styles.remove} onClick={removeImage}>
              ×
            </span>
          )}

          <img src={image} alt="Product" />
          <span className={styles.imageHint}>Upload image</span>
        </label>

        <input
          ref={fileRef}
          type="file"
          id="upload"
          hidden
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) {
              setFile(f);
              setImage(URL.createObjectURL(f));
            }
          }}
        />

        {/* FORM */}
        <div className={styles.form}>
          <input ref={nameRef} placeholder="Product Name" />
          <textarea ref={desRef} placeholder="Description" />

          <div className={styles.row}>
            <input ref={catRef} placeholder="Category" />
            <input ref={packRef} placeholder="Pack Size (1 kg)" />
          </div>

          <div className={styles.row}>
            <input ref={priceRef} placeholder="Price" />
            <input ref={MrpRef} placeholder="MRP" />
          </div>

          <div className={styles.row}>
            <input ref={stockRef} placeholder="Stock" />
            <input ref={discountRef} placeholder="Discount %" />
          </div>

          <button className={styles.submit} onClick={onSubmitHandler}>
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
