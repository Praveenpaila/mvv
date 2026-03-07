import React from "react";
import { Navigate } from "react-router-dom";

const DeliveryProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "deliveryPerson") {
    return <Navigate to="/delivery/login" replace />;
  }
  return children;
};

export default DeliveryProtectedRoute;
