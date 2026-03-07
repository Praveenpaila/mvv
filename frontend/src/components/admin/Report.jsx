import React, { useRef, useState } from "react";
import styles from "./Report.module.css";
import api from "../../api";
import { toast, ToastContainer } from "react-toastify";

const Report = () => {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const phoneRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const formData = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      phoneNumber: phoneRef.current.value,
    };

    try {
      const res = await api.post("/delivery/persons", formData, {
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
          type="text"
          ref={nameRef}
          placeholder="Name"
          className={styles.input}
          required
        />

        <input
          type="email"
          ref={emailRef}
          placeholder="Email"
          className={styles.input}
          required
        />

        <input
          type="password"
          ref={passwordRef}
          placeholder="Password"
          className={styles.input}
          required
        />

        <input
          type="tel"
          ref={phoneRef}
          placeholder="Phone Number"
          className={styles.input}
          required
        />

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

export default Report;
