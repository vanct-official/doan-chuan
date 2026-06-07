import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Sidebar } from '../components/Sidebar';
import { useColorMode } from '../theme/ThemeContext';
import { LanguageSwitcher } from '../components/i18n/LanguageSwitcher';
import { useTranslate } from '../hooks/useTranslate';

const drawerWidth = 240;

export const AdminLayout = ({ children }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslate('common');
  const { mode, toggleColorMode } = useColorMode();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            color: 'text.primary',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {t('common.app.adminTitle')}
            </Typography>

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
          <Toolbar />
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
