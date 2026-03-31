import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";
import PrivacyPage from "../pages/PrivacyPage";
import TermsPage from "../pages/TermsPage";
import { useAuth } from "../features/auth/useAuth";
import AdminRoute from "./AdminRoute";
import AdminPage from "../features/admin/AdminPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import AccountPage from "../pages/AccountPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
}

export { PrivateRoute };

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/shop" element={<Navigate to="/" replace />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>} />
        <Route path="/orders/:id" element={
          <PrivateRoute>
            <OrderDetailPage />
          </PrivateRoute>} />
        <Route path="/account" element={
          <PrivateRoute>
            <AccountPage />
          </PrivateRoute>} />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          </PrivateRoute>
        } />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/termos" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}