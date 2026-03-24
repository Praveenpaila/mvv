import React, { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasNextPage, setHasNextPage] = useState(false);
  const [confirmingById, setConfirmingById] = useState({});

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasNextPage(false);

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const params = { page: 1, limit };
        if (orderStatusFilter !== "all") params.orderStatus = orderStatusFilter;

        const res = await api.cachedGet("/merchant/orders", { params });
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
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [orderStatusFilter]);

  const loadMore = async () => {
    if (loadingMore || !hasNextPage) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const params = { page: nextPage, limit };
      if (orderStatusFilter !== "all") params.orderStatus = orderStatusFilter;

      const res = await api.cachedGet("/merchant/orders", { params });
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
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleConfirmation = async (merchantOrderId) => {
    if (confirmingById[merchantOrderId]) return;
    try {
      setConfirmingById((prev) => ({ ...prev, [merchantOrderId]: true }));
      const res = await api.post(
        "/merchant/toggle-confirm",
        { merchantOrderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (res.data.success) {
        toast.success(
          res.data.confirmed
            ? "Order confirmed ✓"
            : "Order confirmation removed"
        );
        api.clearCache?.();
        setOrders((prev) =>
          prev.map((o) =>
            o.merchantOrderId === merchantOrderId
              ? { ...o, confirmed: res.data.confirmed }
              : o,
          ),
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update confirmation");
    } finally {
      setConfirmingById((prev) => ({ ...prev, [merchantOrderId]: false }));
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.loading}>Loading orders…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
      <h2 className={styles.heading}>Customer Orders</h2>
      <div className={styles.toolbar}>
        <label className={styles.toolbarLabel}>
          Status{" "}
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
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
      <ToastContainer />

      {orders.map((order) => (
        <div className={styles.orderCard} key={order.merchantOrderId}>
          {/* HEADER */}
          <div className={styles.header}>
            <div>
              <p className={`${styles.status} ${styles[order.orderStatus]}`}>
                {order.orderStatus?.replaceAll("_", " ")}
              </p>
              <p className={styles.date}>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <span className={styles.amount}>₹{order.merchantTotal}</span>
          </div>

          {/* ITEMS */}
          <div className={styles.items}>
            {order.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <img src={item.image} alt={item.name} />
                <span>{item.name}</span>
                <span>
                  {item.quantity} × ₹{item.price}
                </span>
              </div>
            ))}
          </div>

          {/* ADDRESS */}
          {order.address && (
            <div className={styles.address}>
              <strong>Address:</strong> {order.address.firstName},{" "}
              {order.address.block}, {order.address.floor},{" "}
              {order.address.roomNo}
            </div>
          )}

          {/* CONFIRMATION CHECKBOX */}
          <div className={styles.confirmationSection}>
            <label
              className={`${styles.checkboxLabel} ${
                confirmingById[order.merchantOrderId]
                  ? styles.checkboxLabelBusy
                  : ""
              }`}
            >
              <input
                type="checkbox"
                checked={order.confirmed || false}
                onChange={() => toggleConfirmation(order.merchantOrderId)}
                className={styles.confirmCheckbox}
                disabled={Boolean(confirmingById[order.merchantOrderId])}
              />
              <span className={styles.checkboxText}>
                {confirmingById[order.merchantOrderId]
                  ? "Updating..."
                  : "Confirm this order"}
              </span>
              {confirmingById[order.merchantOrderId] && (
                <span className={styles.confirmSpinner} aria-hidden="true" />
              )}
            </label>
          </div>
        </div>
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
    </div>
  );
};

export default AdminOrders;
