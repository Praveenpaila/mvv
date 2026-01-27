import React, { useEffect, useState } from "react";
import { addToCart, removeItem } from "../store/cart";
import { useDispatch } from "react-redux";
import styles from "./DispayCartItems.module.css";
import api from "../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const DispayCartItems = ({ item, onPriceChange }) => {
  const [quantity, setQuantity] = useState(item.quantity);
  const [product, setProduct] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔹 sync local quantity with redux item
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  // 🔹 fetch product data (image, price, name)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/cart/${item._id}`);
        if (res.data?.product) {
          setProduct(res.data.product);
          onPriceChange(item._id, res.data.product.price, item.quantity);
        }
      } catch {
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

    try {
      setQuantity(newQty);

      if (newQty === 0) {
        dispatch(removeItem(item._id));
        onPriceChange(item._id, 0, 0);
      } else {
        dispatch(addToCart({ _id: item._id, quantity: newQty }));
        onPriceChange(item._id, product.price, newQty);
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
    } catch {
      toast.error("Cart update failed");
    }
  };

  if (!product || quantity === 0) return null;

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
        <button onClick={() => updateCart(quantity - 1)}>-</button>
        <p>{quantity}</p>
        <button onClick={() => updateCart(quantity + 1)}>+</button>
      </div>

      <button onClick={() => updateCart(0)}>Remove</button>
    </div>
  );
};

export default DispayCartItems;
