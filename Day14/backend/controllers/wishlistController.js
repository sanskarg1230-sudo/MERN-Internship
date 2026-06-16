const Wishlist = require(
  "../models/Wishlist"
);

const getWishlist = async (
  req,
  res
) => {
  try {
    const wishlist =
      await Wishlist.find().populate(
        "product"
      );

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const addToWishlist = async (
  req,
  res
) => {
  try {
    const item =
      await Wishlist.create({
        product: req.body.product,
      });

    const wishlist =
      await Wishlist.findById(
        item._id
      ).populate("product");

    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const removeFromWishlist =
  async (req, res) => {
    try {
      await Wishlist.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Removed from wishlist",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};