import styles from "./Nav.module.css";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { asset } from "../assets/assets";
import { CiShoppingCart, CiSearch } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { clearCart } from "../store/cart";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";

const Nav = ({ setToken }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const debounceTimer = useRef(null);
  const profileRef = useRef(null);
  const cartCount = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  const logoutHandler = () => {
    setIsProfileOpen(false);
    localStorage.removeItem("token");
    dispatch(clearCart());
    navigate("/login");
    setToken("");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce: wait 500ms after user stops typing
    debounceTimer.current = setTimeout(() => {
      if (value.trim()) {
        navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      } else {
        // Clear search if input is empty
        navigate("/search");
      }
    }, 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Sync with URL params
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchValue(query);
  }, [searchParams]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
  }, [location.pathname]);

  return (
    <nav className={styles.nav}>
      {/* LEFT : LOGO */}
      <Link to="/" className={styles.logo}>
        <img src={asset.mkLogo} alt="MVV" />
        <span>MVV</span>
      </Link>

      {/* CENTER : SEARCH + LINKS */}
      <div className={styles.center}>
        {/* SEARCH */}
        <form className={styles.search} onSubmit={handleSearchSubmit}>
          <CiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={searchValue}
            onChange={handleSearchChange}
          />
        </form>

        {/* LINKS */}
        <div className={styles.links}>
          <Link to="/">Home</Link>
          <Link to="/bestSeller">bestSeller</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      {/* RIGHT : ICONS */}
      <div className={styles.actions}>
        {/* PROFILE */}
        <div className={styles.profile} ref={profileRef}>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            aria-label="Profile menu"
          >
            <CgProfile />
          </button>
          <div
            className={`${styles.dropdown} ${isProfileOpen ? styles.open : ""}`}
            role="menu"
          >
            <Link to="/profile" onClick={() => setIsProfileOpen(false)}>
              Profile
            </Link>
            <Link to="/orders" onClick={() => setIsProfileOpen(false)}>
              Orders
            </Link>
            <Link to="/login" onClick={logoutHandler}>
              Logout
            </Link>
          </div>
        </div>

        {/* CART */}
        <Link to="/cart" className={styles.icon}>
          <CiShoppingCart />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </Link>
      </div>
    </nav>
  );
};

export default Nav;

