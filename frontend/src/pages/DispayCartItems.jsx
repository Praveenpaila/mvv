import React, { useEffect, useState } from "react";
import { addToCart, removeItem } from "../store/cart";
import { useDispatch } from "react-redux";
import styles from "./DispayCartItems.module.css";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const DispayCartItems = ({ item, onPriceChange }) => {
  // Remove local quantity state, use item.quantity directly
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadError(null);
        const res = await api.get(`/cart/${item._id}`);
        if (res.data?.product) {
          const fetchedProduct = res.data.product;
          setProduct(fetchedProduct);

          // Notify parent component about price change
          if (onPriceChange) {
            onPriceChange(item._id, fetchedProduct.price, item.quantity);
          }
        }
      } catch (err) {
        console.error("Product fetch error:", err);
        setLoadError("Failed to load product");
        toast.error("Failed to load product");
      }
    };

    fetchProduct();
  }, [item._id]);

  const updateCart = async (newQty) => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if (newQty < 0) return;
    if (!product) return; // ✅ safety guard

    try {
      const price = product?.price || 0;

      if (newQty === 0) {
        dispatch(removeItem(item._id));
        if (onPriceChange) {
          onPriceChange(item._id, 0, 0);
        }
      } else {
        dispatch(addToCart({ _id: item._id, quantity: newQty }));
        if (onPriceChange) {
          onPriceChange(item._id, price, newQty);
        }
      }

      await api.post(
        "/cart",
        { id: item._id, quantity: newQty },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
    } catch (err) {
      console.error("Cart update error:", err);
      toast.error(err?.response?.data?.message || "Cart update failed");
    }
  };

  if (loadError || (!product && item.quantity > 0)) return null;
  if (item.quantity === 0) return null;
  if (!product) return null;

  return (
    <div className={styles.card}>
      <div className={styles.image}>
        <img src={product.image} alt={product.name} />
      </div>

      <div className={styles.middle}>
        <h2>{product.name}</h2>
        <p>₹{product.price}</p>
      </div>

      <div className={styles.cart}>
        <button onClick={() => updateCart(item.quantity - 1)}>-</button>
        <p>{item.quantity}</p>
        <button onClick={() => updateCart(item.quantity + 1)}>+</button>
      </div>

      <button onClick={() => updateCart(0)}>Remove</button>
    </div>
  );
};

export default DispayCartItems;
