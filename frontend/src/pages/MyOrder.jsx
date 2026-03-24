import React, { useEffect, useState } from "react";
import api from "../api";
import Orders from "./Orders";
import styles from "./MyOrder.module.css";

const MyOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [orderStatus, setOrderStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 8;
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasNextPage(false);

    const getOrders = async () => {
      try {
        setLoading(true);
        const params = { page: 1, limit };
        if (orderStatus !== "all") params.orderStatus = orderStatus;

        const res = await api.cachedGet("/orders", { params });

        if (res.data.success) {
          const incoming = res.data.orders || [];
          setOrders(incoming);
          setPage(1);
          const apiHasNext =
            typeof res.data.pagination?.hasNext === "boolean"
              ? res.data.pagination.hasNext
              : incoming.length === limit;
          setHasNextPage(apiHasNext);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [orderStatus]);

  const loadMore = async () => {
    if (loadingMore || !hasNextPage) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const params = { page: nextPage, limit };
      if (orderStatus !== "all") params.orderStatus = orderStatus;

      const res = await api.cachedGet("/orders", { params });
      if (res.data.success) {
        const incoming = res.data.orders || [];
        setOrders((prev) => [...prev, ...incoming]);
        setPage(nextPage);
        const apiHasNext =
          typeof res.data.pagination?.hasNext === "boolean"
            ? res.data.pagination.hasNext
            : incoming.length === limit;
        setHasNextPage(apiHasNext);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <p className={styles.loading}>Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No orders yet</h2>
        <p>Your past orders will appear here</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My Orders</h2>
      <div className={styles.toolbar}>
        <label className={styles.toolbarLabel}>
          Status{" "}
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className={styles.toolbarSelect}
          >
            <option value="all">All</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
      </div>

      {orders.map((order) => (
        <Orders key={order._id} order={order} />
      ))}

      {orders.length > 0 && hasNextPage && (
        <div className={styles.pager}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className={styles.pagerBtn}
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrder;
