const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

// All order routes require login
router.use(protect);

router.get("/", getOrders);
router.post("/", createOrder);
router.put("/:id/cancel", cancelOrder);

// Admin only routes
router.put("/:id/status", admin, updateOrderStatus);
router.delete("/:id", admin, deleteOrder);

module.exports = router;
