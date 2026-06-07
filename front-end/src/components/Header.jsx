import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Box,
  Drawer, List, ListItem, ListItemText, ListItemButton, Divider,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TranslateIcon from '@mui/icons-material/Translate';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTranslation } from 'react-i18next';
import { useColorMode } from '../theme/ThemeContext';
import { InstallPwaButton } from './pwa/InstallPwaButton';

export const Header = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const { mode, toggleColorMode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState(null); // For language menu
  const [userAnchorEl, setUserAnchorEl] = useState(null); // For user menu
  const [mobileOpen, setMobileOpen] = useState(false); // For mobile drawer

  const handleLanguageMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('app_lang', lng);
    setAnchorEl(null);
  };

  const handleUserMenu = (event) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
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

  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  React.useEffect(() => {
    const handleStorageChange = () => {
      const userStr = localStorage.getItem('user');
      setUser(userStr ? JSON.parse(userStr) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  const currentPath = window.location.pathname;
  // Use simple a href mapping for simplicity
  const handleNavigate = (path) => {
    window.location.href = path;
  };

  const drawer = (
    <Box onClick={() => setMobileOpen(false)} sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        {t('app_title')}
      </Typography>
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <InstallPwaButton variant="contained" size="small" />
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/')}>
            <ListItemText primary={t('menu_home')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/tours')}>
            <ListItemText primary={t('menu_tours')} />
          </ListItemButton>
        </ListItem>
        
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/profile')}>
                <ListItemText primary={t('profile')} secondary={`User: ${user.name}`} />
              </ListItemButton>
            </ListItem>
            {user.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigate('/admin')}>
                  <ListItemText primary="Trang quản trị" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemText primary={t('logout')} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/login')}>
                <ListItemText primary="Đăng nhập" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/register')}>
                <ListItemText primary="Đăng ký" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick || (() => setMobileOpen(true))}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => handleNavigate('/')}>
          {t('app_title')}
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <InstallPwaButton variant="outlined" size="small" />
          <Button color="inherit" onClick={() => handleNavigate('/')}>{t('menu_home')}</Button>
          <Button color="inherit" onClick={() => handleNavigate('/tours')}>{t('menu_tours')}</Button>
          {user && user.role === 'admin' && (
            <Button color="inherit" onClick={() => handleNavigate('/admin')}>{t('menu_dashboard')}</Button>
          )}
          
          {user ? (
            <>
              <Button 
                color="inherit" 
                onClick={handleUserMenu}
                sx={{ ml: 1, textTransform: 'none', fontWeight: 'bold' }}
              >
                {t('hello')}, {user.name}
              </Button>
              <Menu
                anchorEl={userAnchorEl}
                open={Boolean(userAnchorEl)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={() => { handleUserMenuClose(); handleNavigate('/profile'); }}>
                  {t('profile')}
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem onClick={() => { handleUserMenuClose(); handleNavigate('/admin'); }}>
                    Trang quản trị
                  </MenuItem>
                )}
                <MenuItem onClick={() => { handleUserMenuClose(); handleLogout(); }} sx={{ color: 'error.main' }}>
                  {t('logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => handleNavigate('/login')}>Đăng nhập</Button>
              <Button variant="outlined" color="inherit" onClick={() => handleNavigate('/register')} sx={{ ml: 1 }}>Đăng ký</Button>
            </>
          )}
        </Box>

        <IconButton color="inherit" onClick={handleLanguageMenu}>
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

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Dialog xác nhận đăng xuất */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title" sx={{ fontWeight: 'bold' }}>
          {t('logout_confirm_title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            {t('logout_confirm_desc')}
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
    </AppBar>
  );
};
