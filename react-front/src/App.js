import logo from './logo.svg';
import './App.css';
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import HomePatron from "./pages/HomePatron";
import HomeCreator from "./pages/HomeCreator";
import HomeAdmin from "./pages/HomeAdmin";
import CreatorsList from "./pages/CreatorsList";
import CreatorDetails from "./pages/CreatorDetails";
import MySubscriptions from "./pages/MySubscriptions";
import ProtectedRoute from "./components/ProtectedRoute";
import { getUserTip, getUserRole } from "./utils/auth";
import MyTiers from "./pages/MyTiers";
import MyPosts from "./pages/MyPosts";
import MyProfile from "./pages/MyProfile";
import HomeGuest from "./pages/HomeGuest";


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
      <Route path="/guest-home" element={<HomeGuest />} />

      <Route path="/home-patron" element={<ProtectedRoute><HomePatron /></ProtectedRoute>} />
      <Route path="/home-creator" element={<ProtectedRoute><HomeCreator /></ProtectedRoute>} />
      <Route path="/admin/stats" element={<ProtectedRoute requiredRole="admin"><HomeAdmin /></ProtectedRoute>} />
      <Route path="/creators" element={<ProtectedRoute><CreatorsList /></ProtectedRoute>} />
      <Route path="/creators/:id" element={<ProtectedRoute><CreatorDetails /></ProtectedRoute>} />
      <Route path="/my-subscriptions" element={<ProtectedRoute><MySubscriptions /></ProtectedRoute>} />
      <Route path="/my-tiers" element={<ProtectedRoute><MyTiers /></ProtectedRoute>}/>
      <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>}/>
      <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;