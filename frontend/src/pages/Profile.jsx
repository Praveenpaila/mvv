import React, { useEffect, useState } from "react";
import api from "../api";
import styles from "./Profile.module.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfileDetails = async () => {
      try {
        const res = await api.get("/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error(err || "server fault");
      } finally {
        setLoading(false);
      }
    };

    getProfileDetails();
  }, []);

  if (loading) return <p className={styles.loading}>Loading profile…</p>;
  if (!user) return <p className={styles.error}>Failed to load profile</p>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className={styles.name}>{user.userName}</h2>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>

        {/* DETAILS */}
        <div className={styles.details}>
          <div className={styles.row}>
            <span>Phone</span>
            <span>{user.phoneNumber}</span>
          </div>

          <div className={styles.row}>
            <span>Role</span>
            <span className={styles.role}>{user.role}</span>
          </div>

          <div className={styles.row}>
            <span>Joined</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
