import React, { useState } from "react";
import { QrScanner } from "@react-qr-scanner/react";
import styles from "./QRScanner.module.css";

export default function QRScanner({ onScan }) {
  const [scanned, setScanned] = useState(false);

  const handleScan = (result) => {
    if (result && result.text && !scanned) {
      setScanned(true);
      onScan(result.text);
    }
  };

  return (
    <div className={styles.scannerBox}>
      <h3>Scan Delivery QR</h3>
      <QrScanner
        onDecode={handleScan}
        constraints={{ facingMode: "environment" }}
        style={{ width: "100%" }}
      />
      <button
        onClick={() => setScanned(false)}
        style={{ marginTop: "10px" }}
      >
        Reset Scanner
      </button>
      <p className={styles.info}>
        * Hold the QR code in front of the camera.
      </p>
    </div>
  );
}
