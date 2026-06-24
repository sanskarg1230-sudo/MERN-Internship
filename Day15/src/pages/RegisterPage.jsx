import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../App.css";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = formData;

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all registration fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    const res = await register(name, email, password, role);
    setLoading(false);

    if (res.success) {
      toast.success("Account Created Successfully! Welcome 🎉");
      navigate("/store");
    } else {
      toast.error(res.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Panel - SaaS Branding Illustration */}
        <div className="auth-left-panel">
          <div className="auth-left-content">
            <span className="auth-brand-logo">🌐 InstaDot Shop</span>
            <h1>Create an account & start purchasing.</h1>
            <p>
              Join thousands of businesses managing their inventory, shopping carts, and order logistics in a single hub.
            </p>
            <div className="auth-mock-stats">
              <div className="mock-stat-item">
                <span className="mock-stat-num">10k+</span>
                <span className="mock-stat-label">Active Users</span>
              </div>
              <div className="mock-stat-item">
                <span className="mock-stat-num">500k+</span>
                <span className="mock-stat-label">Orders Shipped</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-right-panel">
          <div className="auth-form-container">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Get started with your free developer account today</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

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

              <div className="form-row grid-2" style={{ gap: "15px", marginBottom: "0" }}>
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

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "15px" }}>
                <label htmlFor="role">Register As</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="auth-select"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #dbe2ea",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    fontSize: "15px",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="customer">User (Normal Account)</option>
                  <option value="admin">Admin (Staff Account)</option>
                </select>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="auth-footer-text">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
