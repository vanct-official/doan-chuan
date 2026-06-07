import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../theme/ThemeContext';
import { InstallPwaButton } from './pwa/InstallPwaButton';
import { LanguageSwitcher } from './i18n/LanguageSwitcher';
import { useTranslate } from '../hooks/useTranslate';

export const Header = ({ onMenuClick }) => {
  const { t } = useTranslate(['common', 'auth']);
  const { mode, toggleColorMode } = useColorMode();
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
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

  const handleNavigate = (path) => {
    window.location.href = path;
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const drawer = (
    <Box onClick={() => setMobileOpen(false)} sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        {t('common.app.title')}
      </Typography>
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <InstallPwaButton variant="contained" size="small" />
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/')}>
            <ListItemText primary={t('common.navigation.home')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigate('/tours')}>
            <ListItemText primary={t('common.navigation.tours')} />
          </ListItemButton>
        </ListItem>

        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/profile')}>
                <ListItemText
                  primary={t('profile')}
                  secondary={t('common.messages.hello', { name: user.name })}
                />
              </ListItemButton>
            </ListItem>
            {user.role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleNavigate('/admin')}>
                  <ListItemText primary={t('common.navigation.admin')} />
                </ListItemButton>
              </ListItem>
            )}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={() => setLogoutDialogOpen(true)} sx={{ color: 'error.main' }}>
                <ListItemText primary={t('common.actions.logout')} />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/login')}>
                <ListItemText primary={t('auth.login.title')} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigate('/register')}>
                <ListItemText primary={t('auth.register.title')} />
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

        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => handleNavigate('/')}
        >
          {t('common.app.title')}
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
          <InstallPwaButton variant="outlined" size="small" />
          <Button color="inherit" onClick={() => handleNavigate('/')}>{t('common.navigation.home')}</Button>
          <Button color="inherit" onClick={() => handleNavigate('/tours')}>{t('common.navigation.tours')}</Button>
          {user?.role === 'admin' && (
            <Button color="inherit" onClick={() => handleNavigate('/admin')}>{t('common.navigation.dashboard')}</Button>
          )}

          {user ? (
            <>
              <Button
                color="inherit"
                onClick={(event) => setUserAnchorEl(event.currentTarget)}
                sx={{ ml: 1, textTransform: 'none', fontWeight: 'bold' }}
              >
                {t('common.messages.hello', { name: user.name })}
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
                    {t('common.navigation.admin')}
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => { handleUserMenuClose(); setLogoutDialogOpen(true); }}
                  sx={{ color: 'error.main' }}
                >
                  {t('common.actions.logout')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => handleNavigate('/login')}>{t('auth.login.title')}</Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleNavigate('/register')}
                sx={{ ml: 1 }}
              >
                {t('auth.register.title')}
              </Button>
            </>
          )}
        </Box>

        <LanguageSwitcher />

        <IconButton color="inherit" onClick={toggleColorMode} aria-label={t('toggle_dark_mode')}>
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title" sx={{ fontWeight: 'bold' }}>
          {t('common.logout.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            {t('common.logout.description')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogoutDialogOpen(false)} color="inherit" variant="outlined">
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained" autoFocus>
            {t('common.actions.logout')}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};
