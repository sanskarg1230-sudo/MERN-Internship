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

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};