import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../App.css";

function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "Cash on Delivery",
  });
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const { name, email, phone, address, city, state, pincode, paymentMethod } = formData;
    if (!name || !email || !phone || !address || !city || !state || !pincode) {
      toast.warn("Please fill in all shipping information fields.");
      return;
    }

    const orderProducts = cart.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const orderData = {
      products: orderProducts,
      customerDetails: { name, email, phone },
      shippingAddress: { address, city, state, pincode },
      paymentMethod,
      totalAmount: total,
    };

    const res = await placeOrder(orderData);

    if (res.success) {
      fetchCart(); // reload/empty frontend cart
      if (paymentMethod === "Cash on Delivery") {
        toast.success("Order Placed Successfully! 🎉");
        setPlacedOrder(res.order);
        setShowSuccessModal(true);
      } else {
        toast.success("Order Placed! Redirecting to secure payment... 💳");
        navigate(`/payment?orderId=${res.order._id}`);
      }
    } else {
      toast.error(res.message || "Failed to place order.");
    }
  };

  return (
    <div className="container">
      <div className="store-header">
        <h1>Checkout 💳</h1>
        <p className="store-tagline">Complete your shipping and payment information to place the order</p>
      </div>

      {cart.length === 0 && !showSuccessModal ? (
        <div className="card empty-checkout-card">
          <h2>Your Cart is Empty</h2>
          <p>You must add items to your cart before checking out.</p>
          <Link to="/store" style={{ marginTop: "20px", display: "inline-block" }}>
            <button className="store-btn">Go to Store</button>
          </Link>
        </div>
      ) : (
        <div className="checkout-grid">
          {/* Shipping Form */}
          <div className="card checkout-form-card">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="form-row grid-2">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Flat/House No, Building, Street"
                    required
                  />
                </div>
              </div>

              <div className="form-row grid-3">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="place-order-large-btn">
                Place Order (₹{total})
              </button>
            </form>
          </div>

          {/* Order Summary Card */}
          <div className="card order-summary-card">
            <h2>Order Summary</h2>
            <div className="checkout-items-list">
              {cart.map((item) => (
                <div key={item._id} className="checkout-item-row">
                  <img
                    src={`https://picsum.photos/80/60?random=${item.product._id}`}
                    alt={item.product.name}
                    className="checkout-item-img"
                  />
                  <div className="checkout-item-details">
                    <h4>{item.product.name}</h4>
                    <p>
                      {item.quantity} × ₹{item.product.price}
                    </p>
                  </div>
                  <div className="checkout-item-subtotal">
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              <hr />
              <div className="summary-row grand-total-row">
                <strong>Total Amount</strong>
                <strong>₹{total}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && placedOrder && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="success-icon-container">
              <span className="success-check">✓</span>
            </div>
            <h2>Order Placed Successfully!</h2>
            <p className="success-sub">Thank you for your purchase. Your order has been registered.</p>

            <div className="success-details-card">
              <p><strong>Order ID:</strong> #{placedOrder._id}</p>
              <p><strong>Customer Name:</strong> {placedOrder.customerDetails?.name}</p>
              <p><strong>Total Amount:</strong> ₹{placedOrder.totalAmount}</p>
              <p><strong>Payment Method:</strong> {placedOrder.paymentMethod}</p>
            </div>

            <div className="success-actions">
              <Link to="/orders">
                <button className="success-btn-primary">View My Orders</button>
              </Link>
              <Link to="/store">
                <button className="success-btn-secondary">Continue Shopping</button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;