import React from "react";
import { Navigate } from "react-router-dom";

const MerchantProtectedRoute = ({ children, token, role }) => {
  if (!token || role !== "merchant") {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default MerchantProtectedRoute;
