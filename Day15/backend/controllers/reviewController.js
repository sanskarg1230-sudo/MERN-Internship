const Review = require("../models/Review");
const Product = require("../models/Product");

// Helper to recalculate and update product's rating stats
const updateProductRatingStats = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    const totalReviews = reviews.length;

    let averageRating = 0;
    if (totalReviews > 0) {
      const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0);
      // Round to 1 decimal place
      averageRating = Math.round((totalRatingSum / totalReviews) * 10) / 10;
    }

    await Product.findByIdAndUpdate(productId, {
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error("Error updating product rating statistics:", error);
  }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Validation
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Optional: Prevent user from reviewing the same product twice
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product. Edit your existing review instead." });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Update product rating stats
    await updateProductRatingStats(productId);

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error while adding review" });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error while fetching reviews" });
  }
};

// @desc    Get all reviews in the system (Admin only)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    // Check admin privilege
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const reviews = await Review.find()
      .populate("user", "name email role")
      .populate("product", "name price")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: "Server error while fetching all reviews" });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Owner or Admin)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Validation
    if (!rating) {
      return res.status(400).json({ message: "Rating is required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check authorization: Owner or Admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to edit this review" });
    }

    review.rating = Number(rating);
    review.comment = comment.trim();
    await review.save();

    // Recalculate stats for product
    await updateProductRatingStats(review.product);

    res.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error while updating review" });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner or Admin)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check authorization: Owner or Admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(id);

    // Recalculate stats for product
    await updateProductRatingStats(productId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error while deleting review" });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReview,
  deleteReview,
};
