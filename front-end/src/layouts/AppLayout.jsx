import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, IconButton, Typography,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  useTheme, useMediaQuery, Container, BottomNavigation, BottomNavigationAction,
  Paper, Stack, alpha, Tooltip, Avatar, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../theme/ThemeContext';
import { LanguageSwitcher } from '../components/i18n/LanguageSwitcher';
import { useTranslate } from '../hooks/useTranslate';

const drawerWidth = 260;

export default function AppLayout({
  title,
  subtitle,
  onBack,
  headerExtra,
  navigationItems = [], // Array of { label, icon, value }
  activeNavigationValue,
  onNavigationChange,
  children,
  maxWidth = "xl",
  disablePadding = false,
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const { mode, toggleColorMode } = useColorMode();
  const { t } = useTranslate(['common', 'tour']);

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand logo header */}
      <Box 
        onClick={() => window.location.href = '/'}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          p: 3, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          cursor: 'pointer'
        }}
      >
        <Box sx={{ bgcolor: '#4f46e5', p: 0.5, borderRadius: 0, display: 'flex', alignItems: 'center' }}>
          <img src="/doanchuan_vanct.png" alt="Logo" style={{ height: 32, objectFit: 'contain' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
          Đoàn Chuẩn
        </Typography>
      </Box>

      {/* Tabs / Sidebar links list */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {navigationItems.map((item) => {
          const isSelected = activeNavigationValue === item.value;
          return (
            <ListItem key={item.value} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => onNavigationChange(item.value)}
                sx={{
                  borderRadius: 0,
                  py: 1.2,
                  px: 2,
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 1. Sidebar Drawer (Visible only on desktop lg and up) */}
      {isDesktop && navigationItems.length > 0 && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: drawerWidth, 
              boxSizing: 'border-box', 
              borderRight: '1px solid', 
              borderColor: 'divider',
              bgcolor: 'background.paper' 
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* 2. Main Content Wrapper */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        
        {/* Header toolbar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: isDesktop ? 'background.paper' : 'primary.main',
            color: isDesktop ? 'text.primary' : 'white',
            borderBottom: isDesktop ? '1px solid' : 'none',
            borderColor: 'divider',
            pt: !isDesktop ? 'calc(env(safe-area-inset-top) + 4px)' : 0,
          }}
        >
          <Toolbar sx={{ px: { xs: 2, lg: 3 }, py: isDesktop ? 1 : 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1, minWidth: 0 }}>
              {onBack && (
                <IconButton 
                  onClick={onBack} 
                  sx={{ 
                    color: 'inherit', 
                    border: isDesktop ? '1px solid' : 'none', 
                    borderColor: 'divider',
                    p: 1
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography 
                  variant={isDesktop ? "h5" : "subtitle1"} 
                  sx={{ 
                    fontWeight: 800, 
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography 
                    variant={isDesktop ? "body2" : "caption"} 
                    sx={{ 
                      opacity: 0.85, 
                      mt: 0.25, 
                      display: 'flex', 
                      alignItems: 'center',
                      color: isDesktop ? 'text.secondary' : 'inherit'
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: 1, flexShrink: 0 }}>
              {headerExtra}
              <LanguageSwitcher />
              <IconButton 
                color="inherit" 
                onClick={toggleColorMode} 
                aria-label={t('toggle_dark_mode')}
                sx={{ p: 1 }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Content Body */}
        <Box 
          component="main"
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: disablePadding ? 0 : { xs: 1.5, sm: 2, md: 3, lg: 4 }, 
            pb: !isDesktop && navigationItems.length > 0 
              ? 'calc(75px + env(safe-area-inset-bottom))' 
              : { xs: 2, md: 3 } 
          }}
        >
          <Container maxWidth={maxWidth} disableGutters sx={{ height: '100%' }}>
            {children}
          </Container>
        </Box>

        {/* 3. Bottom Navigation (Visible only on mobile/tablet) */}
        {!isDesktop && navigationItems.length > 0 && (
          <Paper 
            sx={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              zIndex: 20, 
              bgcolor: 'background.paper', 
              pb: 'env(safe-area-inset-bottom)',
              borderTop: '1px solid',
              borderColor: 'divider'
            }} 
            elevation={8}
          >
            <BottomNavigation
              showLabels
              value={activeNavigationValue}
              onChange={(event, newValue) => onNavigationChange(newValue)}
              sx={{ height: 60, '& .MuiBottomNavigationAction-label': { fontWeight: 600 } }}
            >
              {navigationItems.map((item) => (
                <BottomNavigationAction
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
