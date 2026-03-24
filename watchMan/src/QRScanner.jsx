import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import styles from "./QRScanner.module.css";

export default function QRScanner({ onScan }) {
  const [scanned, setScanned] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scanned) {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch(() => {})
          .finally(() => {
            scannerRef.current = null;
          });
      }
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "watchman-qr-reader",
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
      },
      false,
    );

    scannerRef.current = scanner;

    const onSuccess = (decodedText) => {
      if (!decodedText || scanned) return;
      setScanned(true);
      onScan(decodedText);
    };

    const onError = () => {
      // ignore noisy scan errors
    };

    scanner.render(onSuccess, onError);

    return () => {
      scanner
        .clear()
        .catch(() => {})
        .finally(() => {
          if (scannerRef.current === scanner) scannerRef.current = null;
        });
    };
  }, [onScan, scanned]);

  return (
    <div className={styles.scannerBox}>
      <h3>Scan Delivery QR</h3>
      <div id="watchman-qr-reader" className={styles.reader} />
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
