import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // API endpoints
  const PRODUCT_API = `http://localhost:5000/api/products/${id}`;
  const REVIEWS_API = `http://localhost:5000/api/reviews`;

  // Core State
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Add Review Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState("");

  // Edit Review Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  // Search, Sort & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Fetch Product details
  const fetchProduct = async () => {
    try {
      setLoadingProduct(true);
      const res = await axios.get(PRODUCT_API);
      setProduct(res.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details.");
    } finally {
      setLoadingProduct(false);
    }
  };

  // Fetch Product Reviews
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await axios.get(`${REVIEWS_API}/product/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews.");
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  // Handle Add Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Form Validations
    if (!rating) {
      setValidationError("Star rating is required.");
      toast.error("Star rating is required.");
      return;
    }
    if (!comment || comment.trim() === "") {
      setValidationError("Comment cannot be empty.");
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post(
        REVIEWS_API, 
        { productId: id, rating, comment: comment.trim() },
        config
      );

      toast.success("Review added successfully! ⭐");
      setRating(0);
      setHoverRating(0);
      setComment("");
      setValidationError("");
      
      // Reload product stats and reviews feed
      fetchProduct();
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      const msg = error.response?.data?.message || "Failed to submit review.";
      toast.error(msg);
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Edit Modal Opening
  const handleEditClick = (review) => {
    setEditReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setShowEditModal(true);
  };

  // Handle Edit Review Submission
  const handleUpdateReview = async (e) => {
    e.preventDefault();

    if (!editRating) {
      toast.error("Star rating is required.");
      return;
    }
    if (!editComment || editComment.trim() === "") {
      toast.error("Comment cannot be empty.");
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

      toast.success("Review updated successfully! 📝");
      setShowEditModal(false);
      setEditReviewId(null);
      
      // Reload stats and feed
      fetchProduct();
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error(error.response?.data?.message || "Failed to update review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Delete Modal Opening
  const handleDeleteClick = (reviewId) => {
    setDeleteReviewId(reviewId);
    setShowDeleteModal(true);
  };

  // Handle Delete Review Submission
  const handleConfirmDelete = async () => {
    try {
      setSubmitting(true);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`${REVIEWS_API}/${deleteReviewId}`, config);
      toast.success("Review deleted successfully! 🗑️");
      
      setShowDeleteModal(false);
      setDeleteReviewId(null);
      
      // Reload stats and feed
      fetchProduct();
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Failed to delete review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Check ownership of review
  const canModifyReview = (review) => {
    if (!user) return false;
    // Admins can edit/delete any review
    if (user.role === "admin") return true;
    // Normal users can only edit/delete their own
    return review.user && (review.user._id === user._id || review.user === user._id);
  };

  // Stats Calculations
  const totalReviews = reviews.length;
  const averageRating = product?.averageRating || 0;

  // Star Distribution percentages
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
    }
  });

  const getPercentage = (star) => {
    if (totalReviews === 0) return 0;
    return Math.round((distribution[star] / totalReviews) * 100);
  };

  // Search & Filter & Sort reviews
  const filteredReviews = reviews.filter((r) =>
    r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "highest") {
      return b.rating - a.rating;
    } else if (sortBy === "lowest") {
      return a.rating - b.rating;
    } else {
      // Latest default
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination Logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviewsList = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  // Render Stars Helper
  const renderStars = (count, size = "16px", color = "#eab308") => {
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
      {/* Product Details Header */}
      <div className="reviews-dashboard-header">
        <Link to="/store" className="back-link">
          ← Back to Store
        </Link>
        <div className="header-meta">
          <h1>Product Information & Testimonials 🛍️</h1>
          <p>Read what others say and share your experience with the item</p>
        </div>
      </div>

      {loadingProduct ? (
        <div className="loader-container">
          <div className="custom-spinner"></div>
          <p>Fetching product information...</p>
        </div>
      ) : product ? (
        <div className="reviews-layout">
          {/* LEFT SIDE: Product Image & Rating Stats */}
          <div className="layout-sidebar">
            <div className="glass-card product-details-card">
              <span className="category-badge">{product.category?.name || "Premium Item"}</span>
              <div className="product-image-container">
                <img
                  src={product.image || `https://picsum.photos/400/300?random=${product._id}`}
                  alt={product.name}
                  className="product-large-image"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/400x300?text=Product+Image";
                  }}
                />
              </div>
              <div className="product-info-content">
                <h2>{product.name}</h2>
                <div className="price-tag">₹{product.price.toLocaleString("en-IN")}</div>
                <p className="product-desc-text">
                  {product.description || "Discover the amazing features of this high-quality product, designed to provide exceptional performance, durability, and value for your everyday needs."}
                </p>
              </div>
            </div>

            {/* Stats distributions */}
            <div className="glass-card rating-stats-card">
              <h3>Rating Summary</h3>
              <div className="rating-summary-hero">
                <div className="average-num">{averageRating.toFixed(1)}</div>
                <div className="average-meta">
                  {renderStars(Math.round(averageRating), "20px")}
                  <span className="total-count-label">Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}</span>
                </div>
              </div>

              <div className="distribution-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage = getPercentage(star);
                  return (
                    <div className="dist-row" key={star}>
                      <span className="star-label">{star} Star</span>
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="percentage-label">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Add Review Form & Reviews List */}
          <div className="layout-main-content">
            {/* Add Review Form (Conditional on authentication) */}
            <div className="glass-card review-form-card">
              <h3>✍️ Share Your Feedback</h3>
              {user ? (
                <form onSubmit={handleSubmitReview} className="interactive-review-form">
                  {validationError && <div className="form-error-banner">{validationError}</div>}
                  
                  <div className="input-wrapper">
                    <label>Rating Required</label>
                    <div className="star-rating-selector">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          className={`star-select-btn ${star <= (hoverRating || rating) ? "active" : ""}`}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      ))}
                      <span className="star-selection-desc">
                        {rating > 0 ? `${rating} Stars Selected` : "Click to rate"}
                      </span>
                    </div>
                  </div>

                  <div className="input-wrapper">
                    <label>Review Comment</label>
                    <textarea
                      placeholder="Share your detailed experience with the product. What did you like or dislike?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows="4"
                      className="form-textarea"
                      required
                    ></textarea>
                  </div>

                  <div className="form-action-row">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? <div className="spinner-mini"></div> : "Submit Review"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="auth-notice-box">
                  <p>You must be signed in to add a product review and rating.</p>
                  <div className="auth-notice-actions">
                    <Link to="/login" className="btn-primary">Sign In</Link>
                    <Link to="/register" className="btn-secondary">Register</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Listing Section */}
            <div className="glass-card review-feed-card">
              <div className="feed-header-controls">
                <h3>Reviews Listing ({sortedReviews.length})</h3>
                <div className="filters-row">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Search reviews by username..."
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

              {loadingReviews ? (
                <div className="loader-container inner">
                  <div className="custom-spinner"></div>
                  <p>Loading user testimonials...</p>
                </div>
              ) : currentReviewsList.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-icon-wrapper">💬</div>
                  <h4>No reviews exist yet</h4>
                  <p>
                    {searchQuery
                      ? `No reviews match name "${searchQuery}"`
                      : "Be the first to share your rating and comments for this product!"}
                  </p>
                </div>
              ) : (
                <div className="reviews-feed-list">
                  {currentReviewsList.map((review) => {
                    const initials = review.user?.name
                      ? review.user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                      : "U";
                    const reviewDate = new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div className="review-card-item" key={review._id}>
                        <div className="review-card-header">
                          <div className="reviewer-avatar">{initials}</div>
                          <div className="reviewer-meta">
                            <h4>
                              {review.user?.name || "Deleted User"} 
                              {review.user?.role === "admin" && <span className="admin-tag-indicator">Admin</span>}
                            </h4>
                            <span className="review-date-label">{reviewDate}</span>
                          </div>
                          <div className="reviewer-rating">
                            {renderStars(review.rating, "14px")}
                          </div>
                        </div>

                        <p className="review-text-message">{review.comment}</p>

                        {/* Show edit and delete conditionally based on permissions */}
                        {canModifyReview(review) && (
                          <div className="review-card-footer">
                            <button
                              className="btn-edit-link"
                              onClick={() => handleEditClick(review)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-delete-link"
                              onClick={() => handleDeleteClick(review._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Pagination component */}
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
          </div>
        </div>
      ) : (
        <div className="glass-card error-state-card">
          <h2>Product Not Found</h2>
          <p>We could not find the product details in our catalog database.</p>
          <Link to="/store" className="btn-primary">Back to Store</Link>
        </div>
      )}

      {/* Edit Review Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content review-edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>✏️ Edit Review</h3>
            <p className="card-subtitle">Modify your rating and testimonial details below.</p>
            
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
            <p>This action is permanent. Are you sure you want to delete this rating and comment?</p>
            
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

export default ProductDetailsPage;
