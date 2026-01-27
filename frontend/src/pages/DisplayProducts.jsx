import React from "react";
import styles from "./DisplayProducts.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeItem } from "../store/cart";
import api from "../api";
import { toast, ToastContainer } from "react-toastify";

const DisplayProducts = ({ item }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart.cart);
  const cartItem = cart.find((i) => i._id === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const updateCart = async (newQty) => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    try {
      if (newQty === 0) {
        dispatch(removeItem(item._id));
      } else {
        dispatch(addToCart({ _id: item._id, quantity: newQty }));
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

  const outOfStock = item.stock === 0;

  return (
    <div className={`${styles.card} ${outOfStock ? styles.disabled : ""}`}>
      <ToastContainer autoClose={2000} />

      {/* IMAGE */}
      <Link to={`/product/${item.category}/${item._id}`}>
        <img
          src={item.image}
          alt={item.name}
          className={styles.image}
          onError={(e) => {
            e.target.src = "/placeholder.png";
          }}
        />
      </Link>

      {/* OUT OF STOCK BADGE */}
      {outOfStock && <span className={styles.outOfStock}>Out of Stock</span>}

      {/* INFO */}
      <div className={styles.info}>
        <p className={styles.name}>{item.name}</p>
        <p className={styles.packSize}>{item.packSize}</p>

        <div className={styles.bottom}>
          {/* PRICE + STOCK */}
          <div>
            <span className={styles.price}>₹{item.price}</span>
            <div>
              {item.stock === 0 ? (
                <span className={styles.stockOut}>Out of stock</span>
              ) : item.stock <= 5 ? (
                <span className={styles.stockLow}>Only {item.stock} left</span>
              ) : (
                <span className={styles.stockOk}> In stock</span>
              )}
            </div>
          </div>

          {/* ACTION */}
          {outOfStock ? (
            <button className={styles.disabledBtn} disabled>
              Unavailable
            </button>
          ) : quantity === 0 ? (
            <button className={styles.addBtn} onClick={() => updateCart(1)}>
              Add
            </button>
          ) : (
            <div className={styles.qtyBox}>
              <button onClick={() => updateCart(quantity - 1)}>−</button>
              <span>{quantity}</span>
              <button onClick={() => updateCart(quantity + 1)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayProducts;
