import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import ProductItem from "./pages/ProductItem";
import Category from "./pages/Category";
import { useDispatch } from "react-redux";
import { add } from "./store/product";
import { addCat } from "./store/category";
import { categories, products } from "./assets/assets";
import { useEffect, useState } from "react";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Address from "./pages/Address";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import BestSeller from "./pages/BestSeller";
import Search from "./pages/Search";
import Index from "./pages/admin/Index";
import Upload from "./components/admin/Upload";
import Manage from "./components/admin/Manage";
import Default from "./pages/Default";
import api from "./api";
import { toast, ToastContainer } from "react-toastify";
import { addToCart, clearCart } from "./store/cart";
import Buynow from "./pages/Buynow";
import MyOrder from "./pages/MyOrder";
import AdminOrders from "./components/admin/AdminOrders";
import Profile from "./pages/Profile";
import ParticularItem from "./components/admin/ParticularItem";
import Dashboard from "./components/admin/Dashboard";
import BulkMange from "./components/admin/BulkMange";
import Report from "./components/admin/Report";
import Checkout from "./pages/Checkout";
import ManageUsers from "./components/admin/ManageUsers";

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    dispatch(add(products));
    dispatch(addCat(categories));
  }, [dispatch]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await api.get("/home");
        if (res.data) {
          dispatch(addCat(res.data.category));
        }
      } catch (err) {
        toast.error(err?.message || "server fault");
      }
    };
    getCategories();
  }, [dispatch]);

  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch(clearCart());
        return;
      }

      try {
        const res = await api.get("/cart");

        if (res.data?.success && Array.isArray(res.data.cart)) {
          dispatch(clearCart());

          res.data.cart.forEach((item) => {
            const productId = item?.productId?._id;
            if (!productId) return;
            dispatch(
              addToCart({
                _id: productId,
                quantity: item.quantity,
              }),
            );
          });
        }
      } catch (err) {
        console.log("Cart load failed", err);
      }
    };

    loadCart();
  }, [dispatch, token]);

  useEffect(() => {
    token
      ? localStorage.setItem("token", token)
      : localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    role ? localStorage.setItem("role", role) : localStorage.removeItem("role");
  }, [role]);

  /* 🔥 AUTO LOGOUT TIMER */
  useEffect(() => {
    const expiry = localStorage.getItem("token_expiry");
    if (!expiry) return;

    const remaining = Number(expiry) - Date.now();

    if (remaining <= 0) {
      setTimeout(() => {
        setToken(null);
        setRole(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("token_expiry");
        navigate("/login", { replace: true });
      }, 0);
      return;
    }

    const timer = setTimeout(() => {
      setToken(null);
      setRole(null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("token_expiry");
      navigate("/login", { replace: true });
    }, remaining);

    return () => clearTimeout(timer);
  }, [token, navigate]);

  useEffect(() => {
    if (
      token &&
      (location.pathname.includes("login") ||
        location.pathname.includes("signup"))
    ) {
      role === "admin"
        ? navigate("/admin", { replace: true })
        : navigate("/", { replace: true });
    }

    if (token && role === "admin" && location.pathname === "/") {
      navigate("/admin", { replace: true });
    }

    if (
      !token &&
      (location.pathname.includes("cart") ||
        location.pathname.includes("address") ||
        location.pathname.includes("admin") ||
        location.pathname.includes("orders"))
    ) {
      navigate("/login", { replace: true });
    }
  }, [token, role, location.pathname, navigate]);

  return role === "admin" ? (
    <Routes>
      <Route
        path="/admin"
        element={<Index setRole={setRole} setToken={setToken} />}
      >
        <Route path="" element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="manage" element={<Manage />} />
        <Route path="manage/items/:id" element={<ParticularItem />} />
        <Route path="bulkManage" element={<BulkMange />} />
        <Route path="authorize-users" element={<Report />} />
        <Route path="users" element={<ManageUsers />}></Route>
      </Route>
      <Route
        path="/login"
        element={<Login setRole={setRole} setToken={setToken} />}
      />
      <Route
        path="/signup"
        element={<Signup setRole={setRole} setToken={setToken} />}
      />
      <Route path="*" element={<Default />} />
    </Routes>
  ) : (
    <>
      <Nav setToken={setToken} />
      <ToastContainer />
      <main style={{ paddingTop: "70px", minHeight: "100vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/:id" element={<Category />} />
          <Route path="/product/:catId/:id" element={<ProductItem />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/address" element={<Address />} />
          <Route path="/bestSeller" element={<BestSeller />} />
          <Route path="/search" element={<Search />} />
          <Route path="/buy-now" element={<Buynow />} />
          <Route path="/orders" element={<MyOrder />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/login"
            element={<Login setRole={setRole} setToken={setToken} />}
          />
          <Route
            path="/signup"
            element={<Signup setRole={setRole} setToken={setToken} />}
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<Default />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
