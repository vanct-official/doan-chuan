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
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const location = useLocation();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

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
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.5px', color: 'primary.main' }}>
          ADMIN PORTAL
        </Typography>
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
                    px: 2,
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
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.contrastText' : 'text.secondary', transition: 'color 0.2s' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.95rem', 
                      fontWeight: active ? 600 : 500,
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 1 }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogoutClick}
              sx={{
                borderRadius: '10px',
                py: 1.2,
                px: 2,
                color: 'error.main',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'light' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(244, 63, 94, 0.15)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('logout')} 
                primaryTypographyProps={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 600,
                }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
  
  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ 
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
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
              background: (theme) => theme.palette.mode === 'light' ? '#ffffff' : '#0f172a'
            } 
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
