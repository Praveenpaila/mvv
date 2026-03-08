import { useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api";
import styles from "./BulkManage.module.css"; // import CSS module

const BulkManage = () => {
  const fileRef = useRef();

  const handleUpload = async () => {
    const file = fileRef.current.files[0];

    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      toast.error("Only CSV files allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/bulkManage", formData);

      if (res.data.success) {
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <div className={styles.bulkWrapper}>
      {" "}
      {/* apply class */}
      <ToastContainer />
      <input type="file" ref={fileRef} accept=".csv" />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default BulkManage;
