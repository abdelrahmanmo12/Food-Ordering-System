import { BrowserRouter, Routes, Route } from "react-router-dom";
import QueryProvider from "./providers/QueryProvider";
import { AppProvider } from "../context/AppContext";
import { CartProvider } from "../context/CartContext";
import { NotificationProvider } from "../context/NotificationContext";
import { AuthProvider } from "../features/auth/AuthContext";
import ErrorBoundary from "../components/ErrorBoundary";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";

import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";
import Tracking from "../pages/Tracking";
import Checkout from "../pages/Checkout";
import PaymentSuccess from "../pages/PaymentSuccess";
import Auth from "../pages/Auth";
import Admin from "../pages/Admin";
import Owner from "../pages/Owner";
import Favorites from "../pages/Favorites";
import Driver from "../pages/driver";
import OwnerRegister from "../pages/OwnerRegister";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <AppProvider>
                <NotificationProvider>
                  <Navbar />

                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/menu/:id" element={<Menu />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/payment-success" element={<PaymentSuccess />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/tracking/:id" element={<Tracking />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/owner" element={<Owner />} />
                      <Route path="/register/owner" element={<OwnerRegister />} />
                      <Route path="/driver" element={<Driver />} />
                    </Routes>
                  </main>

                  <Toast />
                </NotificationProvider>
              </AppProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryProvider>
    </ErrorBoundary>
  );
}

