import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return <Loading label="인증 확인 중입니다..." />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
