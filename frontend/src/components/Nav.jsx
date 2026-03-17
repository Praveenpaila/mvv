import styles from "./Nav.module.css";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { asset } from "../assets/assets";
import { CiShoppingCart, CiSearch } from "react-icons/ci";
import { HiOutlineMenu } from "react-icons/hi";
import { CgProfile } from "react-icons/cg";
import { clearCart } from "../store/cart";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useMemo, useCallback, useState } from "react";

const Nav = ({ setToken }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = useMemo(() => searchParams.get("q") || "", [searchParams]);
  const searchInputRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const debounceTimer = useRef(null);
  const profileRef = useRef(null);
  const menuRef = useRef(null);
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

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;

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
    },
    [navigate],
  );

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      const value = searchInputRef.current?.value || "";
      if (value.trim()) {
        navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      } else {
        navigate("/search");
      }
    },
    [navigate],
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <nav className={styles.nav}>
      {/* LEFT : LOGO */}
      <Link to="/" className={styles.logo}>
        <img src={asset.mkLogo} alt="MVV" />
        {/* <span>MVV</span> */}
      </Link>

      {/* CENTER : SEARCH + LINKS */}
      <div className={styles.center}>
        {/* SEARCH */}
        <form className={styles.search} onSubmit={handleSearchSubmit}>
          <CiSearch />
          <input
            key={query}
            ref={searchInputRef}
            type="text"
            placeholder="Search products..."
            defaultValue={query}
            onChange={handleSearchChange}
          />
        </form>

        {/* LINKS */}
        <div className={styles.links}>
          <Link to="/">Home</Link>
          <Link to="/organic">organic</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      {/* RIGHT : ICONS + MENU */}
      <div className={styles.actionsWrap} ref={menuRef}>
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
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Menu"
            aria-expanded={isMenuOpen}
          >
            <HiOutlineMenu />
          </button>
        </div>

        {/* MOBILE MENU */}
        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/organic" onClick={() => setIsMenuOpen(false)}>
            organic
          </Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
