import React, { useState, useEffect } from 'react';
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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Avatar,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomeIcon from '@mui/icons-material/HomeRounded';
import ExploreIcon from '@mui/icons-material/ExploreRounded';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useColorMode } from '../theme/ThemeContext';
import { InstallPwaButton } from './pwa/InstallPwaButton';
import { LanguageSwitcher } from './i18n/LanguageSwitcher';
import { useTranslate } from '../hooks/useTranslate';
import { BrandLogo } from './BrandLogo';

export const Header = ({ onMenuClick }) => {
  const { t } = useTranslate(['common', 'auth']);
  const { mode, toggleColorMode } = useColorMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  useEffect(() => {
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
    navigate(path);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const isNavActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: t('common.navigation.home'), path: '/', icon: <HomeIcon fontSize="small" /> },
    { label: t('common.navigation.tours'), path: '/tours', icon: <ExploreIcon fontSize="small" /> },
    ...(user?.role === 'admin'
      ? [{ label: t('common.navigation.dashboard'), path: '/admin', icon: <DashboardIcon fontSize="small" /> }]
      : []),
  ];

  const drawer = (
    <Box
      onClick={() => setMobileOpen(false)}
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        pt: 'calc(12px + env(safe-area-inset-top))',
        pb: 3,
        bgcolor: mode === 'light' ? '#ffffff' : '#0f172a',
      }}
    >
      {/* Drawer Brand */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <BrandLogo
          size={40}
          showText={true}
          subtitle="Luxury Travel System"
          onClick={() => {
            setMobileOpen(false);
            handleNavigate('/');
          }}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <InstallPwaButton variant="contained" size="small" fullWidth />
      </Box>

      {/* Navigation List */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = isNavActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={active}
                sx={{
                  borderRadius: 3,
                  py: 1.2,
                  px: 2,
                  fontWeight: active ? 700 : 500,
                  bgcolor: active
                    ? alpha(theme.palette.primary.main, mode === 'light' ? 0.1 : 0.2)
                    : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}

        <Divider sx={{ my: 2 }} />

        {user ? (
          <>
            <ListItem disablePadding sx={{ mb: 0.8 }}>
              <ListItemButton
                onClick={() => handleNavigate('/profile')}
                sx={{ borderRadius: 3, py: 1.2, px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
                  <PersonOutlineIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('profile')}
                  secondary={user.name}
                  primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setLogoutDialogOpen(true)}
                sx={{ borderRadius: 3, py: 1.2, px: 2, color: 'error.main' }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
                  <LogoutRoundedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={t('common.actions.logout')}
                  primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <Box sx={{ px: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleNavigate('/login')}
              sx={{ borderRadius: 2.5 }}
            >
              {t('auth.login.title')}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleNavigate('/register')}
              sx={{ borderRadius: 2.5 }}
            >
              {t('auth.register.title')}
            </Button>
          </Box>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        pt: 'env(safe-area-inset-top)',
        bgcolor: mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.4)',
        color: 'text.primary',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, py: 0.5 }}>
        {/* Left: Mobile Menu & Brand Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick || (() => setMobileOpen(true))}
            sx={{
              display: { sm: 'none' },
              borderRadius: 2.5,
              p: 1,
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.08) },
            }}
          >
            <MenuIcon />
          </IconButton>

          <BrandLogo
            size={38}
            showText={true}
            showBadge={true}
            badgeText="TRAVEL"
            badgeColor="secondary"
            onClick={() => handleNavigate('/')}
          />
        </Box>

        {/* Center: Desktop Navigation Links (Pill Style) */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
            p: 0.6,
            borderRadius: 9999,
            bgcolor: mode === 'light' ? 'rgba(241, 245, 249, 0.7)' : 'rgba(30, 41, 59, 0.5)',
            border: '1px solid',
            borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(51, 65, 85, 0.4)',
          }}
        >
          {navItems.map((item) => {
            const active = isNavActive(item.path);
            return (
              <Button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                startIcon={item.icon}
                sx={{
                  borderRadius: 9999,
                  px: 2.2,
                  py: 0.7,
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#ffffff' : 'text.secondary',
                  background: active
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                    : 'transparent',
                  boxShadow: active ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none',
                  '&:hover': {
                    background: active
                      ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                      : alpha(theme.palette.primary.main, 0.08),
                    color: active ? '#ffffff' : 'primary.main',
                    transform: 'none',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Right: Actions, Install PWA, Lang, DarkMode, User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2 } }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <InstallPwaButton variant="outlined" size="small" />
          </Box>

          <LanguageSwitcher />

          <IconButton
            onClick={toggleColorMode}
            aria-label={t('toggle_dark_mode')}
            sx={{
              p: 1,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.text.primary, 0.08),
                transform: 'rotate(15deg)',
              },
            }}
          >
            {mode === 'dark' ? (
              <Brightness7Icon sx={{ color: '#f59e0b', fontSize: 20 }} />
            ) : (
              <Brightness4Icon sx={{ color: '#0284c7', fontSize: 20 }} />
            )}
          </IconButton>

          {/* User Profile or Login/Register */}
          {user ? (
            <>
              <Button
                onClick={(event) => setUserAnchorEl(event.currentTarget)}
                sx={{
                  borderRadius: 9999,
                  p: 0.5,
                  pr: { xs: 0.5, sm: 1.8 },
                  border: '1px solid',
                  borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.9)' : 'rgba(51, 65, 85, 0.6)',
                  bgcolor: mode === 'light' ? '#ffffff' : '#1e293b',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: 'primary.main',
                    transform: 'none',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #0284c7 0%, #f97316 100%)',
                    color: '#ffffff',
                    mr: { xs: 0, sm: 1 },
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      maxWidth: 110,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2,
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'primary.main', fontWeight: 600 }}>
                    {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                  </Typography>
                </Box>
              </Button>

              <Menu
                anchorEl={userAnchorEl}
                open={Boolean(userAnchorEl)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.2,
                    minWidth: 200,
                    p: 1,
                    borderRadius: 3,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                    border: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.5)',
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleUserMenuClose();
                    handleNavigate('/profile');
                  }}
                  sx={{ borderRadius: 2, py: 1, gap: 1.5 }}
                >
                  <PersonOutlineIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t('profile')}
                  </Typography>
                </MenuItem>

                {user.role === 'admin' && (
                  <MenuItem
                    onClick={() => {
                      handleUserMenuClose();
                      handleNavigate('/admin');
                    }}
                    sx={{ borderRadius: 2, py: 1, gap: 1.5 }}
                  >
                    <DashboardIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t('common.navigation.admin')}
                    </Typography>
                  </MenuItem>
                )}

                <Divider sx={{ my: 0.8 }} />

                <MenuItem
                  onClick={() => {
                    handleUserMenuClose();
                    setLogoutDialogOpen(true);
                  }}
                  sx={{ borderRadius: 2, py: 1, gap: 1.5, color: 'error.main' }}
                >
                  <LogoutRoundedIcon fontSize="small" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t('common.actions.logout')}
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Button
                variant="text"
                color="inherit"
                onClick={() => handleNavigate('/login')}
                sx={{ borderRadius: 2.5, fontWeight: 600 }}
              >
                {t('auth.login.title')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleNavigate('/register')}
                sx={{ borderRadius: 2.5, px: 2.5 }}
              >
                {t('auth.register.title')}
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, border: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{ sx: { p: 1, borderRadius: 4 } }}
      >
        <DialogTitle id="logout-dialog-title" sx={{ fontWeight: 800 }}>
          {t('common.logout.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            {t('common.logout.description')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setLogoutDialogOpen(false)} color="inherit" variant="outlined" sx={{ borderRadius: 2.5 }}>
            {t('common.actions.cancel')}
          </Button>
          <Button onClick={handleConfirmLogout} color="error" variant="contained" sx={{ borderRadius: 2.5 }} autoFocus>
            {t('common.actions.logout')}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};
