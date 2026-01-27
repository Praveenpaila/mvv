import styles from "./Nav.module.css";
import { Link, useNavigate } from "react-router-dom";
import { asset } from "../assets/assets";
import { CiShoppingCart, CiSearch } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import { clearCart } from "../store/cart";
import { useDispatch } from "react-redux";
const Nav = ({ setToken }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logoutHandler = () => {
    localStorage.removeItem("token");
    dispatch(clearCart());
    navigate("/login");

    setToken("");
  };
  return (
    <nav className={styles.nav}>
      {/* LEFT : LOGO */}
      <Link to="/" className={styles.logo}>
        <img src={asset.mkLogo} alt="MK Gold Coast" />
        <span>MK Gold Coast</span>
      </Link>

      {/* CENTER : SEARCH + LINKS */}
      <div className={styles.center}>
        {/* SEARCH */}
        <div className={styles.search}>
          <CiSearch />
          <input
            type="text"
            placeholder="Search products..."
            onChange={(e) => {
              navigate(`/search?q=${e.target.value}`);
            }}
          />
        </div>

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
        <div className={styles.profile}>
          <CgProfile />
          <div className={styles.dropdown}>
            <Link to="/profile">Profile</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/login" onClick={logoutHandler}>
              Logout
            </Link>
          </div>
        </div>

        {/* CART */}
        <Link to="/cart" className={styles.icon}>
          <CiShoppingCart />
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
