import React, { useState } from 'react';
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, useMediaQuery, ListItemButton, Typography,
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TourIcon from '@mui/icons-material/Tour';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export const Sidebar = ({ mobileOpen, handleDrawerToggle, collapsed = false }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const isSidebarCollapsed = isMobile ? false : collapsed;
  const drawerWidth = isSidebarCollapsed ? 72 : 240;

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleCloseLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const menuItems = [
    { text: t('menu_dashboard'), path: '/admin', icon: <DashboardIcon /> },
    { text: t('menu_tours'), path: '/admin/tours', icon: <TourIcon /> },
    { text: t('menu_users'), path: '/admin/users', icon: <PeopleIcon /> },
    { text: t('profile'), path: '/admin/profile', icon: <PersonIcon /> },
    { text: t('menu_settings'), path: '/admin/settings', icon: <SettingsIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 'env(safe-area-inset-top)' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        {isSidebarCollapsed ? (
          <Box 
            onClick={() => window.location.href = '/admin'}
            sx={{ bgcolor: '#4f46e5', p: 0.8, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, cursor: 'pointer' }}
          >
            <img
              src="/doanchuan_vanct.png"
              alt="Logo"
              style={{ height: 24, width: 24, objectFit: 'cover', objectPosition: 'left' }}
            />
          </Box>
        ) : (
          <Box 
            onClick={() => window.location.href = '/admin'}
            sx={{ bgcolor: '#4f46e5', py: 0.8, px: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          >
            <img
              src="/doanchuan_vanct.png"
              alt="Đoàn Chuẩn Logo"
              style={{ height: 24, objectFit: 'contain' }}
            />
          </Box>
        )}
      </Toolbar>
      
      <Box sx={{ flexGrow: 1 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={active}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: '10px',
                    py: 1.2,
                    px: isSidebarCollapsed ? 1.5 : 2,
                    justifyContent: isSidebarCollapsed ? 'center' : 'initial',
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                    '&:hover:not(.Mui-selected)': {
                      backgroundColor: 'action.hover',
                      transform: isSidebarCollapsed ? 'none' : 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: isSidebarCollapsed ? 0 : 40, justifyContent: 'center', color: active ? 'primary.contrastText' : 'text.secondary', transition: 'color 0.2s' }}>
                    {item.icon}
                  </ListItemIcon>
                  {!isSidebarCollapsed && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontSize: '0.95rem', 
                        fontWeight: active ? 600 : 500,
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 1, pb: 'calc(8px + env(safe-area-inset-bottom))' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogoutClick}
              sx={{
                borderRadius: '10px',
                py: 1.2,
                px: isSidebarCollapsed ? 1.5 : 2,
                justifyContent: isSidebarCollapsed ? 'center' : 'initial',
                color: 'error.main',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.15)',
                  transform: isSidebarCollapsed ? 'none' : 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: isSidebarCollapsed ? 0 : 40, justifyContent: 'center', color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              {!isSidebarCollapsed && (
                <ListItemText 
                  primary={t('logout')} 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 600,
                  }} 
                />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
  
  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.2s ease' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ 
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 240,
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: '4px 0 24px rgba(0,0,0,0.05)'
            } 
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{ 
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              background: (theme) => theme.palette.mode === 'light' ? '#ffffff' : '#0f172a',
              transition: 'width 0.2s ease',
              overflowX: 'hidden'
            },
            width: drawerWidth,
            transition: 'width 0.2s ease',
            flexShrink: 0
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Dialog xác nhận đăng xuất */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="sidebar-logout-dialog-title"
        aria-describedby="sidebar-logout-dialog-description"
      >
        <DialogTitle id="sidebar-logout-dialog-title" sx={{ fontWeight: 'bold' }}>
          {t('logout_confirm_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="sidebar-logout-dialog-description">
            {t('logout_confirm_desc_admin')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseLogoutDialog} color="inherit" variant="outlined">
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained" autoFocus>
            {t('logout')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
