const express = require("express");

const router = express.Router();

const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getCart);

router.post("/", addToCart);

router.put("/:id", updateQuantity);

router.delete("/", clearCart);

router.delete("/:id", removeFromCart);

module.exports = router;