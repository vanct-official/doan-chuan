import React from 'react';
import { Box, Typography, Link, Container, Grid, Divider, IconButton, alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useColorMode } from '../theme/ThemeContext';
import vanctWhite from '../assets/VanCT_White.png';
import vanctBlack from '../assets/VanCT_Black.png';

export const Footer = () => {
  const { t } = useTranslation();
  const { mode } = useColorMode();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: mode === 'light' ? '#ffffff' : '#0b0f19',
        borderTop: '1px solid',
        borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top subtle decorative gradient bar */}
      <Box
        sx={{
          height: 3,
          width: '100%',
          background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 35%, #f97316 70%, #f59e0b 100%)',
        }}
      />

      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 3, md: 4 } }}>
        <Grid container spacing={4} justifyContent="space-between">
          {/* Brand & Mission */}
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  p: 0.5,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                }}
              >
                <img
                  src="/doanchuan_vanct.png"
                  alt="Đoàn Chuẩn"
                  style={{ height: 22, objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                Đoàn Chuẩn
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, lineHeight: 1.7, mb: 2 }}>
              Hệ thống quản lý tour du lịch, điều phối phương tiện đoàn xe và đồng hành cùng khách hàng trên mọi hành trình. Hoạt động mượt mà ngay cả khi ngoại tuyến.
            </Typography>
          </Grid>

          {/* Quick links & Platform details */}
          <Grid item xs={6} sm={3} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Khám Phá
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem', transition: 'color 0.2s', '&:hover': { color: 'primary.main' } }}>
                Trang Chủ
              </Link>
              <Link href="/tours" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem', transition: 'color 0.2s', '&:hover': { color: 'primary.main' } }}>
                Danh Sách Tour
              </Link>
              <Link href="/join" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem', transition: 'color 0.2s', '&:hover': { color: 'primary.main' } }}>
                Tham Gia Đoàn Bằng Mã
              </Link>
            </Box>
          </Grid>

          {/* Creator & Partner info */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Phát Triển Bởi
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="https://vanct.id.vn"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: mode === 'light' ? 'rgba(241, 245, 249, 0.8)' : 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid',
                  borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(51, 65, 85, 0.5)',
                  width: 'fit-content',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
                  },
                }}
              >
                <Box
                  component="img"
                  src={mode === 'dark' ? vanctWhite : vanctBlack}
                  alt="VanCT Ecosystem"
                  sx={{ height: 24, width: 'auto' }}
                />
              </Link>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('footer_text')}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: mode === 'light' ? 'rgba(226, 232, 240, 0.7)' : 'rgba(51, 65, 85, 0.4)' }} />

        {/* Bottom copyright line */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pb: 'calc(16px + env(safe-area-inset-bottom))',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Đoàn Chuẩn. All rights reserved. {t('copyright') || ''}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Thiết kế với phong cách <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>Luxury Travel</Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
