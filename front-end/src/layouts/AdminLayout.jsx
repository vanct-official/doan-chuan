import { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Box, IconButton, Toolbar, Typography, useMediaQuery, useTheme, Chip, alpha } from '@mui/material';
import MenuIcon from '@mui/icons-material/MenuRounded';
import MenuOpenIcon from '@mui/icons-material/MenuOpenRounded';
import Brightness4Icon from '@mui/icons-material/Brightness4Rounded';
import Brightness7Icon from '@mui/icons-material/Brightness7Rounded';
import HomeIcon from '@mui/icons-material/HomeRounded';
import { Sidebar } from '../components/Sidebar';
import { useColorMode } from '../theme/ThemeContext';
import { LanguageSwitcher } from '../components/i18n/LanguageSwitcher';
import { useTranslate } from '../hooks/useTranslate';

export const AdminLayout = ({ children }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('admin_sidebar_collapsed') === 'true');
  const { t } = useTranslate('common');
  const { mode, toggleColorMode } = useColorMode();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const toggleCollapsed = () => {
    const newVal = !collapsed;
    setCollapsed(newVal);
    localStorage.setItem('admin_sidebar_collapsed', String(newVal));
  };

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      localStorage.setItem('last_admin_path', location.pathname + location.search);
    }
  }, [location]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const currentDrawerWidth = collapsed ? 76 : 250;

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Bảng Điều Khiển Tổng Quan';
    if (location.pathname.startsWith('/admin/tours')) return 'Quản Lý Danh Sách Tour';
    if (location.pathname.startsWith('/admin/users')) return 'Quản Lý Người Dùng';
    if (location.pathname.startsWith('/admin/profile')) return 'Hồ Sơ Quản Trị Viên';
    if (location.pathname.startsWith('/admin/settings')) return 'Cài Đặt Hệ Thống';
    return 'Admin Console';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} collapsed={collapsed} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
            ml: { sm: `${currentDrawerWidth}px` },
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(9, 13, 22, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.4)',
            pt: 'env(safe-area-inset-top)',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={isMobile ? handleDrawerToggle : toggleCollapsed}
                sx={{
                  borderRadius: 2.5,
                  p: 1,
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
                }}
                aria-label="menu"
              >
                {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
              </IconButton>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  {getPageTitle()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Hệ thống quản trị Đoàn Chuẩn
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <IconButton
                onClick={() => navigate('/')}
                title="Về trang chủ khách hàng"
                sx={{
                  borderRadius: 2.5,
                  p: 1,
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
                }}
              >
                <HomeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </IconButton>

              <LanguageSwitcher />

              <IconButton
                onClick={toggleColorMode}
                aria-label={t('toggle_dark_mode')}
                sx={{
                  borderRadius: 2.5,
                  p: 1,
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
                }}
              >
                {mode === 'dark' ? (
                  <Brightness7Icon sx={{ color: '#f59e0b', fontSize: 20 }} />
                ) : (
                  <Brightness4Icon sx={{ color: '#0284c7', fontSize: 20 }} />
                )}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
          }}
        >
          <Box sx={{ pt: 'env(safe-area-inset-top)' }}>
            <Toolbar />
          </Box>
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
