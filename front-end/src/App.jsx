import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { CustomerLayout } from "./layouts/CustomerLayout.jsx";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { Typography, Box } from "@mui/material";
import { ToursPage } from "./pages/customer/ToursPage.jsx";
import { AdminToursPage } from "./pages/admin/AdminToursPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage.jsx";
import ProfilePage from "./pages/customer/ProfilePage.jsx";
import TourDetailPage from "./pages/customer/TourDetailPage.jsx";
import JoinTourPage from "./pages/customer/JoinTourPage.jsx";
import HomePage from "./pages/customer/HomePage.jsx";

const AdminDashboard = () => <Box><Typography variant="h4">Admin Dashboard</Typography><Typography>Overview of system statistics.</Typography></Box>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CustomerLayout><Outlet /></CustomerLayout>}>
          <Route index element={<HomePage />} />
          <Route path="tours" element={<ToursPage />} />
          <Route path="tours/:id" element={<TourDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
          <Route index element={<AdminDashboard />} />
          <Route path="tours" element={<AdminToursPage />} />
          <Route path="tours/:id" element={<TourDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* Standalone join route — no nav layout */}
        <Route path="/join/:token" element={<JoinTourPage />} />
      </Routes>
    </Router>
  );
}

export default App;
