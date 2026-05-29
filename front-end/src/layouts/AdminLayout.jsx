import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Toolbar, IconButton, AppBar, Typography, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TranslateIcon from '@mui/icons-material/Translate';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Sidebar } from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { useColorMode } from '../theme/ThemeContext';

const drawerWidth = 240;

export const AdminLayout = ({ children }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { mode, toggleColorMode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('app_lang', lng);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar 
          position="fixed" 
          sx={{ 
            width: { sm: `calc(100% - ${drawerWidth}px)` }, 
            ml: { sm: `${drawerWidth}px` },
            backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            color: 'text.primary',
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
               <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {t('app_title')} - Admin
            </Typography>

            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <TranslateIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => changeLanguage('vi')}>Tiếng Việt</MenuItem>
              <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
              <MenuItem onClick={() => changeLanguage('ja')}>日本語</MenuItem>
            </Menu>

            <IconButton color="inherit" onClick={toggleColorMode}>
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
            minHeight: '100vh'
          }}
        >
          <Toolbar /> {/* Spacer */}
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
