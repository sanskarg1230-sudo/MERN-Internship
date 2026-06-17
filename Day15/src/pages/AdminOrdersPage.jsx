import { useState } from "react";
import { useOrders } from "../context/OrderContext";
import { toast } from "react-toastify";
import OrderDetailsModal from "../components/OrderDetailsModal";
import "../App.css";

function AdminOrdersPage() {
  const { orders, loading, updateOrderStatus, deleteOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Statistics Calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleStatusChange = async (id, newStatus) => {
    const res = await updateOrderStatus(id, newStatus);
    if (res.success) {
      toast.success(`Order Status Updated to ${newStatus} 📦`);
    } else {
      toast.error(res.message || "Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this order?")) {
      const res = await deleteOrder(id);
      if (res.success) {
        toast.success("Order Deleted Successfully 🗑️");
      } else {
        toast.error(res.message || "Failed to delete order.");
      }
    }
  };

  // Status badge CSS helper
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "badge-pending";
      case "Processing":
        return "badge-processing";
      case "Shipped":
        return "badge-shipped";
      case "Delivered":
        return "badge-delivered";
      case "Cancelled":
        return "badge-cancelled";
      default:
        return "";
    }
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    
    const lowerQuery = searchQuery.toLowerCase();
    const matchesId = order._id.toLowerCase().includes(lowerQuery);
    
    const matchesCustomer = order.customerDetails?.name?.toLowerCase().includes(lowerQuery) ||
                             order.customerDetails?.email?.toLowerCase().includes(lowerQuery);
    
    const matchesProducts = order.products.some((item) =>
      item.product?.name?.toLowerCase().includes(lowerQuery)
    );

    return matchesStatus && (matchesId || matchesCustomer || matchesProducts);
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset page on filter change
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page on search
  };

  return (
    <div className="container">
      <div className="store-header">
        <h1>Admin Order Management 🛡️</h1>
        <p className="store-tagline">Track sales analytics, update fulfillment tracking statuses, and delete order records</p>
      </div>

      {/* Stats Section */}
      <div className="stats admin-stats-grid">
        <div className="stat-card admin-stat-card">
          <div className="stat-icon-wrapper blue">📊</div>
          <div>
            <h2>{totalOrders}</h2>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card admin-stat-card">
          <div className="stat-icon-wrapper orange">⏳</div>
          <div>
            <h2>{pendingOrders}</h2>
            <p>Pending Orders</p>
          </div>
        </div>
        <div className="stat-card admin-stat-card">
          <div className="stat-icon-wrapper green">✅</div>
          <div>
            <h2>{deliveredOrders}</h2>
            <p>Delivered Orders</p>
          </div>
        </div>
        <div className="stat-card admin-stat-card">
          <div className="stat-icon-wrapper revenue">₹</div>
          <div>
            <h2>₹{totalRevenue}</h2>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Controls Card */}
      <div className="card order-controls-card">
        <div className="search-filter-grid">
          <div className="search-box-container">
            <input
              type="text"
              placeholder="Search by ID, Customer Name, Email, Products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="order-search-input"
            />
          </div>

          <div className="filter-tags">
            {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`filter-tag-btn ${statusFilter === status ? "active-tag" : ""}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="card admin-orders-card">
        <h2>All Orders</h2>

        {loading ? (
          <div className="loading-spinner">Loading order list...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders-card">
            <h3>No Orders Found</h3>
            <p>No orders matched the criteria.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Quick Status Update</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id-cell">#{order._id.slice(-8)}...</td>
                      <td>
                        <div className="cust-info-cell">
                          <strong>{order.customerDetails.name}</strong>
                          <span>{order.customerDetails.email}</span>
                        </div>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="amount-cell">₹{order.totalAmount}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="admin-status-dropdown"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="admin-view-btn"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View
                          </button>
                          <button
                            className="admin-delete-btn"
                            onClick={() => handleDelete(order._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="page-btn"
                >
                  &laquo; Prev
                </button>
                
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`page-btn ${currentPage === pageNum ? "active-page" : ""}`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="page-btn"
                >
                  Next &raquo;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

export default AdminOrdersPage;
