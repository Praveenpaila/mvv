import React, { useEffect, useState } from "react";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./DeliveryDashboard.module.css";

const DeliveryDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 8;
  const [hasNextPage, setHasNextPage] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phoneNumber: "",
    vehicleNumber: "",
    isActive: true,
  });
  const userName = localStorage.getItem("userName") || "Rider";

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setDeliveries([]);
    fetchDeliveries({ nextPage: 1, reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/delivery/profile");
      if (res.data.success) {
        setProfile(res.data.deliveryPerson);
        setProfileForm({
          name: res.data.deliveryPerson.name,
          phoneNumber: res.data.deliveryPerson.phoneNumber,
          vehicleNumber: res.data.deliveryPerson.vehicleNumber || "",
          isActive: res.data.deliveryPerson.isActive,
        });
      }
    } catch {
      console.error("Failed to fetch profile");
    }
  };

  const updateProfile = async () => {
    try {
      setProfileLoading(true);
      const res = await api.put("/delivery/profile", profileForm);
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setProfile(res.data.deliveryPerson);
        setShowProfile(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDeliveries = async ({ nextPage, reset } = {}) => {
    const pageToLoad = nextPage || page;
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pageToLoad, limit };
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.cachedGet("/delivery/my", { params });
      if (res.data.success) {
        const incoming = res.data.deliveries || [];
        setDeliveries((prev) => (reset ? incoming : [...prev, ...incoming]));
        setPage(pageToLoad);

        const apiHasNext =
          typeof res.data.pagination?.hasNext === "boolean"
            ? res.data.pagination.hasNext
            : incoming.length === limit;
        setHasNextPage(apiHasNext);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch deliveries");
    } finally {
      if (reset) setLoading(false);
      setLoadingMore(false);
    }
  };

  const updateStatus = async (deliveryId, status) => {
    try {
      setUpdating(deliveryId);
      const res = await api.put(`/delivery/${deliveryId}`, { status });
      if (res.data.success) {
        toast.success(`Status updated to ${status.replace("_", " ")}`);
        api.clearCache?.();
        setDeliveries([]);
        await fetchDeliveries({ nextPage: 1, reset: true });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update status"
      );
    } finally {
      setUpdating(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    window.location.href = "/delivery/login";
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      assigned: styles.badgeAssigned,
      picked_up: styles.badgePickedUp,
      out_for_delivery: styles.badgeOutForDelivery,
      delivered: styles.badgeDelivered,
    };
    return statusMap[status] || styles.badgeDefault;
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      assigned: "Assigned",
      picked_up: "Picked Up",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
    };
    return labelMap[status] || status;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      assigned: "picked_up",
      picked_up: "out_for_delivery",
      out_for_delivery: "delivered",
    };
    return statusFlow[currentStatus];
  };

  const getStats = () => {
    const total = deliveries.length;
    const active = deliveries.filter(
      (d) => d.status !== "delivered"
    ).length;
    const completed = deliveries.filter(
      (d) => d.status === "delivered"
    ).length;
    return { total, active, completed };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ToastContainer autoClose={2000} position="top-right" />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.welcomeText}>Welcome back, {userName}!</h1>
            <p className={styles.subtitle}>Manage your delivery assignments</p>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={styles.profileBtn}
            >
              {showProfile ? "Hide Profile" : "My Profile"}
            </button>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      {showProfile && profile && (
        <div className={styles.profileSection}>
          <h2 className={styles.profileTitle}>My Profile</h2>
          <div className={styles.profileForm}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input
                type="text"
                value={profileForm.phoneNumber}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    phoneNumber: e.target.value,
                  })
                }
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Vehicle Number</label>
              <input
                type="text"
                value={profileForm.vehicleNumber}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    vehicleNumber: e.target.value,
                  })
                }
                placeholder="Enter vehicle number"
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={profileForm.isActive}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      isActive: e.target.checked,
                    })
                  }
                  className={styles.checkbox}
                />
                <span>Active (Available for assignments)</span>
              </label>
              <p className={styles.helpText}>
                {profileForm.isActive
                  ? "✓ You will receive new delivery assignments"
                  : "⚠ You will NOT receive new assignments when inactive"}
              </p>
            </div>
            <button
              onClick={updateProfile}
              disabled={profileLoading}
              className={styles.saveBtn}
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.total}</h3>
            <p className={styles.statLabel}>Total Assigned</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🚚</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.active}</h3>
            <p className={styles.statLabel}>Active Deliveries</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3 className={styles.statValue}>{stats.completed}</h3>
            <p className={styles.statLabel}>Completed Today</p>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className={styles.deliveriesSection}>
        <h2 className={styles.sectionTitle}>My Deliveries</h2>
        <div className={styles.toolbar}>
          <label className={styles.toolbarLabel}>
            Status{" "}
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className={styles.toolbarSelect}
            >
              <option value="all">All</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </label>
        </div>
        {deliveries.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h3>No deliveries assigned</h3>
            <p>You don't have any deliveries assigned at the moment.</p>
          </div>
        ) : (
          <div className={styles.deliveriesGrid}>
            {deliveries.map((delivery) => {
              const order = delivery.orderId;
              const nextStatus = getNextStatus(delivery.status);
              const isUpdating = updating === delivery._id;

              return (
                <div key={delivery._id} className={styles.deliveryCard}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3 className={styles.orderId}>
                        Order #{order?._id?.slice(-8) || "N/A"}
                      </h3>
                      <span
                        className={`${styles.statusBadge} ${getStatusBadgeClass(
                          delivery.status
                        )}`}
                      >
                        {getStatusLabel(delivery.status)}
                      </span>
                    </div>
                    <div className={styles.date}>
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    {/* Customer Info */}
                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionLabel}>Customer</h4>
                      <p className={styles.infoText}>
                        {order?.user?.userName || "N/A"}
                      </p>
                      <p className={styles.infoText}>
                        {order?.user?.phoneNumber || "N/A"}
                      </p>
                    </div>

                    {/* Address */}
                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionLabel}>Delivery Address</h4>
                      <p className={styles.addressText}>
                        Block {order?.address?.block || "N/A"}, Floor{" "}
                        {order?.address?.floor || "N/A"}, Room{" "}
                        {order?.address?.roomNo || "N/A"}
                      </p>
                      {order?.address?.firstName && (
                        <p className={styles.infoText}>
                          {order.address.firstName} {order.address.secondName}
                        </p>
                      )}
                    </div>

                    {/* Items */}
                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionLabel}>Items</h4>
                      <div className={styles.itemsList}>
                        {order?.items?.map((item, idx) => (
                          <div key={idx} className={styles.itemRow}>
                            <span className={styles.itemName}>
                              {item.name} x{item.quantity}
                            </span>
                            <span className={styles.itemMerchant}>
                              {item.merchantId?.userName || "Merchant"}
                            </span>
                            <span className={styles.itemPrice}>
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className={styles.totalSection}>
                      <span className={styles.totalLabel}>Total Amount:</span>
                      <span className={styles.totalAmount}>
                        ₹{order?.totalAmount?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {nextStatus && (
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => updateStatus(delivery._id, nextStatus)}
                        disabled={isUpdating}
                        className={styles.actionBtn}
                      >
                        {isUpdating
                          ? "Updating..."
                          : `Mark as ${getStatusLabel(nextStatus)}`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {deliveries.length > 0 && hasNextPage && (
          <div className={styles.pager}>
            <button
              className={`${styles.actionBtn} ${styles.pagerBtn}`}
              onClick={() =>
                fetchDeliveries({ nextPage: page + 1, reset: false })
              }
              disabled={loadingMore}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
