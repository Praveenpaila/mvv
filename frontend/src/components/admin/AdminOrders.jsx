import React, { useEffect, useState } from "react";
import styles from "./AdminOrders.module.css";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("");
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState("");
  const [orderDeliveries, setOrderDeliveries] = useState({}); // orderId -> delivery info

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/admin/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.success) {
          setOrders(res.data.orders);
          // Fetch merchant + delivery status for EVERY order (placed and confirmed)
          res.data.orders.forEach(async (order) => {
            try {
              const deliveryRes = await api.get(`/delivery/order/${order._id}`);
              if (deliveryRes.data.success) {
                setOrderDeliveries((prev) => ({
                  ...prev,
                  [order._id]: deliveryRes.data,
                }));
              }
            } catch (err) {
              // Order might have no merchant orders yet
            }
          });
        }
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    const fetchDeliveryPersons = async () => {
      try {
        const res = await api.get("/delivery/persons", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.data.success) {
          setDeliveryPersons(res.data.deliveryPersons || []);
          if (!res.data.deliveryPersons || res.data.deliveryPersons.length === 0) {
            toast.warning("No delivery persons found. Please add delivery persons first.");
          }
        }
      } catch (err) {
        console.error("Failed to load delivery persons:", err);
        toast.error("Failed to load delivery persons list");
      }
    };

    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await api.put(
        `/admin/orders/${orderId}`,
        { orderStatus: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(res.data.message || "Order status updated");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: status } : o,
        ),
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const assignDelivery = async (orderId) => {
    if (!selectedDeliveryPerson) {
      toast.error("Please select a delivery person");
      return;
    }
    try {
      const res = await api.post(
        "/delivery/assign",
        {
          orderId,
          deliveryPersonId: selectedDeliveryPerson,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.data.success) {
        toast.success("Delivery assigned successfully!");
        // Fetch updated delivery status
        const deliveryRes = await api.get(`/delivery/order/${orderId}`);
        if (deliveryRes.data.success) {
          setOrderDeliveries((prev) => ({
            ...prev,
            [orderId]: deliveryRes.data,
          }));
        }
        setAssigningOrderId(null);
        setSelectedDeliveryPerson("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign delivery");
    }
  };

  if (loading) return <p className={styles.loading}>Loading orders…</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}> Customer Orders</h2>
      <ToastContainer></ToastContainer>
      {orders.map((order) => (
        <div className={styles.orderCard} key={order._id}>
          {/* HEADER */}
          <div className={styles.header}>
            <div>
              <p className={`${styles.status} ${styles[order.orderStatus]}`}>
                {order.orderStatus.replaceAll("_", " ")}
              </p>
              <p className={styles.date}>
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <span className={styles.amount}>₹{order.totalAmount}</span>
          </div>

          {/* ITEMS */}
          <div className={styles.items}>
            {Object.values(order.items).map((item, idx) => (
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
          <div className={styles.address}>
            <strong>Address:</strong> {order.address.firstName},{" "}
            {order.address.block}, {order.address.floor}, {order.address.roomNo}
          </div>

          {/* MERCHANT CONFIRMATION STATUS - show for placed and confirmed when we have merchant data */}
          {orderDeliveries[order._id]?.totalMerchants > 0 && (
            <div className={styles.merchantStatusSection}>
              <strong>Merchant confirmations:</strong>
              <div className={styles.merchantStatusList}>
                {orderDeliveries[order._id].merchantStatus?.map((merchant, idx) => (
                  <div
                    key={idx}
                    className={`${styles.merchantStatusItem} ${
                      merchant.confirmed
                        ? styles.confirmed
                        : styles.pending
                    }`}
                  >
                    <span>{merchant.merchantName || "Merchant"}</span>
                    <span className={styles.merchantStatusBadge}>
                      {merchant.confirmed ? "✓ Confirmed" : "☐ Pending"}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.merchantSummary}>
                {orderDeliveries[order._id].allMerchantsConfirmed
                  ? "✅ All merchants confirmed"
                  : `${orderDeliveries[order._id].confirmedCount || 0} of ${orderDeliveries[order._id].totalMerchants} merchants confirmed`}
              </div>
            </div>
          )}

          {/* DELIVERY ASSIGNMENT - only when order is confirmed */}
          {order.orderStatus === "confirmed" && (
            <div className={styles.deliverySection}>
              {orderDeliveries[order._id]?.delivery ? (
                <div className={styles.deliveryAssigned}>
                  <strong>Assigned to:</strong>{" "}
                  {orderDeliveries[order._id].delivery.deliveryPerson?.name ||
                    "Unknown"}
                  <span className={styles.deliveryStatus}>
                    ({orderDeliveries[order._id].delivery.status.replace("_", " ")})
                  </span>
                </div>
              ) : orderDeliveries[order._id]?.allMerchantsConfirmed ? (
                <div className={styles.deliveryAssign}>
                  {assigningOrderId === order._id ? (
                    <div className={styles.assignForm}>
                      <select
                        value={selectedDeliveryPerson}
                        onChange={(e) =>
                          setSelectedDeliveryPerson(e.target.value)
                        }
                        className={styles.deliverySelect}
                        disabled={deliveryPersons.length === 0}
                      >
                        <option value="">
                          {deliveryPersons.length > 0
                            ? "Select delivery person"
                            : "No delivery persons available"}
                        </option>
                        {deliveryPersons.map((person) => (
                          <option key={person._id} value={person._id}>
                            {person.name} ({person.email}) - {person.phoneNumber}
                            {person.vehicleNumber ? ` - ${person.vehicleNumber}` : ""}
                          </option>
                        ))}
                      </select>
                      {deliveryPersons.length === 0 && (
                        <p className={styles.noDeliveryPersons}>
                          ⚠️ Please add delivery persons to the database first
                        </p>
                      )}
                      <div className={styles.assignActions}>
                        <button
                          onClick={() => assignDelivery(order._id)}
                          className={styles.assignBtn}
                          disabled={!selectedDeliveryPerson || deliveryPersons.length === 0}
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => {
                            setAssigningOrderId(null);
                            setSelectedDeliveryPerson("");
                          }}
                          className={styles.cancelBtn}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningOrderId(order._id)}
                      className={styles.assignDeliveryBtn}
                    >
                      Assign Delivery Person
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.deliveryWaiting}>
                  ⏳ Assign only after all merchants confirm (
                  {orderDeliveries[order._id]?.confirmedCount ?? 0}/
                  {orderDeliveries[order._id]?.totalMerchants ?? 0} confirmed)
                </div>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className={styles.actions}>
            <select
              value={order.orderStatus}
              onChange={(e) => updateStatus(order._id, e.target.value)}
            >
              <option
                value="placed"
                onClick={() => {
                  setState("Placed");
                }}
              >
                Placed
              </option>
              <option
                value="confirmed"
                onClick={() => {
                  setState("Confirmed");
                }}
              >
                Confirmed
              </option>
              <option
                value="out_for_delivery"
                onClick={() => {
                  setState("Out for delivery");
                }}
              >
                Out for delivery
              </option>
              <option
                value="delivered"
                onClick={() => {
                  setState("Delivered");
                }}
              >
                Delivered
              </option>
              <option
                value="cancelled"
                onClick={() => {
                  setState("Cancelled");
                }}
              >
                Cancelled
              </option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminOrders;
