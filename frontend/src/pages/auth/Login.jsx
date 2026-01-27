import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Title } from "../../components/Title";
import styles from "./Login.module.css";
import api from "../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = ({ setToken, setRole }) => {
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
      // console.log(res);
      if (res.data?.success) {
        setToken(res.data.token);
        setRole(res.data.user.role);
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.success(res.data.message || "LoginFailed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "server not connected");
    }
  };
  return (
    <div className={styles.page}>
      <ToastContainer autoClose={2000} />
      <div className={styles.card}>
        <Title text1="Login" text2="" />

        <form onSubmit={onSubmitHandler} className={styles.form}>
          <input type="email" placeholder="Email" ref={emailRef} required />

          <input
            type="password"
            placeholder="Password"
            ref={passwordRef}
            required
          />

          <button type="submit" className={styles.submit}>
            Login
          </button>

          <div className={styles.footer}>
            <span>Don’t have an account?</span>
            <Link to="/signup">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
