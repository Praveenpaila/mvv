import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "../../components/admin/Nav";
import SideBar from "../../components/admin/SideBar";
import styles from "./Index.module.css";

const Index = ({ setToken, setRole }) => {
  return (
    <div className={styles.layout}>
      {/* TOP NAVBAR */}
      <Nav setRole={setRole} setToken={setToken} />

      {/* SIDEBAR */}
      <SideBar />

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Index;
