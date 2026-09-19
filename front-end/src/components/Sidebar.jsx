import React, { useState } from 'react';
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, useMediaQuery, ListItemButton, Typography,
  Divider, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, alpha 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBusRounded';
import TourIcon from '@mui/icons-material/TourRounded';
import LogoutIcon from '@mui/icons-material/LogoutRounded';
import PersonIcon from '@mui/icons-material/PersonRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar = ({ mobileOpen, handleDrawerToggle, collapsed = false }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const isSidebarCollapsed = isMobile ? false : collapsed;
  const drawerWidth = isSidebarCollapsed ? 76 : 250;

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
    { text: t('menu_dashboard') || 'Bảng điều khiển', path: '/admin', icon: <DashboardIcon /> },
    { text: t('menu_tours') || 'Quản lý tour', path: '/admin/tours', icon: <TourIcon /> },
    { text: t('menu_users') || 'Người dùng', path: '/admin/users', icon: <PeopleIcon /> },
    { text: t('profile') || 'Trang cá nhân', path: '/admin/profile', icon: <PersonIcon /> },
    { text: t('menu_settings') || 'Cài đặt hệ thống', path: '/admin/settings', icon: <SettingsIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', pt: 'calc(8px + env(safe-area-inset-top))' }}>
      {/* Brand Header */}
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', px: 2.5, py: 2 }}>
        {isSidebarCollapsed ? (
          <Box 
            onClick={() => window.location.href = '/admin'}
            sx={{ 
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
              p: 0.8, 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 40, 
              height: 40, 
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <img
              src="/doanchuan_vanct.png"
              alt="Logo"
              style={{ height: 24, width: 24, objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <Box 
            onClick={() => window.location.href = '/admin'}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                p: 0.8,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              <img
                src="/doanchuan_vanct.png"
                alt="Đoàn Chuẩn Logo"
                style={{ height: 22, objectFit: 'contain' }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                Đoàn Chuẩn
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                ADMIN CONSOLE
              </Typography>
            </Box>
          </Box>
        )}
      </Toolbar>
      
      <Divider sx={{ my: 1, opacity: 0.6 }} />

      {/* Nav List */}
      <Box sx={{ flexGrow: 1, px: 1.5, py: 1 }}>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={active}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 3,
                    py: 1.3,
                    px: isSidebarCollapsed ? 1.5 : 2,
                    justifyContent: isSidebarCollapsed ? 'center' : 'initial',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    bgcolor: active 
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' 
                      : 'transparent',
                    color: active ? '#ffffff !important' : 'text.primary',
                    boxShadow: active ? '0 6px 16px -2px rgba(2, 132, 199, 0.4)' : 'none',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                      },
                    },
                    '&:hover:not(.Mui-selected)': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      transform: isSidebarCollapsed ? 'none' : 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: isSidebarCollapsed ? 0 : 38, 
                      justifyContent: 'center', 
                      color: active ? '#ffffff' : 'text.secondary', 
                      transition: 'color 0.2s',
                      '& svg': { fontSize: 22 }
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isSidebarCollapsed && (
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontSize: '0.925rem', 
                        fontWeight: active ? 700 : 500,
                      }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Bottom Back to Portal & Logout */}
      <Divider sx={{ opacity: 0.6 }} />
      <Box sx={{ p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <List sx={{ p: 0 }}>
          {/* Back to Client Portal */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to="/"
              sx={{
                borderRadius: 3,
                py: 1.2,
                px: isSidebarCollapsed ? 1.5 : 2,
                justifyContent: isSidebarCollapsed ? 'center' : 'initial',
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: isSidebarCollapsed ? 0 : 38, justifyContent: 'center', color: 'inherit' }}>
                <ArrowBackIcon />
              </ListItemIcon>
              {!isSidebarCollapsed && (
                <ListItemText 
                  primary="Về trang chủ" 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} 
                />
              )}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogoutClick}
              sx={{
                borderRadius: 3,
                py: 1.2,
                px: isSidebarCollapsed ? 1.5 : 2,
                justifyContent: isSidebarCollapsed ? 'center' : 'initial',
                color: 'error.main',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
                  transform: isSidebarCollapsed ? 'none' : 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: isSidebarCollapsed ? 0 : 38, justifyContent: 'center', color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              {!isSidebarCollapsed && (
                <ListItemText 
                  primary={t('logout')} 
                  primaryTypographyProps={{ 
                    fontSize: '0.9rem', 
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
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ 
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
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
              background: (theme) => theme.palette.mode === 'light' ? '#ffffff' : '#0b0f19',
              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowX: 'hidden'
            },
            width: drawerWidth,
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {t('logout_confirm_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('logout_confirm_desc_admin')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleCloseLogoutDialog} color="inherit" variant="outlined" sx={{ borderRadius: 2.5 }}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained" sx={{ borderRadius: 2.5 }} autoFocus>
            {t('logout')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
