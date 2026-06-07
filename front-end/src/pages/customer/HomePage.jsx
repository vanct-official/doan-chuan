import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Stack } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import GroupsIcon from '@mui/icons-material/Groups';
import ShareIcon from '@mui/icons-material/Share';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useTranslate } from '../../hooks/useTranslate';

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslate('common');
  const isDarkMode = theme.palette.mode === 'dark';

  const features = [
    {
      icon: <ExploreIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: t('home_feature_1_title'),
      desc: t('home_feature_1_desc'),
      bgLight: alpha(theme.palette.primary.main, 0.08),
      bgDark: alpha(theme.palette.primary.main, 0.15),
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      title: t('home_feature_2_title'),
      desc: t('home_feature_2_desc'),
      bgLight: alpha(theme.palette.success.main, 0.08),
      bgDark: alpha(theme.palette.success.main, 0.15),
    },
    {
      icon: <ShareIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: t('home_feature_3_title'),
      desc: t('home_feature_3_desc'),
      bgLight: alpha(theme.palette.secondary.main, 0.08),
      bgDark: alpha(theme.palette.secondary.main, 0.15),
    },
  ];

  return (
    <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: '#ffffff',
          py: { xs: 8, md: 16 },
          background: isDarkMode
            ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311b52 100%)'
            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
          textAlign: 'center',
          borderRadius: { xs: 0, md: '0 0 48px 48px' },
          boxShadow: isDarkMode
            ? '0 10px 30px rgba(0, 0, 0, 0.5)'
            : '0 10px 30px rgba(79, 70, 229, 0.15)',
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {t('home_hero_title').split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx === 0 && <br />}
              </React.Fragment>
            ))}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 6,
              opacity: 0.85,
              fontWeight: 400,
              px: { xs: 2, md: 8 },
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.6,
            }}
          >
            {t('home_hero_subtitle')}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ px: 2 }}
          >
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.05rem',
                borderRadius: '30px',
                fontWeight: 'bold',
                boxShadow: isDarkMode
                  ? '0 8px 20px rgba(244, 63, 94, 0.4)'
                  : '0 8px 20px rgba(244, 63, 94, 0.3)',
                bgcolor: 'secondary.main',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px rgba(244, 63, 94, 0.5)',
                },
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => navigate('/tours')}
            >
              {t('home_explore_btn')}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.05rem',
                borderRadius: '30px',
                borderWidth: 2,
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                '&:hover': {
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => navigate('/register')}
            >
              {t('home_register_btn')}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: -5, md: -8 }, position: 'relative', zIndex: 3, px: 3 }}>
        <Grid container spacing={4}>
          {features.map((feature, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: isDarkMode
                    ? '0 10px 30px rgba(0, 0, 0, 0.2)'
                    : '0 10px 30px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: isDarkMode
                      ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                      : '0 20px 40px rgba(0, 0, 0, 0.08)',
                    borderColor: theme.palette.primary.light,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: '24px',
                      bgcolor: isDarkMode ? feature.bgDark : feature.bgLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 4,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 2,
                      color: 'text.primary',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      fontSize: '0.925rem',
                    }}
                  >
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to action Area */}
      <Container maxWidth="md" sx={{ mt: { xs: 10, md: 14 }, px: 3 }}>
        <Box
          sx={{
            p: { xs: 5, md: 7 },
            borderRadius: 8,
            bgcolor: isDarkMode ? alpha(theme.palette.primary.main, 0.05) : '#f8fafc',
            border: '1px solid',
            borderColor: isDarkMode ? alpha(theme.palette.primary.main, 0.15) : 'grey.200',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isDarkMode ? 'inset 0 0 20px rgba(99, 102, 241, 0.05)' : 'none',
          }}
        >
          {/* Subtle CTA blob decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.03)} 0%, rgba(255,255,255,0) 60%)`,
              pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.03)} 0%, rgba(255,255,255,0) 60%)`,
              pointerEvents: 'none',
            }}
          />

          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', md: '2.25rem' },
            }}
          >
            {t('home_cta_title')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 5,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.7,
            }}
          >
            {t('home_cta_subtitle')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<EventAvailableIcon />}
            sx={{
              px: 6,
              py: 2,
              borderRadius: '30px',
              fontWeight: 'bold',
              fontSize: '1.05rem',
              boxShadow: isDarkMode
                ? '0 6px 15px rgba(79, 70, 229, 0.4)'
                : '0 6px 15px rgba(79, 70, 229, 0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: isDarkMode
                  ? '0 10px 20px rgba(79, 70, 229, 0.5)'
                  : '0 10px 20px rgba(79, 70, 229, 0.3)',
              },
            }}
            onClick={() => navigate('/tours')}
          >
            {t('home_cta_btn')}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
