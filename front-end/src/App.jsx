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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12, flexDirection: 'column', gap: 2 }}>
        <CircularProgress size={44} thickness={4} />
        <Typography variant="body2" color="text.secondary">Đang tải dữ liệu bảng điều khiển...</Typography>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Tổng số Tour',
      value: stats?.totalTours || 0,
      sub: `${stats?.activeTours || 0} tour đang/sắp chạy`,
      icon: <TourIcon sx={{ fontSize: 26 }} />,
      color: '#0284c7',
      bgGradient: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(6, 182, 212, 0.04) 100%)',
      borderColor: 'rgba(2, 132, 199, 0.25)',
      trend: 'Đang hoạt động'
    },
    {
      title: 'Người dùng hệ thống',
      value: stats?.totalUsers || 0,
      sub: 'Tài khoản đăng ký',
      icon: <PeopleIcon sx={{ fontSize: 26 }} />,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(168, 85, 247, 0.04) 100%)',
      borderColor: 'rgba(139, 92, 246, 0.25)',
      trend: 'Toàn hệ thống'
    },
    {
      title: 'Hành khách duyệt',
      value: stats?.totalPassengers || 0,
      sub: 'Lượt khách tham gia các tour',
      icon: <AirlineSeatReclineNormalIcon sx={{ fontSize: 26 }} />,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.25)',
      trend: 'Lượt tham quan'
    },
    {
      title: 'Đội xe điều phối',
      value: stats?.totalVehicles || 0,
      sub: 'Phương tiện sẵn sàng phục vụ',
      icon: <DirectionsCarIcon sx={{ fontSize: 26 }} />,
      color: '#f97316',
      bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)',
      borderColor: 'rgba(249, 115, 22, 0.25)',
      trend: 'Đoàn xe'
    }
  ];

  return (
    <Box sx={{ p: 0.5 }}>
      {/* Dashboard Top Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}>
            {t('common.navigation.dashboard') || 'Tổng Quan Hệ Thống'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Báo cáo số liệu thời gian thực và quản lý các hoạt động điều phối tour
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TourIcon />}
            onClick={() => navigate('/admin/tours')}
            sx={{ borderRadius: 9999, px: 3, fontWeight: 700 }}
          >
            Quản Lý Tour
          </Button>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

      {/* Stats Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {statCards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 5, 
                p: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                background: c.bgGradient,
                border: `1px solid ${c.borderColor}`,
                boxShadow: '0 8px 24px -6px rgba(0,0,0,0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 32px -8px rgba(0,0,0,0.12)',
                  borderColor: c.color,
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {c.title}
                </Typography>
                <Avatar sx={{ bgcolor: alpha(c.color, 0.15), color: c.color, width: 44, height: 44, borderRadius: 3 }}>
                  {c.icon}
                </Avatar>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, color: 'text.primary', letterSpacing: '-0.02em' }}>
                {c.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {c.sub}
                </Typography>
                <Chip 
                  label={c.trend} 
                  size="small" 
                  sx={{ 
                    height: 22, 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    bgcolor: alpha(c.color, 0.12), 
                    color: c.color 
                  }} 
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Tours Table */}
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 5, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <CardHeader
          title="Các Chuyến Tour Gần Đây"
          titleTypographyProps={{ fontWeight: 800, fontSize: '1.15rem', color: 'text.primary' }}
          action={
            <Button 
              size="small" 
              onClick={() => navigate('/admin/tours')} 
              endIcon={<ArrowForwardIcon />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 9999, px: 2 }}
            >
              Xem tất cả tour
            </Button>
          }
          sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3, py: 2 }}
        />
        <TableContainer sx={{ boxShadow: 'none' }}>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Tên Tour</TableCell>
                <TableCell>Trưởng đoàn</TableCell>
                <TableCell>Khởi hành</TableCell>
                <TableCell>Kết thúc</TableCell>
                <TableCell align="center">Sức chứa</TableCell>
                <TableCell align="center" sx={{ pr: 3 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!stats?.recentTours || stats.recentTours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}>
                    Chưa có tour nào được tạo trong hệ thống.
                  </TableCell>
                </TableRow>
              ) : (
                stats.recentTours.map((t) => (
                  <TableRow key={t._id} hover sx={{ transition: 'background-color 0.2s' }}>
                    <TableCell sx={{ fontWeight: 700, pl: 3, color: 'text.primary' }}>{t.name}</TableCell>
                    <TableCell>{t.leader_id?.name || 'Chưa chỉ định'}</TableCell>
                    <TableCell>
                      {new Date(t.start_time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell>
                      {new Date(t.end_time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${t.max_capacity} khách`} size="small" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center" sx={{ pr: 3 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/admin/tours/${t._id}`)}
                        sx={{ borderRadius: 9999, fontWeight: 700, px: 2 }}
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
