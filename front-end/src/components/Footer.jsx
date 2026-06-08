import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useColorMode } from '../theme/ThemeContext';
import vanctWhite from '../assets/VanCT_White.png';
import vanctBlack from '../assets/VanCT_Black.png';

export const Footer = () => {
  const { t } = useTranslation();
  const { mode } = useColorMode();

  return (
    <Box component="footer" sx={{ p: 2.5, pb: 'calc(20px + env(safe-area-inset-bottom))', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 1, sm: 2.5 }
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          {t('footer_text')}
        </Typography>

        {/* Subtle dot divider on desktop */}
        <Box sx={{
          display: { xs: 'none', sm: 'block' },
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'text.secondary',
          opacity: 0.5
        }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {t('copyright') && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mr: 0.5 }}>
              {t('copyright')}
            </Typography>
          )}
          <Link 
            href="https://vanct.id.vn" 
            target="_blank" 
            rel="noopener noreferrer" 
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Box
              component="img"
              src={mode === 'dark' ? vanctWhite : vanctBlack}
              alt={mode === 'dark' ? "VanCT White" : "VanCT Black"}
              sx={{
                height: 24,
                width: 'auto',
                opacity: 0.85,
                transition: 'all 0.2s ease-in-out',
                '&:hover': { opacity: 1, transform: 'scale(1.05)' }
              }}
            />
          </Link>
        </Box>
      </Box>
    </Box>
  );
};
