import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch merchant orders
        const ordersRes = await api.get("/merchant/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (ordersRes.data?.success) {
          setOrders(ordersRes.data.orders || []);
        }

        // Fetch merchant products directly
        const productsRes = await api.get("/merchant/stock", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (productsRes.data?.success) {
          setProducts(productsRes.data.products || []);
        }
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "placed" || o.orderStatus === "confirmed",
  ).length;

  const totalProducts = products.length;

  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 5).length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Merchant Dashboard</h1>
        <p>Welcome back! Here's an overview of your store.</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading dashboard...</div>
      ) : (
        <>
          {/* STATS */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statInfo}>
                <h3>{totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏳</div>
              <div className={styles.statInfo}>
                <h3>{pendingOrders}</h3>
                <p>Pending Orders</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🛍️</div>
              <div className={styles.statInfo}>
                <h3>{totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚠️</div>
              <div className={styles.statInfo}>
                <h3>{lowStockProducts}</h3>
                <p>Low Stock Items</p>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className={styles.section}>
            <h2>Quick Actions</h2>
            <div className={styles.actionsGrid}>
              <Link to="/merchant/upload" className={styles.actionCard}>
                ➕ Add Product
              </Link>

              <Link to="/merchant/manage" className={styles.actionCard}>
                ✏️ Manage Products
              </Link>

              <Link to="/merchant/orders" className={styles.actionCard}>
                📋 View Orders
              </Link>
            </div>
          </div>

          {/* RECENT ORDERS */}
          {recentOrders.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Recent Orders</h2>
                <Link to="/merchant/orders" className={styles.viewAll}>
                  View All →
                </Link>
              </div>

              <div className={styles.ordersTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.merchantOrderId}>
                        <td>{order.orderId?.slice(-8)}</td>
                        <td>
                          <span
                            className={`${styles.status} ${styles[order.orderStatus]}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>₹{order.merchantTotal?.toLocaleString("en-IN")}</td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
