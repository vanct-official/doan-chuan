import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import GroupsIcon from '@mui/icons-material/Groups';
import ShareIcon from '@mui/icons-material/Share';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ pb: 8, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'primary.dark',
          color: 'primary.contrastText',
          py: { xs: 8, md: 14 },
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          textAlign: 'center',
          overflow: 'hidden',
          borderRadius: { xs: 0, md: '0 0 40px 40px' },
          boxShadow: '0 10px 30px rgba(30, 60, 114, 0.2)'
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 800, 
              mb: 3, 
              fontSize: { xs: '2.5rem', md: '4rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            Hành Trình Tuyệt Vời <br /> Bắt Đầu Từ Đây
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 5, 
              opacity: 0.9, 
              fontWeight: 400, 
              px: { xs: 2, md: 8 },
              lineHeight: 1.6
            }}
          >
            Nền tảng quản lý tour du lịch nhóm và cá nhân thông minh. Dễ dàng sắp xếp lịch trình, phương tiện và thành viên chỉ với vài cú click chuột.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              color="warning" 
              size="large" 
              sx={{ 
                px: 4, py: 1.5, 
                fontSize: '1.1rem', 
                borderRadius: 8, 
                fontWeight: 'bold', 
                boxShadow: '0 8px 16px rgba(255, 152, 0, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 20px rgba(255, 152, 0, 0.4)',
                },
                transition: 'all 0.2s'
              }}
              onClick={() => navigate('/tours')}
            >
              Khám Phá Tour Ngay
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large" 
              sx={{ 
                px: 4, py: 1.5, 
                fontSize: '1.1rem', 
                borderRadius: 8, 
                borderWidth: 2, 
                backgroundColor: 'rgba(255,255,255,0.05)',
                '&:hover': { 
                  borderWidth: 2,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s'
              }}
              onClick={() => navigate('/register')}
            >
              Đăng Ký Tài Khoản
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -6 }, position: 'relative', zIndex: 3 }}>
        <Grid container spacing={4}>
          {[
            { 
              icon: <ExploreIcon sx={{ fontSize: 45, color: 'primary.main' }} />, 
              title: 'Quản lý lịch trình', 
              desc: 'Chi tiết từng điểm đến, thời gian rõ ràng, giúp mọi người nắm bắt lộ trình dễ dàng.' 
            },
            { 
              icon: <GroupsIcon sx={{ fontSize: 45, color: 'success.main' }} />, 
              title: 'Chuyên gia xếp xe', 
              desc: 'Theo dõi ghế trống, sắp xếp khách lên các xe nhanh chóng, trực quan, không lo quá tải.' 
            },
            { 
              icon: <ShareIcon sx={{ fontSize: 45, color: 'warning.main' }} />, 
              title: 'Mời khách siêu tốc', 
              desc: 'Chỉ cần tạo link mời, thành viên có thể tự điền thông tin và tham gia tour ngay lập tức.' 
            }
          ].map((feature, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4, 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
                  transition: 'transform 0.3s, box-shadow 0.3s', 
                  '&:hover': { 
                    transform: 'translateY(-10px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                  } 
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 80, height: 80, 
                      borderRadius: '50%', 
                      bgcolor: 'grey.50', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      mx: 'auto', mb: 3 
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>{feature.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{feature.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to action / Footer area */}
      <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
        <Box sx={{ p: 5, borderRadius: 4, bgcolor: '#f8f9fa', border: '1px dashed', borderColor: 'grey.300' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Đã sẵn sàng cho chuyến đi kế tiếp?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Hãy tham gia cộng đồng của chúng tôi để trải nghiệm cách tổ chức tour hoàn toàn mới, loại bỏ sổ sách thủ công.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            startIcon={<EventAvailableIcon />}
            sx={{ px: 5, py: 1.5, borderRadius: 8, fontWeight: 'bold' }}
            onClick={() => navigate('/tours')}
          >
            Đến Trang Quản Lý Tour
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
