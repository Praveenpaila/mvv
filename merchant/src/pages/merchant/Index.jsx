import React, { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import Nav from "../../components/admin/Nav";
import SideBar from "../../components/admin/SideBar";
import styles from "./Index.module.css";

const Index = ({ setToken, setRole }) => {
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuButtonRef = useRef(null);

  const closeSidebar = useCallback(() => setOpen(false), []);
  const toggleSidebar = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      const clickedMenuButton =
        menuButtonRef.current && menuButtonRef.current.contains(target);
      const clickedSidebar =
        sidebarRef.current && sidebarRef.current.contains(target);

      if (!clickedMenuButton && !clickedSidebar) {
        setOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  return (
    <div className={styles.layout}>
      <Nav
        setRole={setRole}
        setToken={setToken}
        toggleSidebar={toggleSidebar}
        isSidebarOpen={open}
        menuButtonRef={menuButtonRef}
      />

      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <SideBar open={open} sidebarRef={sidebarRef} onNavigate={closeSidebar} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default Index;
