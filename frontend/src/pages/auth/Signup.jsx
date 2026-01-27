import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Title } from "../../components/Title";
import styles from "./Signup.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api";
const Signup = ({ setToken, setRole }) => {
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  // const nameRef = useRef(null);
  // const blockRef = useRef(null);
  // const floorRef = useRef(null);
  // const roomRef = useRef(null);
  const phoneRef = useRef(null);
  const passwordRef = useRef(null);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        userName: usernameRef.current.value,
        email: emailRef.current.value,
        // name: nameRef.current.value,
        // block: blockRef.current.value,
        // floor: floorRef.current.value,
        // roomNo: roomRef.current.value,
        phoneNumber: phoneRef.current.value,
        password: passwordRef.current.value,
      };
      const res = await api.post("/auth/signup", formData);
      if (res.data?.success) {
        setRole(res.data.user.role);
        setToken(res.data.token);
        toast.success(res.data.message || "signup successful");
      } else {
        toast.error(res.data?.message || "signup not successful");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "server not connected");
    }
  };

  return (
    <div className={styles.page}>
      <ToastContainer autoClose={2000} />
      <div className={styles.card}>
        <Title text1="Signup" text2="" />

        <form onSubmit={onSubmitHandler} className={styles.form}>
          <input type="text" placeholder="Username" ref={usernameRef} />
          <input type="email" placeholder="Email" ref={emailRef} />
          {/* <input type="text" placeholder="Full Name" ref={nameRef} /> */}

          {/* <div className={styles.row}>
            <input type="text" placeholder="Block" ref={blockRef} />
            <input type="text" placeholder="Floor" ref={floorRef} />
          </div> */}

          {/* <input type="text" placeholder="Room No" ref={roomRef} /> */}
          <input type="text" placeholder="Phone Number" ref={phoneRef} />
          <input type="password" placeholder="Password" ref={passwordRef} />

          <button type="submit" className={styles.submit}>
            Signup
          </button>
        </form>

        <div className={styles.footer}>
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
