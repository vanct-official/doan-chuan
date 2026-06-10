import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, useNavigate, Navigate } from "react-router-dom";
import { CustomerLayout } from "./layouts/CustomerLayout.jsx";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { 
  Typography, Box, CircularProgress, Card, CardHeader, CardContent, 
  TextField, Button, Alert, Snackbar, Grid, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Avatar, Chip, Stack
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import TourIcon from '@mui/icons-material/Tour';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { PwaProvider } from "./components/pwa/PwaProvider.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { useTranslate } from "./hooks/useTranslate.js";
import { settingService } from './services/settingService';
import { dashboardService } from './services/dashboardService';

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
const AdminTourDetailPage = lazy(() => import("./pages/admin/AdminTourDetailPage.jsx"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage.jsx"));


const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
    <CircularProgress />
  </Box>
);

const AdminDashboard = () => {
  const { t } = useTranslate(['common', 'tour']);
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (res && res.success) {
          setStats(res.data);
        } else {
          setError('Không thể lấy thống kê.');
        }
      } catch (err) {
        console.error('Lỗi khi tải thống kê:', err);
        setError(err.response?.data?.message || err.message || 'Lỗi khi tải thống kê.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Tổng số Tour',
      value: stats?.totalTours || 0,
      sub: `${stats?.activeTours || 0} tour đang/sắp chạy`,
      icon: <TourIcon sx={{ fontSize: 28 }} />,
      color: '#4f46e5',
      bgcolor: 'rgba(79, 70, 229, 0.08)'
    },
    {
      title: 'Tổng người dùng',
      value: stats?.totalUsers || 0,
      sub: 'Tài khoản đăng ký hệ thống',
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: '#06b6d4',
      bgcolor: 'rgba(6, 182, 212, 0.08)'
    },
    {
      title: 'Hành khách duyệt',
      value: stats?.totalPassengers || 0,
      sub: 'Tổng số lượt khách tham gia các tour',
      icon: <AirlineSeatReclineNormalIcon sx={{ fontSize: 28 }} />,
      color: '#10b981',
      bgcolor: 'rgba(16, 185, 129, 0.08)'
    },
    {
      title: 'Số phương tiện xe',
      value: stats?.totalVehicles || 0,
      sub: 'Xe được điều động phục vụ đoàn',
      icon: <DirectionsCarIcon sx={{ fontSize: 28 }} />,
      color: '#f59e0b',
      bgcolor: 'rgba(245, 158, 11, 0.08)'
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            {t('common.navigation.dashboard')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thống kê tổng quan và quản lý hoạt động hệ thống
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: 'background.paper', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <ShowChartIcon color="primary" />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Hệ thống đang hoạt động</Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {statCards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card variant="outlined" sx={{ borderRadius: 4, p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', borderLeft: `5px solid ${c.color}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {c.title}
                </Typography>
                <Avatar sx={{ bgcolor: c.bgcolor, color: c.color, width: 46, height: 46 }}>
                  {c.icon}
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: 'text.primary' }}>
                {c.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', display: 'block' }}>
                {c.sub}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Tours Table */}
      <Card variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <CardHeader
          title="Các Tour du lịch gần đây"
          titleTypographyProps={{ fontWeight: 800, fontSize: '1.15rem' }}
          action={
            <Button 
              size="small" 
              onClick={() => navigate('/admin/tours')} 
              endIcon={<ArrowForwardIcon />}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Xem tất cả
            </Button>
          }
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 2 }}
        />
        <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
          <Table size="medium">
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', pl: 3 }}>Tên Tour</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Trưởng đoàn</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Thời gian khởi hành</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Thời gian kết thúc</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="center">Sức chứa</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', pr: 3 }} align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!stats?.recentTours || stats.recentTours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}>
                    Chưa có tour nào được tạo.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentTours.map((t) => (
                  <TableRow key={t._id} hover>
                    <TableCell sx={{ fontWeight: 'bold', pl: 3 }}>{t.name}</TableCell>
                    <TableCell>{t.leader_id?.name || 'Chưa chỉ định'}</TableCell>
                    <TableCell>
                      {new Date(t.start_time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell>
                      {new Date(t.end_time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell align="center">{t.max_capacity} khách</TableCell>
                    <TableCell align="center" sx={{ pr: 3 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/admin/tours/${t._id}`)}
                        sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 'bold' }}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

const CustomerRouteGuard = ({ children }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (user && user.role === 'admin') {
    const lastAdminPath = localStorage.getItem('last_admin_path') || '/admin';
    return <Navigate to={lastAdminPath} replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <PwaProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<CustomerRouteGuard><CustomerLayout><Outlet /></CustomerLayout></CustomerRouteGuard>}>
                <Route index element={<HomePage />} />
                <Route path="tours" element={<ToursPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* TourDetail fullscreen — không bọc CustomerLayout (tránh 100vh + Header gây màn trắng) */}
              <Route path="/tours/:id" element={<CustomerRouteGuard><TourDetailPage /></CustomerRouteGuard>} />

              <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
                <Route index element={<AdminDashboard />} />
                <Route path="tours" element={<AdminToursPage />} />
                <Route path="tours/:id" element={<AdminTourDetailPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              <Route path="/join/:token" element={<CustomerRouteGuard><JoinTourPage /></CustomerRouteGuard>} />
            </Routes>
          </Suspense>
        </PwaProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
