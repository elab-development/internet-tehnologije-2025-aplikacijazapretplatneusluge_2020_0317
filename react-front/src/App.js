import logo from './logo.svg';
import './App.css';
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import HomePatron from "./pages/HomePatron";
import HomeCreator from "./pages/HomeCreator"; // kreiraćete
import HomeAdmin from "./pages/HomeAdmin";
import CreatorsList from "./pages/CreatorsList";
import CreatorDetails from "./pages/CreatorDetails";
import MySubscriptions from "./pages/MySubscriptions";
import ProtectedRoute from "./components/ProtectedRoute";
import { getUserTip, getUserRole } from "./utils/auth";

function RoleRedirect() {
  const tip = getUserTip();
  const role = getUserRole();
  if (role === "admin") return <Navigate to="/admin/stats" />;
  if (tip === "patron") return <Navigate to="/home-patron" />;
  if (tip === "kreator") return <Navigate to="/home-creator" />;
  if (tip === "oba") return <Navigate to="/home-patron" />;
  return <Navigate to="/auth" />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/auth" element={<Auth />} />

      <Route path="/home-patron" element={<ProtectedRoute><HomePatron /></ProtectedRoute>} />
      <Route path="/home-creator" element={<ProtectedRoute><HomeCreator /></ProtectedRoute>} />
      <Route path="/admin/stats" element={<ProtectedRoute requiredRole="admin"><HomeAdmin /></ProtectedRoute>} />
      <Route path="/creators" element={<ProtectedRoute><CreatorsList /></ProtectedRoute>} />
      <Route path="/creators/:id" element={<ProtectedRoute><CreatorDetails /></ProtectedRoute>} />
      <Route path="/my-subscriptions" element={<ProtectedRoute><MySubscriptions /></ProtectedRoute>} />
      {/* ostale rute */}
    </Routes>
  );
}

export default App;