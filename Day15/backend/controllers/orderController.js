const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

// Place a new order
const createOrder = async (req, res) => {
  try {
    const { products, customerDetails, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order list" });
    }

    // Validate and update stock
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
    }

    // Decrement stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create Order associated with the logged-in user
    const order = await Order.create({
      user: req.user._id,
      products,
      customerDetails,
      shippingAddress,
      paymentMethod,
      totalAmount,
      status: "Pending"
    });

    // Clear user's cart
    await Cart.deleteMany({ user: req.user._id });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders (Admins see all; Customers see their own)
const getOrders = async (req, res) => {
  try {
    let query = {};
    
    // If not Admin, filter by user
    if (req.user.role !== "admin") {
      query = { user: req.user._id };
    }

    const orders = await Order.find(query)
      .populate("products.product")
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If status is updated to Cancelled and it wasn't Cancelled already, restore stock
    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    } 
    // If status is changed FROM Cancelled to something else, check and decrement stock
    else if (order.status === "Cancelled" && status !== "Cancelled") {
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock to restore order for product` });
        }
      }
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    order.status = status;
    await order.save();
    
    const updatedOrder = await Order.findById(order._id).populate("products.product");
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order (User - only if Pending and matches their order)
const cancelOrder = async (req, res) => {
  try {
    // Customers can only cancel their own orders
    const query = { _id: req.params.id };
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Only Pending orders can be cancelled" });
    }

    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = "Cancelled";
    await order.save();

    const updatedOrder = await Order.findById(order._id).populate("products.product");
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete order (Admin)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
};
