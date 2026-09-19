import React, { useEffect, useState, useMemo } from 'react';
import { 
  Typography, Box, Card, CardContent, Grid, Chip, 
  CircularProgress, Alert, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, InputAdornment, 
  Tabs, Tab, Stack, alpha, useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddRounded';
import EventIcon from '@mui/icons-material/CalendarMonthRounded';
import GroupIcon from '@mui/icons-material/GroupsRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoffRounded';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import LuggageIcon from '@mui/icons-material/LuggageRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';

import { useTranslate } from '../../hooks/useTranslate';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { offlineApi } from '../../services/offlineApi';
import { toUTC } from '../../utils/dateUtils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

// Luxury travel curated gradients
const luxuryGradients = [
  'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', // Ocean Azure
  'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', // Deep Teal
  'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', // Sunset Tangerine
  'linear-gradient(135deg, #059669 0%, #047857 100%)', // Mountain Emerald
  'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', // Royal Indigo
  'linear-gradient(135deg, #d97706 0%, #b45309 100%)', // Warm Gold
];

export const ToursPage = () => {
  const { t, currentLanguage } = useTranslate(['common', 'tour']);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineData, setIsOfflineData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const localeCode = currentLanguage === 'vi' ? 'vi-VN' : currentLanguage === 'ja' ? 'ja-JP' : 'en-US';

  // States for Create Tour Modal (for customers)
  const [openModal, setOpenModal] = useState(false);
  const [tourForm, setTourForm] = useState({
    name: '',
    start_time: null,
    end_time: null,
    max_capacity: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Get currently logged-in user
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchTours = async () => {
    try {
      let response;
      if (user) {
        const { data, fromCache } = await offlineApi.getMyTours();
        response = data;
        setIsOfflineData(fromCache);
      } else {
        response = await tourService.getAllTours();
        setIsOfflineData(false);
      }
      setTours(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || t('common.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userStr) {
      navigate('/login');
      return;
    }
    fetchTours();
  }, [navigate, userStr]);

  const handleOpenModal = () => {
    setOpenModal(true);
    setTourForm({ name: '', start_time: null, end_time: null, max_capacity: '' });
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFormChange = (e) => {
    setTourForm({ ...tourForm, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    const userId = user ? user.id : null;

    if (!userId) {
      setSubmitError(t('session_expired'));
      setSubmitting(false);
      return;
    }

    try {
      await tourService.createTour({
        name: tourForm.name,
        start_time: toUTC(tourForm.start_time),
        end_time: toUTC(tourForm.end_time),
        deadline: toUTC(tourForm.start_time),
        max_capacity: Number(tourForm.max_capacity),
        leader_id: userId
      });

      setSubmitSuccess(t('tour_create_success'));
      fetchTours();
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.response?.data?.error || err.message || t('tour_create_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTours = useMemo(() => {
    return tours.filter((tour) => {
      const matchesSearch = tour.name?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'confirmed') return tour.status === 'confirmed';
      if (statusFilter === 'draft') return tour.status === 'draft';
      return true;
    });
  }, [tours, searchQuery, statusFilter]);

  return (
    <Box sx={{ mt: 1, mb: 8 }}>
      {/* Top Header Banner */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          bgcolor: isDarkMode ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
          boxShadow: isDarkMode
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.4)'
            : '0 10px 30px -10px rgba(15, 23, 42, 0.05)',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary' }}>
              {t('menu_tours') || 'Chuyến Đi Của Bạn'}
            </Typography>
            <Chip
              label={`${filteredTours.length} tour`}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('tours_subtitle') || 'Quản lý lịch trình, sắp xếp đoàn xe và đồng hành cùng mọi chuyến đi'}
          </Typography>
        </Box>

        {user && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleOpenModal}
            sx={{
              py: 1.3,
              px: 3.5,
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 24px -4px rgba(2, 132, 199, 0.5)',
              }
            }}
          >
            {t('admin_tours_add') || 'Tạo Tour Mới'}
          </Button>
        )}
      </Box>

      {/* Search & Filter Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        {/* Search Input */}
        <TextField
          placeholder="Tìm kiếm theo tên tour..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { xs: '100%', md: 320 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 9999,
              bgcolor: 'background.paper',
            },
          }}
        />

        {/* Filter Tabs */}
        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          sx={{
            minHeight: 'auto',
            bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.8)',
            p: 0.5,
            borderRadius: 9999,
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          <Tab
            value="all"
            label="Tất cả"
            sx={{
              borderRadius: 9999,
              minHeight: 'auto',
              py: 0.7,
              px: 2,
              fontWeight: 600,
              fontSize: '0.85rem',
              color: statusFilter === 'all' ? '#ffffff !important' : 'text.secondary',
              bgcolor: statusFilter === 'all' ? 'primary.main' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          />
          <Tab
            value="confirmed"
            label="Đã xác nhận"
            sx={{
              borderRadius: 9999,
              minHeight: 'auto',
              py: 0.7,
              px: 2,
              fontWeight: 600,
              fontSize: '0.85rem',
              color: statusFilter === 'confirmed' ? '#ffffff !important' : 'text.secondary',
              bgcolor: statusFilter === 'confirmed' ? 'success.main' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          />
          <Tab
            value="draft"
            label="Bản nháp"
            sx={{
              borderRadius: 9999,
              minHeight: 'auto',
              py: 0.7,
              px: 2,
              fontWeight: 600,
              fontSize: '0.85rem',
              color: statusFilter === 'draft' ? '#ffffff !important' : 'text.secondary',
              bgcolor: statusFilter === 'draft' ? 'warning.main' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          />
        </Tabs>
      </Box>

      {/* Offline Alert */}
      {isOfflineData && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          {t('tours_offline_alert') || 'Đang hiển thị dữ liệu lưu trong bộ nhớ máy (Offline mode)'}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" my={8} flexDirection="column" gap={2}>
          <CircularProgress size={44} thickness={4} />
          <Typography variant="body2" color="text.secondary">Đang tải danh sách tour...</Typography>
        </Box>
      )}

      {/* Error state */}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}
      
      {/* Empty State */}
      {!loading && !error && filteredTours.length === 0 && (
        <Box sx={{ 
          mt: 4, 
          py: 8,
          px: 3,
          textAlign: 'center', 
          backgroundColor: 'background.paper',
          borderRadius: 6,
          border: '2px dashed',
          borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(226, 232, 240, 0.8)',
          maxWidth: 600,
          mx: 'auto',
        }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <LuggageIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" mb={1} color="text.primary">
            {searchQuery ? 'Không tìm thấy tour phù hợp' : t('tours_empty_title') || 'Chưa có chuyến đi nào'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
            {searchQuery 
              ? `Không có kết quả nào khớp với từ khóa "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
              : 'Hãy bắt đầu tạo tour du lịch đầu tiên để sắp xếp lộ trình và mời các thành viên tham gia!'}
          </Typography>
          {user && !searchQuery && (
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<AddIcon />} 
              onClick={handleOpenModal}
              sx={{ borderRadius: 9999, px: 4, py: 1.4, fontWeight: 'bold' }}
            >
              {t('admin_tours_add') || 'Tạo Chuyến Đi Đầu Tiên'}
            </Button>
          )}
        </Box>
      )}

      {/* Tours Grid */}
      <Grid container spacing={3.5}>
        {filteredTours.map((tour, index) => {
          const cardGradient = luxuryGradients[index % luxuryGradients.length];
          const isConfirmed = tour.status === 'confirmed';
          const isDraft = tour.status === 'draft';

          return (
            <Grid item xs={12} sm={6} md={4} key={tour._id}>
              <Card 
                elevation={0}
                onClick={() => navigate(`/tours/${tour._id}`)}
                sx={{ 
                  height: '100%', 
                  borderRadius: 5, 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)', 
                  bgcolor: 'background.paper',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: isDarkMode 
                      ? '0 20px 40px -10px rgba(0,0,0,0.6)' 
                      : '0 20px 40px -10px rgba(2, 132, 199, 0.18)',
                    borderColor: 'primary.main',
                  } 
                }}
              >
                {/* Header Gradient Thumbnail */}
                <Box 
                  sx={{ 
                    height: 120, 
                    background: cardGradient,
                    position: 'relative',
                    p: 2.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    overflow: 'hidden',
                  }}
                >
                  {/* Decorative wave circles */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                    }}
                  />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, zIndex: 1 }}>
                    <Box
                      sx={{
                        p: 0.8,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                      }}
                    >
                      <LuggageIcon fontSize="small" />
                    </Box>
                  </Box>

                  <Chip 
                    label={isConfirmed ? 'Đã xác nhận' : isDraft ? 'Bản nháp' : tour.status || 'Hoạt động'} 
                    size="small" 
                    sx={{ 
                      fontWeight: 800,
                      fontSize: '0.725rem',
                      backdropFilter: 'blur(10px)',
                      bgcolor: isConfirmed 
                        ? 'rgba(16, 185, 129, 0.9)' 
                        : isDraft 
                          ? 'rgba(245, 158, 11, 0.9)' 
                          : 'rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      zIndex: 1,
                    }}
                  />
                </Box>

                {/* Card Content */}
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      sx={{ 
                        fontWeight: 800, 
                        mb: 2, 
                        lineHeight: 1.35, 
                        fontSize: '1.15rem',
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {tour.name}
                    </Typography>

                    {/* Dates */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
                      <EventIcon sx={{ mr: 1.2, fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {new Date(tour.start_time).toLocaleDateString(localeCode)} — {new Date(tour.end_time).toLocaleDateString(localeCode)}
                      </Typography>
                    </Box>

                    {/* Capacity */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
                      <GroupIcon sx={{ mr: 1.2, fontSize: 18, color: 'secondary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {t('tour_capacity_max', { count: tour.max_capacity }) || `Sức chứa: ${tour.max_capacity} hành khách`}
                      </Typography>
                    </Box>
                  </Box>

                  {/* View detail button */}
                  <Button 
                    variant="outlined" 
                    color="primary"
                    size="medium" 
                    fullWidth 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      borderRadius: 9999, 
                      fontWeight: 700,
                      py: 1,
                      fontSize: '0.875rem',
                      borderColor: isDarkMode ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.9)',
                      '&:hover': { 
                        bgcolor: 'primary.main',
                        color: '#ffffff',
                        borderColor: 'primary.main',
                      }
                    }}
                  >
                    {t('view_detail') || 'Xem Chi Tiết Đoàn'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Tour Modal (For customers) */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        PaperProps={{
          sx: { borderRadius: 5, p: { xs: 1.5, sm: 2.5 }, maxWidth: 520, width: '100%' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: 'text.primary', fontSize: '1.35rem' }}>
          {t('admin_tours_add_modal_title') || 'Tạo Chuyến Đi Mới'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nhập thông tin cơ bản cho đoàn. Sau khi tạo, bạn có thể phân chia xe và gửi link mời cho thành viên.
          </Typography>

          {submitError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>{submitError}</Alert>}
          {submitSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }}>{submitSuccess}</Alert>}

          <form id="createTourForm" onSubmit={handleFormSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label={t('tour_name') || 'Tên chuyến đi'}
              placeholder="VD: Khám Phá Đà Nẵng - Hội An 3N2Đ"
              value={tourForm.name}
              onChange={handleFormChange}
              autoFocus
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDateTimePicker
                label={t('tour_start_time') || 'Ngày khởi hành'}
                value={tourForm.start_time}
                onChange={(newValue) => setTourForm({ ...tourForm, start_time: newValue })}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: { margin: 'normal', required: true, fullWidth: true }
                }}
              />
              <MobileDateTimePicker
                label={t('tour_end_time') || 'Ngày kết thúc'}
                value={tourForm.end_time}
                onChange={(newValue) => setTourForm({ ...tourForm, end_time: newValue })}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: { margin: 'normal', required: true, fullWidth: true }
                }}
              />
            </LocalizationProvider>
            <TextField
              margin="normal"
              required
              fullWidth
              name="max_capacity"
              label={t('tour_capacity') || 'Sức chứa tối đa (người)'}
              type="number"
              placeholder="VD: 45"
              value={tourForm.max_capacity}
              onChange={handleFormChange}
              inputProps={{ min: 1 }}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={handleCloseModal} color="inherit" variant="outlined" disabled={submitting} sx={{ borderRadius: 9999 }}>
            {t('cancel')}
          </Button>
          <Button 
            type="submit" 
            form="createTourForm" 
            variant="contained" 
            color="primary" 
            disabled={submitting}
            sx={{ borderRadius: 9999, px: 3.5 }}
          >
            {submitting ? 'Đang tạo...' : t('admin_tours_add_modal_btn') || 'Tạo Chuyến Đi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
