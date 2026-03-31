import { useAuth } from "../features/auth/useAuth";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user?.role === "Admin" || user?.role === "SuperAdmin" ? <>{children}</> : <Navigate to="/" />;
}
