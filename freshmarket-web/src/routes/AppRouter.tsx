import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";
import { useAuth } from "../features/auth/useAuth";
import AdminRoute from "./AdminRoute";
import AdminPage from "../pages/admin/AdminPage";

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
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/admin" element={
        <PrivateRoute>
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        </PrivateRoute>
      } />
      </Routes>
    </BrowserRouter>
  );
}
