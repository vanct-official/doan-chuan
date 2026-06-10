import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppBar, Box, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
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

  const currentDrawerWidth = collapsed ? 72 : 240;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} collapsed={collapsed} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
            ml: { sm: `${currentDrawerWidth}px` },
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            color: 'text.primary',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider',
            pt: 'env(safe-area-inset-top)',
            transition: (theme) => theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={isMobile ? handleDrawerToggle : toggleCollapsed}
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box 
                onClick={() => window.location.href = '/admin'}
                sx={{ bgcolor: '#4f46e5', p: 0.5, borderRadius: 1.5, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <img
                  src="/doanchuan_vanct.png"
                  alt="Đoàn Chuẩn Logo"
                  style={{ height: 28, objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Admin Portal
              </Typography>
            </Box>

            <LanguageSwitcher />

            <IconButton color="inherit" onClick={toggleColorMode} aria-label={t('toggle_dark_mode')}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
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
