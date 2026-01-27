import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ProductItem.module.css";
import DisplayProducts from "./DisplayProducts";
import api from "../api";
import { add } from "../store/product";
import { addToCart, removeItem } from "../store/cart";
import { toast } from "react-toastify";

const ProductItem = () => {
  const { catId, id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* FETCH PRODUCTS */
  useEffect(() => {
    const getItems = async () => {
      try {
        const res = await api.get(`/home/${catId}`);
        if (res.data?.products) {
          dispatch(add(res.data.products));
        }
      } catch (err) {
        console.log(err || "error");
      }
    };
    getItems();
  }, [dispatch, catId]);

  const products = useSelector((state) => state.product.products);
  const item = products.find((p) => p._id === id);

  if (!item) {
    return <p className={styles.notFound}>Product not found</p>;
  }

  /* CART */
  const cart = useSelector((state) => state.cart.cart);
  const cartItem = cart.find((i) => i._id === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const outOfStock = item.stock === 0;

  const updateCart = async (newQty) => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if (newQty > item.stock) {
      toast.error("Stock limit reached");
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

  /* RELATED PRODUCTS */
  const relatedProducts = products.filter((p) => p._id !== item._id);

  return (
    <div className={styles.main}>
      {/* PRODUCT DETAILS */}
      <div className={styles.page}>
        <div className={styles.container}>
          {/* LEFT */}
          <div className={styles.left}>
            <img
              src={item.image}
              alt={item.name}
              onError={(e) => {
                e.target.src = "/placeholder.png";
              }}
            />
            {outOfStock && (
              <span className={styles.outOfStock}>Out of Stock</span>
            )}
          </div>

          {/* RIGHT */}
          <div className={styles.right}>
            <h1 className={styles.name}>{item.name}</h1>

            <p className={styles.rating}>⭐ {item.rating || 4.5}</p>

            <div className={styles.pack}>
              <span>Pack Size</span>
              <button>{item.packSize}</button>
            </div>

            <div className={styles.priceRow}>
              <div>
                <span className={styles.price}>₹{item.price}</span>
                <p className={styles.stock}>
                  {outOfStock
                    ? "Out of stock"
                    : item.stock <= 5
                      ? `Only ${item.stock} left`
                      : "In stock"}
                </p>
              </div>

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

            <div className={styles.description}>
              <h3>About this product</h3>
              <p>{item.description}</p>
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* RELATED PRODUCTS */}
      <section className={styles.related}>
        {relatedProducts.map((p) => (
          <DisplayProducts key={p._id} item={p} />
        ))}
      </section>
    </div>
  );
};

export default ProductItem;
