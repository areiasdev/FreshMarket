import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import { useAuth } from "../features/auth/useAuth";
import AdminRoute from "./AdminRoute";

const AuthPage        = lazy(() => import("../pages/AuthPage"));
const PrivacyPage     = lazy(() => import("../pages/PrivacyPage"));
const TermsPage       = lazy(() => import("../pages/TermsPage"));
const AdminPage       = lazy(() => import("../features/admin/AdminPage"));
const CartPage        = lazy(() => import("../pages/CartPage"));
const CheckoutPage    = lazy(() => import("../pages/CheckoutPage"));
const OrdersPage      = lazy(() => import("../pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("../pages/OrderDetailPage"));
const AccountPage     = lazy(() => import("../pages/AccountPage"));
const PaymentResultPage = lazy(() => import("../pages/PaymentResultPage"));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
}

export { PrivateRoute };

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
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
          <Route path="/payment/result" element={<PaymentResultPage />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
