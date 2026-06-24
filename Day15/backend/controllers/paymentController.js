const crypto = require("crypto");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

// Check if Razorpay credentials are set up
const isRazorpayConfigured = () => {
  return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
};

// Create a new Razorpay Order or Mock Order
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Razorpay amount is in paise (multiply by 100)
    const amountInPaise = Math.round(order.totalAmount * 100);

    if (isRazorpayConfigured()) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: order._id.toString(),
      };

      const razorpayOrder = await razorpay.orders.create(options);

      res.status(200).json({
        success: true,
        isMock: false,
        key: process.env.RAZORPAY_KEY_ID,
        order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
        orderDetail: {
          id: order._id,
          amount: order.totalAmount,
          customer: order.customerDetails,
        },
      });
    } else {
      // Mock flow when Razorpay keys are not provided
      const mockRazorpayOrderId = `order_mock_${Math.random().toString(36).substr(2, 9)}`;

      res.status(200).json({
        success: true,
        isMock: true,
        key: "rzp_test_mock_key_id",
        order: {
          id: mockRazorpayOrderId,
          amount: amountInPaise,
          currency: "INR",
        },
        orderDetail: {
          id: order._id,
          amount: order.totalAmount,
          customer: order.customerDetails,
        },
      });
    }
  } catch (error) {
    console.error("Create payment order error:", error);
    res.status(500).json({ message: error.message || "Failed to create payment order" });
  }
};

// Verify payment signature
const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod,
      status, // Can be "Success" or "Failed" (passed during mock simulation)
      failureReason,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 1. If it's a simulated failed transaction
    if (status === "Failed") {
      const failedPayment = await Payment.create({
        transactionId: razorpay_payment_id || `txn_failed_${Math.random().toString(36).substr(2, 9)}`,
        orderId: order._id,
        user: req.user._id,
        amount: order.totalAmount,
        paymentMethod: paymentMethod || "UPI",
        status: "Failed",
        failureReason: failureReason || "Payment rejected by user or bank",
        razorpayOrderId: razorpay_order_id,
      });

      // Keep order status as Pending or update as appropriate (maybe leave pending/cancelled)
      // For failed payments, order status remains Pending so user can retry.
      return res.status(200).json({
        success: false,
        message: "Payment failed log recorded",
        payment: failedPayment,
      });
    }

    // 2. Real signature verification
    let isSignatureValid = false;
    const isMock = !isRazorpayConfigured() || razorpay_order_id.startsWith("order_mock_");

    if (isMock) {
      // Mock signature verification passes automatically
      isSignatureValid = true;
    } else {
      // Real Razorpay signature validation
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      isSignatureValid = generated_signature === razorpay_signature;
    }

    if (isSignatureValid) {
      // Update order status to Processing (since payment was successful)
      order.status = "Processing";
      await order.save();

      // Create Payment log
      const payment = await Payment.create({
        transactionId: razorpay_payment_id || `txn_success_${Math.random().toString(36).substr(2, 9)}`,
        orderId: order._id,
        user: req.user._id,
        amount: order.totalAmount,
        paymentMethod: paymentMethod || "UPI",
        status: "Success",
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature || "mock_signature",
      });

      res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        payment,
      });
    } else {
      // Signature is invalid (tampered or incorrect)
      const failedPayment = await Payment.create({
        transactionId: razorpay_payment_id || `txn_failed_${Math.random().toString(36).substr(2, 9)}`,
        orderId: order._id,
        user: req.user._id,
        amount: order.totalAmount,
        paymentMethod: paymentMethod || "UPI",
        status: "Failed",
        failureReason: "Signature verification failed",
        razorpayOrderId: razorpay_order_id,
      });

      res.status(400).json({
        success: false,
        message: "Signature verification failed",
        payment: failedPayment,
      });
    }
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: error.message || "Payment verification failed" });
  }
};

// Get Payment History
const getPaymentHistory = async (req, res) => {
  try {
    let query = {};

    // Customers see their own payments; Admins see all
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    // Apply Status Filter
    if (req.query.status && req.query.status !== "All") {
      query.status = req.query.status;
    }

    let payments = await Payment.find(query)
      .populate("orderId")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Apply Search Filter (Search by Transaction ID or User name/email or Order ID)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      payments = payments.filter((payment) => {
        const matchesTxId = payment.transactionId && String(payment.transactionId).match(searchRegex);
        
        let matchesOrderId = false;
        if (payment.orderId) {
          const orderIdStr = payment.orderId._id 
            ? String(payment.orderId._id) 
            : String(payment.orderId);
          matchesOrderId = orderIdStr.match(searchRegex);
        }

        let matchesUser = false;
        if (payment.user) {
          const nameMatch = payment.user.name && String(payment.user.name).match(searchRegex);
          const emailMatch = payment.user.email && String(payment.user.email).match(searchRegex);
          matchesUser = nameMatch || emailMatch;
        }

        return matchesTxId || matchesOrderId || matchesUser;
      });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve history" });
  }
};

// Get Payment Dashboard Analytics
const getPaymentStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      query.user = req.user._id;
    }

    const allPayments = await Payment.find(query);

    const totalTransactions = allPayments.length;
    const successfulPayments = allPayments.filter((p) => p.status === "Success").length;
    const failedPayments = allPayments.filter((p) => p.status === "Failed").length;
    const pendingPayments = allPayments.filter((p) => p.status === "Pending").length;

    const totalRevenue = allPayments
      .filter((p) => p.status === "Success")
      .reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      totalTransactions,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalRevenue,
    });
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json({ message: error.message || "Failed to retrieve statistics" });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentStats,
};
