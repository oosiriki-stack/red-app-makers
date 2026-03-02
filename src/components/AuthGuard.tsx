import { Navigate, Outlet } from "react-router-dom";

export function AuthGuard() {
  const isLoggedIn = localStorage.getItem("arobase_logged_in") === "true";
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
}
