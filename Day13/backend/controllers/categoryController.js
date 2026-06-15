const Category = require("../models/Category");

const getCategories = async (req, res) => {
  const categories = await Category.find();

  res.json(categories);
};

const createCategory = async (req, res) => {
  const category = await Category.create({
    name: req.body.name,
  });

  res.status(201).json(category);
};

const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(category);
};

const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: "Category Deleted",
  });
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};