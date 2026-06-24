import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { toast } from "react-toastify";
import "../App.css";

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    toast.success("Logged out successfully! See you soon 👋");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const cartCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const wishlistCount = wishlist ? wishlist.length : 0;

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="sticky-navbar">
      <div className="navbar-container">
        <Link to={user?.role === "admin" ? "/" : "/store"} className="navbar-brand">
          🌐 <span>InstaDot Shop</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-menu">
          {user ? (
            user.role === "admin" ? (
              // Admin Logged In Links
              <>
                <Link to="/" className="navbar-link">
                  Dashboard
                </Link>
                <a href="/#products" className="navbar-link">
                  Products
                </a>
                <a href="/#categories" className="navbar-link">
                  Categories
                </a>
                <Link to="/admin/orders" className="navbar-link admin-nav-link">
                  Orders 🛡️
                </Link>
                <Link to="/payment/history" className="navbar-link admin-nav-link" style={{ background: "#4f46e5", color: "white", padding: "6px 12px", borderRadius: "6px", marginLeft: "4px" }}>
                  Payments 🛡️
                </Link>
                <Link to="/admin/reviews" className="navbar-link admin-nav-link" style={{ background: "#0f766e", color: "white", padding: "6px 12px", borderRadius: "6px", marginLeft: "4px" }}>
                  Manage Reviews 🛡️
                </Link>
              </>
            ) : (
              // Customer Logged In Links
              <>
                <Link to="/store" className="navbar-link">
                  Store
                </Link>
                
                <Link to="/wishlist" className="navbar-link navbar-badge-link">
                  Wishlist
                  {wishlistCount > 0 && (
                    <span className="navbar-count-badge wishlist">{wishlistCount}</span>
                  )}
                </Link>

                <Link to="/cart" className="navbar-link navbar-badge-link">
                  Cart
                  {cartCount > 0 && (
                    <span className="navbar-count-badge cart">{cartCount}</span>
                  )}
                </Link>

                <Link to="/orders" className="navbar-link">
                  Orders
                </Link>

                <Link to="/payment/history" className="navbar-link">
                  Payments
                </Link>
              </>
            )
          ) : (
            // Logged Out Links
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link register-nav-btn">
                Register
              </Link>
            </>
          )}
        </div>

        {/* User Details & Action section */}
        {user && (
          <div className="navbar-user-section">
            <div className="user-profile-info">
              <div className="avatar-circle">
                {getInitials(user.name)}
              </div>
              <div className="user-text-details">
                <span className="user-name-label">{user.name}</span>
                <span className="user-role-label">{user.role}</span>
              </div>
            </div>
            <button className="navbar-logout-btn" onClick={() => setShowLogoutModal(true)}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay logout-modal-overlay">
          <div className="modal-content logout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="logout-warning-icon">⚠️</div>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out of your account?</p>
            <div className="logout-modal-actions">
              <button className="logout-confirm-btn" onClick={handleLogoutConfirm}>
                Logout
              </button>
              <button className="logout-cancel-btn" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
