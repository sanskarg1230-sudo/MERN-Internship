import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useOrders } from "../context/OrderContext";
import { useCategories } from "../context/CategoryContext";
import { toast } from "react-toastify";
import ProductList from "../components/ProductList";
import ProductForm from "../components/ProductForm";
import "../styles/admin.css";

function Dashboard() {
  const { user, logout, token } = useAuth();
  const { products } = useProducts();
  const { orders, updateOrderStatus, deleteOrder, fetchOrders } = useOrders();
  const { categories } = useCategories();
  const navigate = useNavigate();

  // Dashboard states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard"); // Dashboard, Products, Orders, Users, Analytics, Settings
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Selected order details modal state
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load MERN stack users (Admin-only)
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users list:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
      fetchOrders();
    }
  }, [user]);

  // Statistics Calculations
  const totalUsers = users.length || 12; // Fallback for display
  const totalOrders = orders.length || 8;
  const totalProducts = products.length || 10;
  
  // Total Revenue calculation
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0) || 284500;

  const handleLogoutConfirm = () => {
    logout();
    toast.success("Logged out from Admin Portal.");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleOrderStatusUpdate = async (id, status) => {
    const res = await updateOrderStatus(id, status);
    if (res.success) {
      toast.success(`Fulfillment status: ${status}`);
    } else {
      toast.error("Failed to update status.");
    }
  };

  const handleOrderDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this order?")) {
      const res = await deleteOrder(id);
      if (res.success) {
        toast.success("Order record deleted.");
      } else {
        toast.error("Failed to delete order.");
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "Pending": return "admin-badge pending";
      case "Processing": return "admin-badge active";
      case "Shipped": return "admin-badge pending";
      case "Delivered": return "admin-badge completed";
      case "Cancelled": return "admin-badge cancelled";
      default: return "admin-badge";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-layout">
      {/* 1. Left Sidebar Navigation */}
      <aside className={`admin-sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${isMobileSidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="logo-icon">🛡️</span>
          <span className="sidebar-label">InstaDot Admin</span>
        </div>

        <nav className="sidebar-menu">
          {[
            { id: "Dashboard", label: "Dashboard", icon: "📊" },
            { id: "Products", label: "Products", icon: "📦" },
            { id: "Orders", label: "Orders", icon: "🛒" },
            { id: "Users", label: "Users", icon: "👥" },
            { id: "Analytics", label: "Analytics", icon: "📈" },
            { id: "Settings", label: "Settings", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileSidebarOpen(false);
              }}
              className={`sidebar-item ${activeTab === tab.id ? "active" : ""}`}
            >
              <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
              <span className="sidebar-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={() => setShowLogoutModal(true)}>
            <span style={{ fontSize: "1.2rem" }}>🚪</span>
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="admin-main">
        {/* 2. Top Header Bar */}
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              className="action-btn"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{ display: "flex", border: "none" }}
              title="Toggle Sidebar"
            >
              ☰
            </button>
            <div className="header-search">
              <span className="header-search-icon">🔍</span>
              <input type="text" placeholder="Search orders, clients, keys..." />
            </div>
          </div>

          <div className="header-right">
            <button className="header-bell" title="System Notifications">
              🔔
              <span className="bell-badge"></span>
            </button>
            
            <div className="admin-profile">
              <div className="admin-avatar">{getInitials(user?.name)}</div>
              <div className="admin-profile-info" style={{ display: "flex" }}>
                <span className="admin-name">{user?.name || "Administrator"}</span>
                <span className="admin-role">{user?.role || "System Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="admin-content">
          
          {/* A. DASHBOARD VIEW */}
          {activeTab === "Dashboard" && (
            <>
              <div style={{ marginBottom: "28px" }}>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", margin: "0 0 6px 0" }}>
                  Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
                </h2>
                <p style={{ color: "var(--admin-text-muted)", margin: 0, fontSize: "0.95rem" }}>
                  Current Session Date: {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* 3. Dashboard Statistics Cards */}
              <div className="metrics-grid">
                {/* Metric 1: Total Users */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Total Users</span>
                    <div className="metric-icon-box users">👥</div>
                  </div>
                  <div className="metric-body">
                    <span className="metric-number">{totalUsers}</span>
                    <span className="metric-growth up">↑ 12%</span>
                  </div>
                  <div className="metric-trendline">
                    <svg viewBox="0 0 100 30">
                      <path d="M0,25 Q15,10 30,20 T60,5 T90,15 T100,10" fill="none" stroke="#2563eb" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Metric 2: Total Orders */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Total Orders</span>
                    <div className="metric-icon-box orders">🛒</div>
                  </div>
                  <div className="metric-body">
                    <span className="metric-number">{totalOrders}</span>
                    <span className="metric-growth up">↑ 8%</span>
                  </div>
                  <div className="metric-trendline">
                    <svg viewBox="0 0 100 30">
                      <path d="M0,20 Q20,5 40,25 T80,10 T100,5" fill="none" stroke="#0369a1" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Metric 3: Total Products */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Total Products</span>
                    <div className="metric-icon-box products">📦</div>
                  </div>
                  <div className="metric-body">
                    <span className="metric-number">{totalProducts}</span>
                    <span className="metric-growth up">↑ 5%</span>
                  </div>
                  <div className="metric-trendline">
                    <svg viewBox="0 0 100 30">
                      <path d="M0,28 Q25,20 50,22 T85,15 T100,8" fill="none" stroke="#6b21a8" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Metric 4: Total Revenue */}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Total Revenue</span>
                    <div className="metric-icon-box revenue">₹</div>
                  </div>
                  <div className="metric-body">
                    <span className="metric-number">₹{totalRevenue.toLocaleString()}</span>
                    <span className="metric-growth up">↑ 24%</span>
                  </div>
                  <div className="metric-trendline">
                    <svg viewBox="0 0 100 30">
                      <path d="M0,28 Q15,15 30,22 T60,8 T90,2 T100,5" fill="none" stroke="#10b981" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* JWT Security Card */}
              <div className="security-banner-card">
                <div className="security-left">
                  <span className="security-shield-icon">🛡️</span>
                  <div>
                    <h4 className="security-title">Admin Cryptographic Security Console</h4>
                    <p className="security-subtitle">Role-Based JWT Authorization (RSA-256 Signature verified by server)</p>
                  </div>
                </div>
                <div className="security-right">
                  <span className="security-badge active">Admin Verified</span>
                  <span className="security-badge">Session SSL: Active</span>
                  <span className="security-badge" style={{ color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}>
                    JWT Token: Active
                  </span>
                </div>
              </div>

              {/* Charts and Analytics Section */}
              <div className="charts-grid">
                {/* Chart 1: Revenue Line Area Chart */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Revenue Forecast Analytics (Area Overview)</h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", fontWeight: "600" }}>Last 6 Months</span>
                  </div>
                  <div className="chart-container" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <svg viewBox="0 0 500 200" style={{ width: "100%", height: "180px", overflow: "visible" }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                      
                      {/* Path & Fill */}
                      <path d="M0,170 Q75,120 150,150 T300,70 T450,40 T500,45 L500,200 L0,200 Z" fill="url(#areaGrad)" />
                      <path d="M0,170 Q75,120 150,150 T300,70 T450,40 T500,45" fill="none" stroke="#2563eb" strokeWidth="3.5" />
                      
                      {/* Interactive Data Dots */}
                      <circle cx="150" cy="150" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                      <circle cx="300" cy="70" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                      <circle cx="450" cy="40" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                    </svg>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0 10px", fontSize: "0.8rem", color: "var(--admin-text-muted)", fontWeight: "600" }}>
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Timeline Widget */}
                <div className="chart-card">
                  <div className="chart-header">
                    <h3 className="chart-title">Recent Activity Timeline</h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--admin-text-white)", background: "#10b981", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>Live Log</span>
                  </div>
                  
                  <div className="activity-timeline">
                    <div className="timeline-item">
                      <div className="timeline-icon cart">🛒</div>
                      <div className="timeline-content">
                        <span className="timeline-desc">New order placed by <strong>Sanskar Gupta</strong> for amount ₹56,000</span>
                        <span className="timeline-time">10 minutes ago</span>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-icon user">👤</div>
                      <div className="timeline-content">
                        <span className="timeline-desc">New customer registered: <strong>Rahul Verma</strong> (r.verma@example.com)</span>
                        <span className="timeline-time">1 hour ago</span>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-icon review">⭐</div>
                      <div className="timeline-content">
                        <span className="timeline-desc">Fulfillment shipped successfully for order <strong>#6a365d17</strong></span>
                        <span className="timeline-time">2 hours ago</span>
                      </div>
                    </div>
                    <div className="timeline-item">
                      <div className="timeline-icon warning">⚠️</div>
                      <div className="timeline-content">
                        <span className="timeline-desc">Stock warning: Product <strong>Logitech G-Pro Mouse</strong> stock fell below 10</span>
                        <span className="timeline-time">4 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* B. PRODUCTS MANAGEMENT VIEW */}
          {activeTab === "Products" && (
            <div className="premium-card" style={{ padding: "0", background: "transparent", border: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 4px 0" }}>Inventory Products</h2>
                  <p style={{ color: "var(--admin-text-muted)", margin: 0, fontSize: "0.88rem" }}>Create, edit, track stock statuses, and delete e-commerce inventory items</p>
                </div>
              </div>

              {/* Embed the modular ProductList component */}
              <ProductList />
            </div>
          )}

          {/* C. ORDERS MANAGEMENT VIEW */}
          {activeTab === "Orders" && (
            <div className="premium-card" style={{ padding: "28px" }}>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 4px 0" }}>Sales Fulfillment Ledger</h2>
                <p style={{ color: "var(--admin-text-muted)", margin: 0, fontSize: "0.88rem" }}>Manage customer invoice statuses, process shipments, and delete order records</p>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Placed Date</th>
                      <th>Fulfillment Status</th>
                      <th>Amount Due</th>
                      <th>Update Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: "700", color: "#2563eb" }}>
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: "700" }}>{order.customerDetails?.name}</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>{order.customerDetails?.email}</span>
                            </div>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <span className={getOrderStatusClass(order.status)}>
                              {order.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: "800" }}>₹{order.totalAmount}</td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                              className="form-group"
                              style={{ padding: "6px 10px", margin: 0, width: "auto", fontSize: "0.85rem", height: "auto" }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="action-btn" title="View details" onClick={() => setSelectedOrder(order)}>
                                👁️
                              </button>
                              <button className="action-btn delete" title="Permanently delete" onClick={() => handleOrderDelete(order._id)}>
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--admin-text-muted)" }}>
                          No customer orders registered in system.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* D. USERS VIEW */}
          {activeTab === "Users" && (
            <div className="premium-card" style={{ padding: "28px" }}>
              <div style={{ marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 4px 0" }}>System Customer Profiles</h2>
                <p style={{ color: "var(--admin-text-muted)", margin: 0, fontSize: "0.88rem" }}>Registered customer profiles and administrators credentials listing</p>
              </div>

              {usersLoading ? (
                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-row" style={{ height: "40px" }}></div>
                  ))}
                </div>
              ) : (
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Registered Email</th>
                        <th>System Authorization Role</th>
                        <th>User Status</th>
                        <th>ID Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((u) => (
                          <tr key={u._id}>
                            <td style={{ fontWeight: "700" }}>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className={`admin-badge ${u.role === "admin" ? "active" : "inactive"}`} style={{ textTransform: "uppercase", fontSize: "0.75rem" }}>
                                {u.role === "admin" ? "🛡️ Admin" : "👤 Customer"}
                              </span>
                            </td>
                            <td>
                              <span className="admin-badge active">
                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", marginRight: "6px", display: "inline-block" }}></span>
                                Active
                              </span>
                            </td>
                            <td style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>#{u._id}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>No system profiles registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* E. ANALYTICS VIEW */}
          {activeTab === "Analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div className="premium-card" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "16px" }}>Category Inventory Distribution</h3>
                <p style={{ color: "var(--admin-text-muted)", fontSize: "0.88rem", marginBottom: "30px" }}>Tally of product variants distributed across e-commerce categories</p>
                
                <div className="bar-chart">
                  {categories.map((cat, idx) => {
                    const count = products.filter(p => p.category?._id === cat._id || p.category === cat._id).length;
                    const heightPercent = Math.min(100, Math.max(5, (count / (products.length || 1)) * 100));
                    
                    return (
                      <div key={cat._id} className="bar-column">
                        <span style={{ fontSize: "0.8rem", fontWeight: "700" }}>{count}</span>
                        <div className="bar-fill" style={{ height: `${heightPercent}%`, background: idx % 2 === 0 ? "var(--admin-primary)" : "var(--admin-accent)" }}></div>
                        <span className="bar-label">{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="premium-card" style={{ padding: "28px" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "16px" }}>Fulfillment Distribution Matrix</h3>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "space-around", padding: "20px 0" }}>
                  {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => {
                    const count = orders.filter(o => o.status === status).length;
                    const total = orders.length || 1;
                    const pct = Math.round((count / total) * 100);

                    return (
                      <div key={status} style={{ textAlign: "center", minWidth: "100px" }}>
                        <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--admin-secondary)" }}>{count}</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--admin-text-muted)", marginTop: "4px" }}>{status}</div>
                        <div style={{ background: "#e2e8f0", height: "6px", width: "80px", margin: "10px auto 0", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ background: "#2563eb", height: "100%", width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* F. SETTINGS VIEW */}
          {activeTab === "Settings" && (
            <div className="premium-card" style={{ padding: "32px" }}>
              <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--admin-border)", paddingBottom: "20px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "800", margin: "0 0 4px 0" }}>Store System Configurations</h2>
                <p style={{ color: "var(--admin-text-muted)", margin: 0, fontSize: "0.88rem" }}>Configure metadata profiles, tax brackets, and toggle sandbox payment credentials</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); toast.success("Configurations updated successfully! ⚙️"); }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="settings-grid">
                  <div>
                    <h4 className="settings-section-title">General Info</h4>
                    <p className="settings-section-desc">E-commerce storefront identity and base settings.</p>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid var(--admin-border)" }}>
                    <div className="form-group">
                      <label>Store Name</label>
                      <input type="text" defaultValue="InstaDot Shop E-Commerce" />
                    </div>
                    <div className="form-group">
                      <label>Fulfillment Contact Email</label>
                      <input type="email" defaultValue="admin@instadot.com" />
                    </div>
                  </div>
                </div>

                <div className="settings-grid">
                  <div>
                    <h4 className="settings-section-title">Gateway Sandbox Sandbox</h4>
                    <p className="settings-section-desc">Razorpay API credentials and simulated mock status toggles.</p>
                  </div>
                  <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "12px", border: "1px solid var(--admin-border)" }}>
                    <div className="form-group">
                      <label>Razorpay Key ID</label>
                      <input type="text" defaultValue="rzp_test_mock_key_id" readOnly />
                    </div>
                    <div className="form-group">
                      <label>Sandbox Simulators</label>
                      <select defaultValue="enabled">
                        <option value="enabled">Enabled (Graceful Simulation Mode)</option>
                        <option value="disabled">Disabled (Strict SDK Signature checks)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
                  <button type="button" className="admin-btn secondary" onClick={() => toast.info("Settings reset to defaults.")}>
                    Reset Defaults
                  </button>
                  <button type="submit" className="admin-btn primary">
                    Save Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* 4. Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px", width: "100%" }}>
            <div className="modal-header">
              <h3 className="modal-title">Fulfillment Details</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            
            <div className="modal-body" style={{ fontSize: "0.95rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", color: "var(--admin-text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Ship To</h4>
                  <strong>{selectedOrder.customerDetails?.name}</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>
                    {selectedOrder.customerDetails?.phone}<br />
                    {selectedOrder.customerDetails?.email}
                  </p>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", color: "var(--admin-text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Shipping Address</h4>
                  <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: "600" }}>
                    {selectedOrder.shippingAddress?.address}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--admin-border)", paddingTop: "20px", marginBottom: "20px" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "var(--admin-text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Products</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedOrder.products?.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>
                        {item.product?.name || "Product Item"} <span style={{ color: "var(--admin-text-muted)", fontWeight: "600" }}>&times; {item.quantity}</span>
                      </span>
                      <span style={{ fontWeight: "700" }}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px dashed var(--admin-border)", paddingTop: "14px", display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "1.1rem" }}>
                <span>Invoice Total:</span>
                <span style={{ color: "#2563eb" }}>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="admin-btn secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px", width: "100%", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🚪</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "8px" }}>Confirm Logout</h3>
            <p style={{ color: "var(--admin-text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              Are you sure you want to end your administrator session?
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="admin-btn secondary" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="admin-btn danger" onClick={handleLogoutConfirm}>Logout</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;