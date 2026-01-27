import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Address.module.css";
import { toast, ToastContainer } from "react-toastify";
import api from "../api";

const Address = () => {
  const firstNameRef = useRef();
  const secondNameRef = useRef();
  const emailRef = useRef();
  const blockRef = useRef();
  const floorRef = useRef();
  const roomRef = useRef();
  const phoneRef = useRef();

  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    const formData = {
      firstName: firstNameRef.current.value,
      secondName: secondNameRef.current.value,
      email: emailRef.current.value,
      block: blockRef.current.value,
      floor: floorRef.current.value,
      roomNo: roomRef.current.value,
      phoneNumber: phoneRef.current.value,
    };

    try {
      await api.post("/address", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Address saved");
      navigate("/cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className={styles.page}>
      <ToastContainer autoClose={2000} />

      <div className={styles.left}>
        <div className={styles.form}>
          <form onSubmit={onSubmitHandler}>
            <div className={styles.name}>
              <input
                type="text"
                placeholder="First Name"
                ref={firstNameRef}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                ref={secondNameRef}
                required
              />
            </div>

            <input type="email" placeholder="Email" ref={emailRef} required />

            <div className={styles.bf}>
              <input type="text" placeholder="Block" ref={blockRef} required />
              <input type="text" placeholder="Floor" ref={floorRef} required />
            </div>

            <input type="text" placeholder="Room No" ref={roomRef} required />
            <input
              type="text"
              placeholder="Phone Number"
              ref={phoneRef}
              required
            />

            <button type="submit" className={styles.submit}>
              Save Address
            </button>
          </form>
        </div>
      </div>

      <div className={styles.right}></div>
    </div>
  );
};

export default Address;
