import React, { useRef, useState } from "react";
import styles from "./Report.module.css";
import api from "../../api";
import { toast, ToastContainer } from "react-toastify";
const ManageUsers = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const formData = {
      email: emailRef.current.value,
      password: passwordRef.current.value,

      role: roleRef.current.value,
    };

    try {
      const res = await api.post("/auth/admin/authorize-users", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        toast.success("User authorized successfully");
      } else {
        toast.error(res.data.message || "Authorization failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className={styles.center}>
      <ToastContainer></ToastContainer>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          ref={emailRef}
          placeholder="Enter Email"
          className={styles.input}
          required
        />

        <input
          type="password"
          ref={passwordRef}
          placeholder="Enter Password"
          className={styles.input}
          required
        />

        <select ref={roleRef} className={styles.select}>
          <option value="merchant">Merchant</option>
          <option value="security">Security</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="submit"
          value={loading ? "Submitting..." : "Submit"}
          className={styles.button}
          disabled={loading}
        />
      </form>
    </div>
  );
};

export default ManageUsers;
