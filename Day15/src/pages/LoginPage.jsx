import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../App.css";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success("Welcome back! Login Successful 🔑");
      if (res.user.role === "admin") {
        navigate("/");
      } else {
        navigate("/store");
      }
    } else {
      toast.error(res.message || "Invalid login credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Panel - SaaS Branding Illustration */}
        <div className="auth-left-panel">
          <div className="auth-left-content">
            <span className="auth-brand-logo">🌐 InstaDot Shop</span>
            <h1>Manage your orders & track inventory in real-time.</h1>
            <p>
              Experience the next generation of e-commerce admin systems. Fast, secure, and user-scoped.
            </p>
            <div className="auth-mock-stats">
              <div className="mock-stat-item">
                <span className="mock-stat-num">99.9%</span>
                <span className="mock-stat-label">Uptime</span>
              </div>
              <div className="mock-stat-item">
                <span className="mock-stat-num">1.2s</span>
                <span className="mock-stat-label">Response Time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-right-panel">
          <div className="auth-form-container">
            <h2>Sign In</h2>
            <p className="auth-subtitle">Enter your credentials to access your account</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="auth-actions-row">
                <label className="remember-me-checkbox">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  className="forgot-password-link"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Password reset link sent (Simulation).");
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="auth-footer-text">
              Don't have an account? <Link to="/register">Sign up for free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
