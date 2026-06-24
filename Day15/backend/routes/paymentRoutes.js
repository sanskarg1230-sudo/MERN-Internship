const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentStats,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// All payment routes require authentication
router.use(protect);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.get("/history", getPaymentHistory);
router.get("/stats", getPaymentStats);

module.exports = router;
