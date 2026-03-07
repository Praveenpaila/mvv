import React, { useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../../api";

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
    formData.append("file", file); // MUST match multer field

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
    <div>
      <ToastContainer />
      <input type="file" ref={fileRef} accept=".csv" />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default BulkManage;
