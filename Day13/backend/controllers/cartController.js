const Cart = require("../models/Cart");

const getCart = async (req, res) => {
  const cart = await Cart.find().populate(
    "product"
  );

  res.json(cart);
};

const addToCart = async (req, res) => {
  const { product } = req.body;

  const existing = await Cart.findOne({
    product,
  });

  if (existing) {
    existing.quantity += 1;

    await existing.save();

    return res.json(existing);
  }

  const cartItem = await Cart.create({
    product,
    quantity: 1,
  });

  res.status(201).json(cartItem);
};

const updateQuantity = async (
  req,
  res
) => {
  const item =
    await Cart.findByIdAndUpdate(
      req.params.id,
      {
        quantity: req.body.quantity,
      },
      { new: true }
    );

  res.json(item);
};

const removeFromCart = async (
  req,
  res
) => {
  await Cart.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "Item Removed",
  });
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
};