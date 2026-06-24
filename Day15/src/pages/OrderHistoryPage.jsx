import { useState } from "react";
import { useOrders } from "../context/OrderContext";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import OrderDetailsModal from "../components/OrderDetailsModal";
import "../App.css";

function OrderHistoryPage() {
  const { orders, loading, cancelOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isOrderPaid = (order) => {
    if (order.paymentMethod === "Cash on Delivery") {
      return order.status === "Delivered";
    }
    // Online payments (UPI or Card)
    return ["Processing", "Shipped", "Delivered"].includes(order.status);
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      const res = await cancelOrder(id);
      if (res.success) {
        toast.success("Order Cancelled Successfully ❌");
      } else {
        toast.error(res.message || "Failed to cancel order.");
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
    
    const matchesProducts = order.products.some((item) =>
      item.product?.name?.toLowerCase().includes(lowerQuery)
    );
    
    const matchesCustomer = order.customerDetails?.name?.toLowerCase().includes(lowerQuery);

    return matchesStatus && (matchesId || matchesProducts || matchesCustomer);
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
    setCurrentPage(1); // Reset page on filter
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page on search
  };

  return (
    <div className="container">
      <div className="store-header">
        <h1>My Orders 📦</h1>
        <p className="store-tagline">View your order history, statuses, and manage tracking information</p>
      </div>

      {/* Filter and Search Controls */}
      <div className="card order-controls-card">
        <div className="search-filter-grid">
          <div className="search-box-container">
            <input
              type="text"
              placeholder="Search by Order ID, Product Name, Customer..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="order-search-input"
            />
          </div>

          <div className="filter-tags">
            {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status === "All" ? "All" : status)}
                className={`filter-tag-btn ${
                  (status === "All" && statusFilter === "All") || statusFilter === status
                    ? "active-tag"
                    : ""
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="card empty-orders-card">
          <h3>No Orders Found</h3>
          <p>We couldn't find any orders matching your criteria.</p>
        </div>
      ) : (
        <div className="orders-list">
          {currentOrders.map((order) => {
            const productCount = order.products.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <div key={order._id} className="card order-item-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-card-id">Order ID: #{order._id}</span>
                    <span className="order-card-date">
                      Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-card-body">
                  <div className="order-summary-info">
                    <div className="summary-info-item">
                      <span className="info-label">Total Amount</span>
                      <span className="info-value">₹{order.totalAmount}</span>
                    </div>
                    <div className="summary-info-item">
                      <span className="info-label">Products Count</span>
                      <span className="info-value">{productCount} items</span>
                    </div>
                    <div className="summary-info-item">
                      <span className="info-label">Ship To</span>
                      <span className="info-value">{order.customerDetails.name}</span>
                    </div>
                    <div className="summary-info-item">
                      <span className="info-label">Payment Status</span>
                      <span className="info-value" style={{ 
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: "700",
                        color: isOrderPaid(order) ? "#059669" : "#dc2626" 
                      }}>
                        <span style={{ 
                          width: "8px", 
                          height: "8px", 
                          borderRadius: "50%", 
                          backgroundColor: isOrderPaid(order) ? "#10b981" : "#ef4444" 
                        }}></span>
                        {isOrderPaid(order) ? "Paid" : (order.paymentMethod === "Cash on Delivery" ? "COD (Unpaid)" : "Unpaid")}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                    {!isOrderPaid(order) && order.status === "Pending" && order.paymentMethod !== "Cash on Delivery" && (
                      <Link to={`/payment?orderId=${order._id}`}>
                        <button
                          className="view-details-btn"
                          style={{
                            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            cursor: "pointer",
                            fontWeight: "600",
                            borderRadius: "6px"
                          }}
                        >
                          Pay Now 💳
                        </button>
                      </Link>
                    )}
                    {order.status === "Pending" && (
                      <button
                        className="cancel-order-btn"
                        onClick={() => handleCancel(order._id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

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
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}

export default OrderHistoryPage;
