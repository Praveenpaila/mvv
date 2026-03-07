import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Nav from "../../components/admin/Nav";
import SideBar from "../../components/admin/SideBar";
import styles from "./Index.module.css";

const Index = ({ setToken, setRole }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Nav
        setRole={setRole}
        setToken={setToken}
        toggleSidebar={() => setOpen(!open)}
      />

      <SideBar open={open} />

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Index;
