import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api";
import { toast } from "react-toastify";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const categories = useSelector((state) => state.category.category);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch orders
        const ordersRes = await api.get("/admin/orders");
        if (ordersRes.data?.success) {
          setOrders(ordersRes.data.orders || []);
        }

        // Fetch all products (we'll get them from categories)
        let allProducts = [];
        for (const cat of categories) {
          try {
            const productsRes = await api.get(`/home/${cat._id}`);
            if (productsRes.data?.success && productsRes.data.products) {
              allProducts = [...allProducts, ...productsRes.data.products];
            }
          } catch {
            // Skip if category has no products
          }
        }
        setProducts(allProducts);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [categories]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "placed" || o.orderStatus === "confirmed",
  ).length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 5).length;
  const totalCategories = categories.length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Here's an overview of your store.</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading dashboard...</div>
      ) : (
        <>
          {/* STATS CARDS */}
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

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📁</div>
              <div className={styles.statInfo}>
                <h3>{totalCategories}</h3>
                <p>Categories</p>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className={styles.section}>
            <h2>Quick Actions</h2>
            <div className={styles.actionsGrid}>
              <Link to="/admin/upload" className={styles.actionCard}>
                <div className={styles.actionIcon}>➕</div>
                <h3>Add Product</h3>
                <p>Upload a new product to your store</p>
              </Link>

              <Link to="/admin/manage" className={styles.actionCard}>
                <div className={styles.actionIcon}>✏️</div>
                <h3>Manage Products</h3>
                <p>Edit stock, prices, and product details</p>
              </Link>

              <Link to="/admin/orders" className={styles.actionCard}>
                <div className={styles.actionIcon}>📋</div>
                <h3>View Orders</h3>
                <p>Manage and track customer orders</p>
              </Link>
            </div>
          </div>

          {/* RECENT ORDERS */}
          {recentOrders.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Recent Orders</h2>
                <Link to="/admin/orders" className={styles.viewAll}>
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
                      <tr key={order._id}>
                        <td>{order._id.slice(-8)}</td>
                        <td>
                          <span
                            className={`${styles.status} ${styles[order.orderStatus]}`}
                          >
                            {order.orderStatus || "placed"}
                          </span>
                        </td>
                        <td>₹{order.totalAmount?.toLocaleString("en-IN")}</td>
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
