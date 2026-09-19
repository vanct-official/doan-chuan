import React from 'react';
import { Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { useColorMode } from '../theme/ThemeContext';

/**
 * Unified, responsive BrandLogo component for Đoàn Chuẩn.
 * Supports icon-only, full brand text, badge tags, and subtitles.
 */
export const BrandLogo = ({
  size = 38,
  showText = true,
  hideTextOnMobile = false,
  showBadge = false,
  badgeText = 'TRAVEL',
  badgeColor = 'secondary',
  subtitle,
  onClick,
  sx = {},
}) => {
  const theme = useTheme();
  const { mode } = useColorMode();

  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.25 },
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none',
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'scale(1.02)',
              '& img': {
                boxShadow: '0 6px 18px rgba(2, 132, 199, 0.38)',
              },
            }
          : {},
        ...sx,
      }}
    >
      {/* Brand Icon Mark */}
      <Box
        component="img"
        src="/logo.svg"
        alt="Đoàn Chuẩn Logo"
        sx={{
          width: typeof size === 'object' ? size : { xs: Math.max(size - 4, 28), sm: size },
          height: typeof size === 'object' ? size : { xs: Math.max(size - 4, 28), sm: size },
          borderRadius: { xs: 2.2, sm: 2.8 },
          boxShadow: '0 3px 12px rgba(2, 132, 199, 0.25)',
          display: 'block',
          objectFit: 'contain',
          flexShrink: 0,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        }}
      />

      {/* Brand Text + Badge / Subtitle */}
      {showText && (
        <Box
          sx={{
            display: hideTextOnMobile ? { xs: 'none', sm: 'flex' } : 'flex',
            flexDirection: 'column',
            minWidth: 0,
            lineHeight: 1.1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '0.98rem', sm: '1.15rem' },
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                background:
                  mode === 'light'
                    ? 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ĐOÀN CHUẨN
            </Typography>

            {showBadge && (
              <Chip
                label={badgeText}
                size="small"
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  bgcolor:
                    badgeColor === 'primary'
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.secondary.main, 0.12),
                  color:
                    badgeColor === 'primary' ? 'primary.main' : 'secondary.main',
                  borderRadius: 1,
                  '& .MuiChip-label': { px: 0.6 },
                }}
              />
            )}
          </Box>

          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.68rem',
                lineHeight: 1.2,
                mt: 0.2,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BrandLogo;
