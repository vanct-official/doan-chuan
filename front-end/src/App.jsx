import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { CustomerLayout } from "./layouts/CustomerLayout.jsx";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { Typography, Box, CircularProgress } from "@mui/material";
import { PwaProvider } from "./components/pwa/PwaProvider.jsx";

// Lazy load — giảm initial bundle, tải page khi cần
const HomePage = lazy(() => import("./pages/customer/HomePage.jsx"));
const ToursPage = lazy(() =>
  import("./pages/customer/ToursPage.jsx").then((m) => ({ default: m.ToursPage }))
);
const TourDetailPage = lazy(() => import("./pages/customer/TourDetailPage.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage.jsx"));
const JoinTourPage = lazy(() => import("./pages/customer/JoinTourPage.jsx"));
const AdminToursPage = lazy(() =>
  import("./pages/admin/AdminToursPage.jsx").then((m) => ({ default: m.AdminToursPage }))
);
const AdminUsersPage = lazy(() =>
  import("./pages/admin/AdminUsersPage.jsx").then((m) => ({ default: m.AdminUsersPage }))
);

const PageLoader = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
    <CircularProgress />
  </Box>
);

const AdminDashboard = () => (
  <Box>
    <Typography variant="h4">Admin Dashboard</Typography>
    <Typography>Overview of system statistics.</Typography>
  </Box>
);

function App() {
  return (
    <Router>
      <PwaProvider>
        <Suspense fallback={<PageLoader />}>
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

            <Route path="/join/:token" element={<JoinTourPage />} />
          </Routes>
        </Suspense>
      </PwaProvider>
    </Router>
  );
}

export default App;
