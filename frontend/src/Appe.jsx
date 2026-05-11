import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppProvider } from './context/AppContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'

import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/Navbar'
import Toast from './components/Toast'

import Home from './pages/Home'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Tracking from './pages/Tracking'
import Checkout from './pages/Checkout'
import Auth from './pages/Auth'
import Admin from './pages/Admin'
import Owner from './pages/Owner'
import Favorites from './pages/Favorites'
import Profile from './pages/profile';
import PaymentSuccess from './pages/PaymentSuccess';
import OwnerRegister from './pages/OwnerRegister';
import Driver from './pages/driver';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppProvider>
            <NotificationProvider>
              <CartProvider>

                <Navbar />

                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/menu/:id" element={<Menu />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/tracking/:orderId" element={<Tracking />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/owner" element={<Owner />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/register/owner" element={<OwnerRegister />} />
                    <Route path="/driver" element={<Driver />} />
                  </Routes>
                </main>

                <Toast />

              </CartProvider>
            </NotificationProvider>
          </AppProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}