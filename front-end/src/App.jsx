import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { CustomerLayout } from "./layouts/CustomerLayout.jsx";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { 
  Typography, Box, CircularProgress, Card, CardHeader, CardContent, 
  TextField, Button, Alert, Snackbar 
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { PwaProvider } from "./components/pwa/PwaProvider.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { useTranslate } from "./hooks/useTranslate.js";
import { settingService } from './services/settingService';

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


const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
    <CircularProgress />
  </Box>
);

const AdminDashboard = () => {
  const { t } = useTranslate(['common', 'tour']);
  const [contactLink, setContactLink] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '', severity: 'success' });

  React.useEffect(() => {
    const fetchSetting = async () => {
      try {
        const data = await settingService.getSetting('contact_link');
        if (data && data.success) {
          setContactLink(data.value || '');
        }
      } catch (err) {
        console.error('Lỗi khi tải cấu hình liên hệ:', err);
        setError('Không thể tải cấu hình liên hệ từ máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchSetting();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = await settingService.updateSetting('contact_link', contactLink);
      if (data && data.success) {
        setToast({
          open: true,
          message: 'Cập nhật đường dẫn liên hệ thành công!',
          severity: 'success'
        });
      } else {
        setError('Không thể lưu cấu hình.');
      }
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình liên hệ:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
        {t('common.navigation.dashboard')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Quản lý cấu hình chung cho hệ thống
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>{error}</Alert>}

      <Card 
        elevation={4} 
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardHeader
          title="Cấu hình nút liên hệ hỗ trợ (FAB)"
          subheader="Đường dẫn liên lạc hiển thị ở góc dưới bên phải trang của khách hàng"
          titleTypographyProps={{ fontWeight: 'bold', fontSize: '1.2rem' }}
          subheaderTypographyProps={{ fontSize: '0.82rem' }}
          sx={{
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2.5,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSave}>
            <TextField
              fullWidth
              label="Đường dẫn liên hệ / Số điện thoại"
              variant="outlined"
              placeholder="Ví dụ: https://zalo.me/0987654321, tel:0987654321..."
              value={contactLink}
              onChange={(e) => setContactLink(e.target.value)}
              disabled={saving}
              sx={{ mb: 2 }}
              helperText="Hỗ trợ các đường dẫn Zalo, Facebook Messenger, số điện thoại (tel:), email (mailto:), hoặc đường dẫn trang web bất kỳ. Để trống để ẩn nút liên hệ."
            />
            
            <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{
                  py: 1.2,
                  px: 3,
                  fontWeight: 'bold',
                  borderRadius: 2.5,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  textTransform: 'none',
                }}
              >
                {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <PwaProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<CustomerLayout><Outlet /></CustomerLayout>}>
                <Route index element={<HomePage />} />
                <Route path="tours" element={<ToursPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* TourDetail fullscreen — không bọc CustomerLayout (tránh 100vh + Header gây màn trắng) */}
              <Route path="/tours/:id" element={<TourDetailPage />} />

              <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
                <Route index element={<AdminDashboard />} />
                <Route path="tours" element={<AdminToursPage />} />
                <Route path="tours/:id" element={<AdminTourDetailPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>

              <Route path="/join/:token" element={<JoinTourPage />} />
            </Routes>
          </Suspense>
        </PwaProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
