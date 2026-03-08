import React, { useState } from "react";
import QRScanner from "./QRScanner";
import styles from "./App.module.css";

const baseURL = import.meta.env.VITE_WATCHMAN_API_URL || "/api/watchman";

const loginApi = async (username, password) => {
  try {
    const res = await fetch(`${baseURL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.role === "security") {
      return { success: true, role: data.role };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
};

const fetchDeliveryPerson = async (qrValue) => {
  try {
    const res = await fetch(`${baseURL}/scan-qr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrValue }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    const res = await loginApi(username, password);
    if (res.success && res.role === "security") {
      setLoggedIn(true);
      setRole(res.role);
    } else {
      setLoginError("Invalid credentials or not authorized.");
    }
  };

  const handleScan = async (qrValue) => {
    setScanError("");
    setScanResult(null);
    const person = await fetchDeliveryPerson(qrValue);
    if (person) {
      setScanResult(person);
    } else {
      setScanError("No delivery person found for this QR.");
    }
  };

  if (!loggedIn) {
    return (
      <div className={styles.loginBox}>
        <h2>Watchman Portal Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        {loginError && <p className={styles.error}>{loginError}</p>}
      </div>
    );
  }

  return (
    <div className={styles.portal}>
      <h2>Welcome, Watchman</h2>
      <p>Role: {role}</p>
      <QRScanner onScan={handleScan} />
      {scanResult && (
        <div className={styles.resultBox}>
          <h3>Delivery Person Found</h3>
          {scanResult.image ? (
            <img
              src={scanResult.image}
              alt={scanResult.name}
              className={styles.personImg}
            />
          ) : (
            <div className={styles.personPlaceholder} aria-hidden="true" />
          )}
          <p>Name: {scanResult.name}</p>
        </div>
      )}
      {scanError && <p className={styles.error}>{scanError}</p>}
    </div>
  );
}
