const Wishlist = require("../models/Wishlist");

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).populate("product");
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { product } = req.body;

    const existing = await Wishlist.findOne({
      user: req.user._id,
      product,
    });

    if (existing) {
      return res.json(existing);
    }

    const item = await Wishlist.create({
      user: req.user._id,
      product,
    });

    const populatedItem = await Wishlist.findById(item._id).populate("product");
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};