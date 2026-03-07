import React from "react";
import { Routes, Route } from "react-router-dom";
import DeliveryDashboard from "./components/DeliveryDashboard";
import Login from "./pages/auth/Login";
import DeliveryProtectedRoute from "./DeliveryProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/delivery/login" element={<Login />} />
      <Route
        path="/delivery/dashboard"
        element={
          <DeliveryProtectedRoute>
            <DeliveryDashboard />
          </DeliveryProtectedRoute>
        }
      />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default App;
