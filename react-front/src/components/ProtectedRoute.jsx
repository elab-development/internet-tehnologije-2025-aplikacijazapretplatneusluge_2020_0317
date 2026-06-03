import React from "react";
import { Navigate } from "react-router-dom";
import { getAuth, getUserRole } from "../utils/auth";

export default function ProtectedRoute({ children, requiredRole }) {
  const auth = getAuth();

  if (!auth?.token) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole) {
    const role = getUserRole();
    if (role !== requiredRole) {
      return <Navigate to="/auth" replace />;
    }
  }

  return children;
}