import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function AdminReviewsPage() {
  const { token } = useAuth();
  
  // API endpoints
  const REVIEWS_API = `http://localhost:5000/api/reviews`;

  // Core State
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  // Fetch all reviews in system
  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const res = await axios.get(REVIEWS_API, config);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error(error.response?.data?.message || "Failed to load system reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  // Handle Edit Submission
  const handleUpdateReview = async (e) => {
    e.preventDefault();

    if (!editRating) {
      toast.error("Rating is required.");
      return;
    }
    if (!editComment || editComment.trim() === "") {
      toast.error("Comment is required.");
      return;
    }

    try {
      setSubmitting(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.put(
        `${REVIEWS_API}/${editReviewId}`,
        { rating: editRating, comment: editComment.trim() },
        config
      );

      toast.success("Review updated successfully by Admin! 🛡️");
      setShowEditModal(false);
      setEditReviewId(null);
      fetchAllReviews();
    } catch (error) {
      console.error("Error updating review by Admin:", error);
      toast.error(error.response?.data?.message || "Failed to update review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleEditClick = (review) => {
    setEditReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setShowEditModal(true);
  };

  // Open Delete Modal
  const handleDeleteClick = (reviewId) => {
    setDeleteReviewId(reviewId);
    setShowDeleteModal(true);
  };

  // Handle Delete Review
  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`${REVIEWS_API}/${deleteReviewId}`, config);
      toast.success("Review deleted successfully by Admin! 🗑️");
      setShowDeleteModal(false);
      setDeleteReviewId(null);
      fetchAllReviews();
    } catch (error) {
      console.error("Error deleting review by Admin:", error);
      toast.error(error.response?.data?.message || "Failed to delete review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Search Reviews (Match User Name, Product Name, or Comment)
  const filteredReviews = reviews.filter((r) => {
    const query = searchQuery.toLowerCase();
    const userNameMatch = r.user?.name?.toLowerCase().includes(query) || false;
    const productNameMatch = r.product?.name?.toLowerCase().includes(query) || false;
    const commentMatch = r.comment?.toLowerCase().includes(query) || false;
    
    return userNameMatch || productNameMatch || commentMatch;
  });

  // Sort Reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "highest") {
      return b.rating - a.rating;
    } else if (sortBy === "lowest") {
      return a.rating - b.rating;
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviewsList = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  // Star Render Helper
  const renderStars = (count, size = "14px", color = "#eab308") => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i <= count ? color : "none"}
          stroke={color}
          strokeWidth="2"
          style={{ marginRight: "2px" }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }
    return <div style={{ display: "flex", alignItems: "center" }}>{stars}</div>;
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="reviews-dashboard-header">
        <Link to="/" className="back-link">
          ← Back to Inventory Dashboard
        </Link>
        <div className="header-meta">
          <h1>Admin Review Management Dashboard 🛡️</h1>
          <p>Supervise, filter, edit, or remove testimonials from all customers across the platform</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="glass-card review-feed-card" style={{ maxWidth: "100%", margin: "0 auto" }}>
        
        {/* Controls */}
        <div className="feed-header-controls">
          <h3>All System Reviews ({sortedReviews.length})</h3>
          
          <div className="filters-row">
            <div className="search-bar" style={{ width: "320px" }}>
              <input
                type="text"
                placeholder="Search by username, product, or comment..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="sort-selector">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="latest">Latest Reviews</option>
                <option value="highest">Highest Ratings</option>
                <option value="lowest">Lowest Ratings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="loader-container">
            <div className="custom-spinner"></div>
            <p>Fetching all system reviews...</p>
          </div>
        ) : currentReviewsList.length === 0 ? (
          <div className="empty-state-container">
            <div className="empty-icon-wrapper">🛡️</div>
            <h4>No reviews exist in database</h4>
            <p>
              {searchQuery
                ? `No reviews match query "${searchQuery}"`
                : "No customer reviews have been submitted in the database."}
            </p>
          </div>
        ) : (
          <div className="reviews-feed-list">
            {currentReviewsList.map((review) => {
              const reviewerInitials = review.user?.name
                ? review.user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                : "U";
              
              const reviewDate = new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div className="review-card-item" key={review._id}>
                  
                  {/* Review Context Header */}
                  <div className="admin-review-product-bar" style={{
                    marginBottom: "12px",
                    paddingBottom: "8px",
                    borderBottom: "1px dashed #e2e8f0",
                    fontSize: "13px",
                    color: "#0f766e",
                    fontWeight: "600"
                  }}>
                    Product: <Link to={`/product/${review.product?._id || ""}`} style={{ color: "#0d9488", textDecoration: "underline" }}>
                      {review.product?.name || "Deleted Product"}
                    </Link>
                  </div>

                  <div className="review-card-header">
                    <div className="reviewer-avatar" style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)" }}>
                      {reviewerInitials}
                    </div>
                    <div className="reviewer-meta">
                      <h4>
                        {review.user?.name || "Deleted User"} 
                        <span className="reviewer-email-label" style={{ fontWeight: "400", fontSize: "11px", color: "#94a3b8", marginLeft: "6px" }}>
                          ({review.user?.email || "No Email"})
                        </span>
                      </h4>
                      <span className="review-date-label">{reviewDate}</span>
                    </div>
                    <div className="reviewer-rating">
                      {renderStars(review.rating, "14px")}
                    </div>
                  </div>

                  <p className="review-text-message">{review.comment}</p>

                  <div className="review-card-footer">
                    <button
                      className="btn-edit-link"
                      onClick={() => handleEditClick(review)}
                    >
                      Edit Review
                    </button>
                    <button
                      className="btn-delete-link"
                      onClick={() => handleDeleteClick(review._id)}
                    >
                      Delete Review
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  className="pagination-btn arrow"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
                  <button
                    key={num}
                    className={`pagination-btn num ${currentPage === num ? "active" : ""}`}
                    onClick={() => handlePageChange(num)}
                  >
                    {num}
                  </button>
                ))}

                <button
                  className="pagination-btn arrow"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content review-edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Admin Edit Review</h3>
            <p className="card-subtitle">Moderating review rating and comment content.</p>
            
            <form onSubmit={handleUpdateReview} className="interactive-review-form">
              <div className="input-wrapper">
                <label>Rating</label>
                <div className="star-rating-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-select-btn ${star <= (editHoverRating || editRating) ? "active" : ""}`}
                      onClick={() => setEditRating(star)}
                      onMouseEnter={() => setEditHoverRating(star)}
                      onMouseLeave={() => setEditHoverRating(0)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-wrapper">
                <label>Comment Message</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows="4"
                  className="form-textarea"
                  required
                ></textarea>
              </div>

              <div className="modal-actions-row">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? <div className="spinner-mini"></div> : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditReviewId(null);
                  }}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="warning-badge-icon">⚠️</div>
            <h3>Delete Review?</h3>
            <p>This action is permanent and will recalculate product rating stats. Delete this testimonial?</p>
            
            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReviewId(null);
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviewsPage;
