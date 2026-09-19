import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Stack, Chip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/ExploreRounded';
import GroupsIcon from '@mui/icons-material/GroupsRounded';
import ShareIcon from '@mui/icons-material/ShareRounded';
import EventAvailableIcon from '@mui/icons-material/EventAvailableRounded';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBusRounded';
import WifiOffIcon from '@mui/icons-material/WifiOffRounded';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScannerRounded';
import SecurityIcon from '@mui/icons-material/SecurityRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTranslate } from '../../hooks/useTranslate';

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslate('common');
  const isDarkMode = theme.palette.mode === 'dark';

  const stats = [
    { number: '500+', label: 'Chuyến Tour Thành Công', sub: 'Tổ chức chuyên nghiệp' },
    { number: '15,000+', label: 'Hành Khách Đồng Hành', sub: 'Trải nghiệm trọn vẹn' },
    { number: '99.8%', label: 'Tỷ Lệ Hài Lòng', sub: 'Đánh giá 5 sao' },
    { number: '100%', label: 'Hoạt Động Offline', sub: 'Không lo mất sóng' },
  ];

  const features = [
    {
      icon: <ExploreIcon sx={{ fontSize: 36, color: '#0284c7' }} />,
      badge: 'Lộ Trình Trực Quan',
      title: t('home_feature_1_title') || 'Quản lý lịch trình thông minh',
      desc: t('home_feature_1_desc') || 'Chi tiết từng điểm đến, thời gian rõ ràng, giúp mọi người nắm bắt lộ trình dễ dàng.',
      accent: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)',
      borderColor: 'rgba(2, 132, 199, 0.3)',
      tagColor: '#0284c7',
    },
    {
      icon: <DirectionsBusIcon sx={{ fontSize: 36, color: '#f97316' }} />,
      badge: 'Điều Phối Đoàn Xe',
      title: t('home_feature_2_title') || 'Chuyên gia xếp xe tự động',
      desc: t('home_feature_2_desc') || 'Theo dõi ghế trống, sắp xếp khách lên các xe nhanh chóng, trực quan, không lo quá tải.',
      accent: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
      borderColor: 'rgba(249, 115, 22, 0.3)',
      tagColor: '#f97316',
    },
    {
      icon: <ShareIcon sx={{ fontSize: 36, color: '#10b981' }} />,
      badge: 'Mời Nhanh & Điểm Danh',
      title: t('home_feature_3_title') || 'Mời khách & Điểm danh QR',
      desc: t('home_feature_3_desc') || 'Chỉ cần tạo link mời, thành viên có thể tự điền thông tin và tham gia tour ngay lập tức.',
      accent: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(20, 184, 166, 0.05) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      tagColor: '#10b981',
    },
  ];

  const highlights = [
    {
      icon: <WifiOffIcon sx={{ color: '#0284c7', fontSize: 26 }} />,
      title: 'Công nghệ Offline PWA',
      desc: 'Truy cập danh sách thành viên, xe và lịch trình ngay cả khi đi vào vùng núi hoặc hải đảo mất kết nối.',
    },
    {
      icon: <QrCodeScannerIcon sx={{ color: '#f97316', fontSize: 26 }} />,
      title: 'Điểm danh QR 1-Chạm',
      desc: 'Quét mã thành viên hoặc thao tác nhanh 1 chạm, tự động phân nhóm xe và tổng hợp số lượng khách lên xe tức thì.',
    },
    {
      icon: <GroupsIcon sx={{ color: '#10b981', fontSize: 26 }} />,
      title: 'Tự phục vụ linh hoạt',
      desc: 'Khách hàng có thể tự đăng ký ghế, khai báo thông tin người đi kèm mà không phiền đến trưởng đoàn.',
    },
    {
      icon: <SecurityIcon sx={{ color: '#8b5cf6', fontSize: 26 }} />,
      title: 'Minh bạch & An toàn',
      desc: 'Dữ liệu được đồng bộ hóa tức thời khi có mạng, phân quyền rõ ràng giữa Admin, Trưởng đoàn và Khách tham quan.',
    },
  ];

  return (
    <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: '#ffffff',
          pt: { xs: 8, md: 14 },
          pb: { xs: 12, md: 18 },
          background: isDarkMode
            ? 'linear-gradient(135deg, #090d16 0%, #0c2d48 45%, #143e60 75%, #1e293b 100%)'
            : 'linear-gradient(135deg, #0369a1 0%, #0284c7 45%, #0ea5e9 75%, #38bdf8 100%)',
          textAlign: 'center',
          borderRadius: { xs: 0, md: '0 0 56px 56px' },
          boxShadow: isDarkMode
            ? '0 20px 40px -10px rgba(0, 0, 0, 0.7)'
            : '0 20px 40px -10px rgba(2, 132, 199, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Decorative Blurs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-15%',
            left: '5%',
            width: '35vw',
            height: '35vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            right: '5%',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, px: 3 }}>
          {/* Badge */}
          <Box sx={{ display: 'inline-flex', mb: 3 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.2,
                py: 0.8,
                borderRadius: 9999,
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#fb923c',
                  boxShadow: '0 0 10px #fb923c',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                }}
              >
                Nền Tảng Quản Lý Tour Du Lịch Toàn Diện
              </Typography>
            </Box>
          </Box>

          {/* Heading */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: '2.4rem', sm: '3.6rem', md: '4.5rem' },
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              textShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            Hành Trình Đẳng Cấp,{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(135deg, #fef08a 0%, #fb923c 60%, #f43f5e 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Quản Trị Tối Ưu
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              mb: 5,
              opacity: 0.92,
              fontWeight: 400,
              maxWidth: 780,
              mx: 'auto',
              fontSize: { xs: '1.05rem', md: '1.25rem' },
              lineHeight: 1.65,
            }}
          >
            {t('home_hero_subtitle') ||
              'Nền tảng sắp xếp lịch trình thông minh, điều phối đội xe và đồng hành cùng thành viên đoàn. Hỗ trợ đầy đủ tính năng ngay cả khi ngoại tuyến.'}
          </Typography>

          {/* Action CTAs */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ px: 2, mb: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/tours')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4.5,
                py: 1.8,
                fontSize: '1.05rem',
                borderRadius: 9999,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#ffffff',
                boxShadow: '0 10px 24px -4px rgba(249, 115, 22, 0.45)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 14px 28px -4px rgba(249, 115, 22, 0.6)',
                },
              }}
            >
              {t('home_explore_btn')}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/join')}
              sx={{
                px: 4.5,
                py: 1.8,
                fontSize: '1.05rem',
                borderRadius: 9999,
                fontWeight: 700,
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Tham Gia Bằng Mã Đoàn
            </Button>
          </Stack>

          {/* Quick trust badges */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 4 }}
            justifyContent="center"
            alignItems="center"
            sx={{ opacity: 0.9, fontSize: '0.9rem' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#34d399' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Không lo mất sóng (Offline PWA)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#34d399' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Điều phối xe & Điểm danh QR tức thì
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#34d399' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Trải nghiệm miễn phí & tiện lợi
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Floating Stats Bar */}
      <Container maxWidth="lg" sx={{ mt: { xs: -6, md: -9 }, position: 'relative', zIndex: 3, px: 3 }}>
        <Card
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 5,
            bgcolor: isDarkMode ? 'rgba(17, 24, 39, 0.92)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)',
            boxShadow: isDarkMode
              ? '0 20px 40px -10px rgba(0, 0, 0, 0.5)'
              : '0 20px 40px -10px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            {stats.map((item, idx) => (
              <Grid item xs={6} md={3} key={idx}>
                <Box
                  sx={{
                    textAlign: 'center',
                    borderRight: {
                      xs: idx % 2 === 0 ? '1px solid' : 'none',
                      md: idx < 3 ? '1px solid' : 'none',
                    },
                    borderColor: 'divider',
                    pr: { xs: idx % 2 === 0 ? 2 : 0, md: 2 },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: '1.8rem', md: '2.4rem' },
                      letterSpacing: '-0.02em',
                      background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5,
                    }}
                  >
                    {item.number}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.2 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.sub}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>

      {/* Core Features 3D Cards Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 8, md: 12 }, px: 3 }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Chip
            label="TÍNH NĂNG VƯỢT TRỘI"
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              mb: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          />
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.8rem', md: '2.6rem' },
              color: 'text.primary',
              letterSpacing: '-0.02em',
              mb: 2,
            }}
          >
            Mọi Thứ Bạn Cần Để Tổ Chức Một Chuyến Đi Hoàn Hảo
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mx: 'auto', fontSize: '1rem' }}>
            Đơn giản hóa toàn bộ công tác điều phối, xóa bỏ các bảng tính Excel phức tạp và đảm bảo mọi thành viên luôn nắm rõ lộ trình.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: 5,
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: isDarkMode
                      ? '0 24px 48px -12px rgba(0, 0, 0, 0.6)'
                      : '0 24px 48px -12px rgba(2, 132, 199, 0.15)',
                    borderColor: feature.tagColor,
                  },
                }}
              >
                <Box
                  sx={{
                    height: 6,
                    background: feature.accent,
                    width: '100%',
                  }}
                />
                <CardContent sx={{ p: { xs: 3.5, md: 4.5 } }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 4,
                      background: feature.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      border: `1px solid ${feature.borderColor}`,
                    }}
                  >
                    {feature.icon}
                  </Box>

                  <Chip
                    label={feature.badge}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      mb: 1.5,
                      bgcolor: alpha(feature.tagColor, 0.1),
                      color: feature.tagColor,
                    }}
                  />

                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 1.5,
                      color: 'text.primary',
                      fontSize: '1.3rem',
                    }}
                  >
                    {feature.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Highlights / Why Choose Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 10, md: 14 }, px: 3 }}>
        <Box
          sx={{
            p: { xs: 4, md: 7 },
            borderRadius: 6,
            bgcolor: isDarkMode ? 'rgba(17, 24, 39, 0.6)' : 'rgba(241, 245, 249, 0.7)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.7)',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Chip
                label="ƯU THẾ CÔNG NGHỆ"
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  mb: 2,
                  bgcolor: alpha(theme.palette.secondary.main, 0.12),
                  color: 'secondary.main',
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.3rem' }, mb: 2 }}>
                Đồng Hành Cùng Mọi Đoàn Xe Trên Từng Cây Số
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                Đoàn Chuẩn được thiết kế để giải quyết triệt để các bài toán thực tế mà các hướng dẫn viên và ban tổ chức gặp phải: mất kết nối, thất lạc khách, nhầm xe và phát sinh chi phí.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/tours')}
                sx={{ borderRadius: 9999, px: 3.5, py: 1.2, fontWeight: 700 }}
              >
                Khám Phá Các Tour Mẫu
              </Button>
            </Grid>

            <Grid item xs={12} md={7}>
              <Grid container spacing={2.5}>
                {highlights.map((item, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: 'background.paper',
                        height: '100%',
                        border: '1px solid',
                        borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
                        transition: 'transform 0.2s ease',
                        '&:hover': { transform: 'translateY(-4px)' },
                      }}
                    >
                      <Box sx={{ mb: 1.5 }}>{item.icon}</Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.8 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Call to action Area */}
      <Container maxWidth="md" sx={{ mt: { xs: 10, md: 14 }, px: 3 }}>
        <Box
          sx={{
            p: { xs: 5, md: 8 },
            borderRadius: 7,
            background: isDarkMode
              ? 'linear-gradient(135deg, #0c2d48 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 24px 48px -12px rgba(2, 132, 199, 0.3)',
          }}
        >
          {/* Glow backdrop element */}
          <Box
            sx={{
              position: 'absolute',
              top: '-30%',
              right: '-20%',
              width: '40vw',
              height: '40vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(249, 115, 22, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: '1.9rem', md: '2.5rem' },
              letterSpacing: '-0.02em',
            }}
          >
            {t('home_cta_title') || 'Đã sẵn sàng cho chuyến đi kế tiếp?'}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 5,
              maxWidth: 620,
              mx: 'auto',
              opacity: 0.9,
              lineHeight: 1.7,
              fontSize: '1.05rem',
            }}
          >
            {t('home_cta_subtitle') ||
              'Hãy tham gia cùng chúng tôi để trải nghiệm cách tổ chức tour hoàn toàn mới, loại bỏ sổ sách thủ công.'}
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<EventAvailableIcon />}
            sx={{
              px: 5.5,
              py: 1.8,
              borderRadius: 9999,
              fontWeight: 800,
              fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              boxShadow: '0 10px 24px -4px rgba(249, 115, 22, 0.5)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 14px 28px -4px rgba(249, 115, 22, 0.7)',
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
