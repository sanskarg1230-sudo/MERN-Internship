const Product = require("../models/Product");

const getProducts = async (req, res) => {
  const products = await Product.find()
    .populate("category", "name");

  res.json(products);
};

const createProduct = async (req, res) => {
  const product = await Product.create(
    req.body
  );

  res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(product);
};

const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "Product Deleted",
  });
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};