import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function ProductReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // API base URLs
  const PRODUCT_API = `http://localhost:5000/api/products/${id}`;
  const REVIEWS_API = `http://localhost:5000/api/reviews`;

  // Core State
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [userName, setUserName] = useState(user?.name || "");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  
  // Validation States
  const [validationError, setValidationError] = useState("");

  // Search, Sort & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Modals
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Sync userName with logged in user
  useEffect(() => {
    if (user && !userName) {
      setUserName(user.name);
    }
  }, [user]);

  // Fetch Product details
  const fetchProduct = async () => {
    try {
      setLoadingProduct(true);
      const res = await axios.get(PRODUCT_API);
      setProduct(res.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoadingProduct(false);
    }
  };

  // Fetch Reviews details
  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await axios.get(`${REVIEWS_API}/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  // Handle Form Submission (Add or Edit)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Form Validations
    if (!userName || userName.trim() === "") {
      setValidationError("Name is required");
      toast.error("Please enter your name");
      return;
    }
    if (!rating) {
      setValidationError("Star rating is required");
      toast.error("Please select a star rating");
      return;
    }
    if (!reviewText || reviewText.trim() === "") {
      setValidationError("Review message cannot be empty");
      toast.error("Please enter a review message");
      return;
    }

    try {
      setSubmitting(true);
      if (editingReviewId) {
        // Edit Review API
        const res = await axios.put(`${REVIEWS_API}/${editingReviewId}`, {
          productId: id,
          userName: userName.trim(),
          rating,
          reviewText: reviewText.trim(),
        });
        
        toast.success("Review updated successfully! 📝");
        setEditingReviewId(null);
      } else {
        // Add Review API
        const res = await axios.post(REVIEWS_API, {
          productId: id,
          userName: userName.trim(),
          rating,
          reviewText: reviewText.trim(),
          userId: user?._id || null
        });

        toast.success("Review submitted successfully! ⭐");
      }

      // Reset form (except userName if user is logged in)
      setReviewText("");
      setRating(0);
      setHoverRating(0);
      setValidationError("");
      
      // Reload reviews
      fetchReviews();
    } catch (error) {
      console.error("Error saving review:", error);
      const msg = error.response?.data?.message || "Failed to save review";
      toast.error(msg);
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-fill form for editing
  const handleEditClick = (review) => {
    setEditingReviewId(review._id);
    setUserName(review.userName);
    setRating(review.rating);
    setReviewText(review.reviewText);
    setValidationError("");
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setUserName(user?.name || "");
    setRating(0);
    setReviewText("");
    setValidationError("");
  };

  // Confirm and Delete Review
  const handleDeleteReview = async () => {
    if (!confirmDeleteId) return;

    try {
      setSubmitting(true);
      await axios.delete(`${REVIEWS_API}/${confirmDeleteId}`);
      toast.success("Review deleted successfully! 🗑️");
      
      // Reset editing if the deleted review was being edited
      if (editingReviewId === confirmDeleteId) {
        handleCancelEdit();
      }
      
      setConfirmDeleteId(null);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for average rating and summary bars
  const totalReviews = reviews.length;
  
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  // Counts per star rating
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingDistribution[r.rating] !== undefined) {
      ratingDistribution[r.rating]++;
    }
  });

  // Calculate percentages
  const getRatingPercentage = (starCount) => {
    if (totalReviews === 0) return 0;
    return Math.round((ratingDistribution[starCount] / totalReviews) * 100);
  };

  // Filter and Sort reviews
  const filteredReviews = reviews.filter((r) =>
    r.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "highest") {
      return b.rating - a.rating;
    } else if (sortBy === "lowest") {
      return a.rating - b.rating;
    } else {
      // Default: latest
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination Logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviewsList = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Helper component to render stars
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
          strokeLinecap="round"
          strokeLinejoin="round"
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
      {/* SaaS Dashboard Header */}
      <div className="reviews-dashboard-header">
        <Link to="/store" className="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Store
        </Link>
        <div className="header-meta">
          <h1>Product Reviews Dashboard 📊</h1>
          <p>Analyze and manage customer ratings and product testimonials</p>
        </div>
      </div>

      {loadingProduct ? (
        <div className="loader-container">
          <div className="custom-spinner"></div>
          <p>Loading product details...</p>
        </div>
      ) : product ? (
        <div className="reviews-layout">
          {/* LEFT COLUMN: Product Card & Rating Statistics */}
          <div className="layout-sidebar">
            
            {/* Product Card */}
            <div className="glass-card product-details-card">
              <div className="badge-row">
                <span className="category-badge">{product.category?.name || "Premium"}</span>
                {product.stock <= 0 ? (
                  <span className="stock-badge out">Out of Stock</span>
                ) : product.stock <= 5 ? (
                  <span className="stock-badge low">Low Stock ({product.stock})</span>
                ) : (
                  <span className="stock-badge in">In Stock</span>
                )}
              </div>
              
              <div className="product-image-container">
                <img
                  src={`https://picsum.photos/400/300?random=${product._id}`}
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

            {/* Rating Stats Summary */}
            <div className="glass-card rating-stats-card">
              <h3>Rating Summary</h3>
              
              <div className="rating-summary-hero">
                <div className="average-num">{averageRating}</div>
                <div className="average-meta">
                  {renderStars(Math.round(parseFloat(averageRating)), "20px")}
                  <span className="total-count-label">Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}</span>
                </div>
              </div>

              <div className="distribution-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percentage = getRatingPercentage(star);
                  return (
                    <div className="dist-row" key={star}>
                      <span className="star-label">{star} ★</span>
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

          {/* RIGHT COLUMN: Review Form & Review Feed */}
          <div className="layout-main-content">
            
            {/* Review Input / Edit Form */}
            <div className="glass-card review-form-card">
              <h3>{editingReviewId ? "✏️ Edit Review" : "✍️ Share Your Feedback"}</h3>
              <p className="card-subtitle">Your rating and feedback help other customers make informed decisions.</p>
              
              <form onSubmit={handleSubmitReview} className="interactive-review-form">
                {validationError && <div className="form-error-banner">⚠️ {validationError}</div>}
                
                <div className="form-grid">
                  <div className="input-wrapper">
                    <label>Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="input-wrapper">
                    <label>Rating</label>
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
                        {rating > 0 ? `${rating} of 5 stars selected` : "Select stars"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="input-wrapper full-width">
                  <label>Review Message</label>
                  <textarea
                    placeholder="Write detailed reviews, share features you liked or disliked, and help others select this product..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows="4"
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="form-action-row">
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-secondary"
                      disabled={submitting}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="spinner-mini"></div>
                    ) : editingReviewId ? (
                      "Save Changes"
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Filter and Feed Section */}
            <div className="glass-card review-feed-card">
              <div className="feed-header-controls">
                <h3>Reviews Feed ({sortedReviews.length})</h3>
                
                <div className="filters-row">
                  <div className="search-bar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by username..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset page to 1
                      }}
                    />
                  </div>

                  <div className="sort-selector">
                    <label>Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1); // Reset page to 1
                      }}
                    >
                      <option value="latest">Latest</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                    </select>
                  </div>
                </div>
              </div>

              {loadingReviews ? (
                <div className="loader-container inner">
                  <div className="custom-spinner"></div>
                  <p>Fetching reviews feed...</p>
                </div>
              ) : currentReviewsList.length === 0 ? (
                <div className="empty-state-container">
                  <div className="empty-icon-wrapper">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h4>No reviews found</h4>
                  <p>
                    {searchQuery
                      ? `No reviews match search term "${searchQuery}".`
                      : "Be the first to review this product and share your experience with the community!"}
                  </p>
                </div>
              ) : (
                <div className="reviews-feed-list">
                  {currentReviewsList.map((review) => {
                    const reviewDate = new Date(review.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });

                    // Generate avatar initials
                    const initials = review.userName
                      ? review.userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                      : "U";

                    return (
                      <div className="review-card-item" key={review._id}>
                        <div className="review-card-header">
                          <div className="reviewer-avatar">{initials}</div>
                          <div className="reviewer-meta">
                            <h4>{review.userName}</h4>
                            <span className="review-date-label">{reviewDate}</span>
                          </div>
                          <div className="reviewer-rating">
                            {renderStars(review.rating, "14px")}
                          </div>
                        </div>

                        <p className="review-text-message">{review.reviewText}</p>

                        <div className="review-card-footer">
                          {/* Allow user to edit/delete their own review if they created it */}
                          <button
                            className="btn-edit-link"
                            onClick={() => handleEditClick(review)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                          </button>
                          <button
                            className="btn-delete-link"
                            onClick={() => setConfirmDeleteId(review._id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pagination-bar">
                      <button
                        className="pagination-btn arrow"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          className={`pagination-btn num ${currentPage === pageNum ? "active" : ""}`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
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
        <div className="error-state-card glass-card">
          <h2>Product Not Found</h2>
          <p>The product you are trying to review could not be retrieved from our inventory database.</p>
          <Link to="/store" className="btn-primary inline-btn">Back to Store</Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <div className="modal-content delete-confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className="warning-badge-icon">🗑️</div>
            <h3>Delete Review?</h3>
            <p>This action is permanent and cannot be undone. Are you sure you want to remove your rating and feedback?</p>
            <div className="modal-actions-row">
              <button
                className="btn-danger"
                onClick={handleDeleteReview}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
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

export default ProductReviewsPage;
