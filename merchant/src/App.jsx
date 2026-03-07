import React, { useEffect, useCallback, useState } from "react";
import { Route, Routes } from "react-router";
import Index from "./pages/merchant/Index";
import Dashboard from "./components/admin/Dashboard";
import AdminOrders from "./components/admin/AdminOrders";
import Upload from "./components/admin/Upload";
import ParticularItem from "./components/admin/ParticularItem";
import BulkManage from "./components/admin/BulkMange";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import MerchantProtectedRoute from "./MerchantProtectedRoute";
import api from "./api";
import { useDispatch } from "react-redux";
import { add } from "./store/product";

const App = () => {
  const dispatch = useDispatch();

  // Track token and role in state
  const [token, setTokenState] = useState(
    () => localStorage.getItem("token") || "",
  );
  const [role, setRoleState] = useState(
    () => localStorage.getItem("role") || "",
  );

  // Helpers to update localStorage and state
  const setToken = useCallback((token) => {
    if (token) {
      localStorage.setItem("token", token);
      setTokenState(token);
    } else {
      localStorage.removeItem("token");
      setTokenState("");
    }
  }, []);

  const setRole = useCallback((role) => {
    if (role) {
      localStorage.setItem("role", role);
      setRoleState(role);
    } else {
      localStorage.removeItem("role");
      setRoleState("");
    }
  }, []);

  const getData = async () => {
    const res = await api.get("/merchant/stock", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.data.success) {
      dispatch(add(res.data.products));
    }
  };

  useEffect(() => {
    if (token && role === "merchant") {
      getData();
    }
    // eslint-disable-next-line
  }, [token, role]);

  return (
    <div>
      <Routes>
        <Route
          path="/merchant"
          element={
            <MerchantProtectedRoute token={token} role={role}>
              <Index setToken={setToken} setRole={setRole} />
            </MerchantProtectedRoute>
          }
        >
          <Route path="" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="manage" element={<ParticularItem />} />
          <Route path="bulkManage" element={<BulkManage />} />
        </Route>
        <Route
          path="/login"
          element={<Login setToken={setToken} setRole={setRole} />}
        />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
};

export default App;
