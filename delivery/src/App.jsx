import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import DeliveryDashboard from "./components/DeliveryDashboard";
import Login from "./pages/auth/Login";
import DeliveryProtectedRoute from "./DeliveryProtectedRoute";

const App = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
