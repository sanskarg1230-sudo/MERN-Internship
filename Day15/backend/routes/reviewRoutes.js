const express = require("express");
const router = express.Router();
const {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

// Protected CRUD routes
router.post("/", protect, createReview);
router.get("/", protect, getAllReviews); // Admin gets all reviews
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

// Public route to fetch reviews of a product
router.get("/product/:productId", getProductReviews);

module.exports = router;
