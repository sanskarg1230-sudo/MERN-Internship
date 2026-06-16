const express = require("express");

const router = express.Router();

const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
} = require("../controllers/cartController");

router.get("/", getCart);

router.post("/", addToCart);

router.put("/:id", updateQuantity);

router.delete("/:id", removeFromCart);

module.exports = router;