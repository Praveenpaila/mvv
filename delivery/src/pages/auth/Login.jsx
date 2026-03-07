import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Login.module.css";

const Login = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const formData = {
        email,
        password,
      };
      const res = await api.post("/auth/login", formData);
      if (res.data?.success) {
        if (res.data.user.role === "deliveryPerson") {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("role", res.data.user.role);
          localStorage.setItem("userName", res.data.user.userName);
          navigate("/delivery/dashboard");
        } else {
          toast.error("Access denied: Only delivery personnel can login here");
        }
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server not connected");
    }
  };

  return (
    <div className={styles.page}>
      <ToastContainer autoClose={2000} position="top-center" />
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Delivery Portal</h1>
          <p className={styles.subtitle}>Sign in to manage your deliveries</p>
        </div>

        <form onSubmit={onSubmitHandler} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              ref={emailRef}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              ref={passwordRef}
              required
            />
          </div>

          <button type="submit" className={styles.submit}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
