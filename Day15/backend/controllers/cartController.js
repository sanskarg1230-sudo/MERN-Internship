const Cart = require("../models/Cart");

const getCart = async (req, res) => {
  try {
    const cart = await Cart.find({ user: req.user._id }).populate("product");
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { product } = req.body;

    const existing = await Cart.findOne({
      user: req.user._id,
      product,
    });

    if (existing) {
      existing.quantity += 1;
      await existing.save();
      return res.json(existing);
    }

    const cartItem = await Cart.create({
      user: req.user._id,
      product,
      quantity: 1,
    });

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateQuantity = async (req, res) => {
  try {
    const item = await Cart.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { quantity: req.body.quantity },
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Item Removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ user: req.user._id });
    res.json({ message: "Cart Cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};