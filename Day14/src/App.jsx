import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WishlistProvider } from "./context/WishlistContext";
import Dashboard from "./pages/Dashboard";
import Store from "./pages/Store";
import CartPage from "./pages/CartPage";
import "./App.css";
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { CartProvider } from "./context/CartContext";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";

function App() {
  return (
    <BrowserRouter>
      <CategoryProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                <Route path="/" element={<Dashboard />} />

                <Route path="/store" element={<Store />} />

                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Routes>
              <ToastContainer position="top-right" autoClose={2000} />
            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </CategoryProvider>
    </BrowserRouter>
  );
}

export default App;
