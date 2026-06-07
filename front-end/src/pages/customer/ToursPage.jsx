import React, { useEffect, useState } from 'react';
import { 
  Typography, Box, Card, CardContent, Grid, Chip, 
  CircularProgress, Alert, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
];
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { offlineApi } from '../../services/offlineApi';
import { toUTC } from '../../utils/dateUtils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

export const ToursPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineData, setIsOfflineData] = useState(false);

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

  // Get currently logged-in user to show/hide the create tour button
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
      setError(err.message || 'Lỗi khi tải dữ liệu tour');
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
      setSubmitError('Phiên đăng nhập đã hết hạn! Vui lòng đăng nhập lại.');
      setSubmitting(false);
      return;
    }

    try {
      await tourService.createTour({
        name: tourForm.name,
        start_time: toUTC(tourForm.start_time),
        end_time: toUTC(tourForm.end_time),
        deadline: toUTC(tourForm.start_time), // deadline is equal to start_time
        max_capacity: Number(tourForm.max_capacity),
        leader_id: userId
      });

      setSubmitSuccess(t('tour_create_success'));
      fetchTours(); // Reload tours list
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.response?.data?.error || err.message || 'Lỗi khi tạo tour');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
            {t('menu_tours') || 'Chuyến Đi Của Bạn'}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
            Quản lý và theo dõi các tour du lịch bạn tham gia
          </Typography>
        </Box>
        {user && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleOpenModal}
            sx={{ py: 1.2, px: 3, borderRadius: 8, fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)', display: { xs: 'none', sm: 'flex' } }}
          >
            {t('admin_tours_add') || 'Tạo Tour Mới'}
          </Button>
        )}
      </Box>

      {isOfflineData && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Danh sách tour từ cache — kết nối mạng để cập nhật mới nhất
        </Alert>
      )}

      {user && (
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleOpenModal}
          fullWidth
          sx={{ py: 1.5, mb: 4, borderRadius: 3, fontWeight: 'bold', display: { xs: 'flex', sm: 'none' } }}
        >
          {t('admin_tours_add') || 'Tạo Tour Mới'}
        </Button>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {!loading && !error && tours.length === 0 && (
        <Box sx={{ 
          mt: 4, 
          py: 8,
          px: 2,
          textAlign: 'center', 
          backgroundColor: 'background.paper',
          borderRadius: 4,
          border: '1px dashed',
          borderColor: 'divider',
        }}>
          <Typography variant="h1" mb={2}>🏖️</Typography>
          {user ? (
            <>
              <Typography variant="h5" fontWeight="bold" mb={2} color="text.primary">
                Chuyến đi của bạn đang trống!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
                Số điện thoại <strong>{user.phone || '(chưa cập nhật)'}</strong> chưa được thêm vào bất kỳ tour nào. Hãy liên hệ với người tổ chức để được thêm vào, hoặc tự tạo một chuyến đi mới.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<AddIcon />} 
                onClick={handleOpenModal}
                sx={{ borderRadius: 8, px: 4, py: 1.5, fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}
              >
                Tạo Tour Mới Ngay
              </Button>
            </>
          ) : (
            <Typography variant="body1" color="text.secondary">
              {t('admin_tours_none')}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {tours.map((tour, index) => (
          <Grid item xs={12} sm={6} md={4} key={tour._id}>
            <Card 
              elevation={0}
              onClick={() => navigate(`/tours/${tour._id}`)}
              sx={{ 
                height: '100%', 
                borderRadius: 4, 
                cursor: 'pointer',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                '&:hover': { 
                  transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15)',
                  borderColor: 'primary.main'
                } 
              }}
            >
              <Box 
                sx={{ 
                  height: 100, 
                  background: gradients[index % gradients.length],
                  position: 'relative'
                }}
              >
                <Chip 
                  label={tour.status === 'confirmed' ? 'Đã chốt' : tour.status === 'draft' ? 'Bản nháp' : tour.status} 
                  color={tour.status === 'confirmed' ? 'success' : tour.status === 'draft' ? 'warning' : 'default'} 
                  size="small" 
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                />
              </Box>

              <CardContent sx={{ p: 3, pt: 2, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 2.5, lineHeight: 1.3 }}>
                    {tour.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
                    <EventIcon fontSize="small" sx={{ mr: 1.5, opacity: 0.7 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(tour.start_time).toLocaleDateString('vi-VN')}
                    </Typography>
                    <ArrowRightAltIcon fontSize="small" sx={{ mx: 1, opacity: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(tour.end_time).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
                    <GroupIcon fontSize="small" sx={{ mr: 1.5, opacity: 0.7 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Tối đa {tour.max_capacity} hành khách
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary"
                  size="medium" 
                  fullWidth 
                  endIcon={<FlightTakeoffIcon />}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none', 
                    fontWeight: 'bold',
                    boxShadow: 'none',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                  }}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Tour Modal (For customers) */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal}
        PaperProps={{
          sx: { borderRadius: 3, p: 2, maxWidth: 500, width: '100%' }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1, color: 'primary.main' }}>
          {t('admin_tours_add_modal_title')}
        </DialogTitle>
        <DialogContent>
          {submitError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{submitError}</Alert>}
          {submitSuccess && <Alert severity="success" sx={{ mb: 2, mt: 1 }}>{submitSuccess}</Alert>}

          <form id="createTourForm" onSubmit={handleFormSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label={t('tour_name')}
              value={tourForm.name}
              onChange={handleFormChange}
              autoFocus
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <MobileDateTimePicker
                label={t('tour_start_time')}
                value={tourForm.start_time}
                onChange={(newValue) => setTourForm({ ...tourForm, start_time: newValue })}
                format="DD/MM/YYYY HH:mm"
                slotProps={{
                  textField: { margin: 'normal', required: true, fullWidth: true }
                }}
              />
              <MobileDateTimePicker
                label={t('tour_end_time')}
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
              label={t('tour_capacity')}
              type="number"
              value={tourForm.max_capacity}
              onChange={handleFormChange}
              inputProps={{ min: 1 }}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseModal} color="inherit" variant="outlined" disabled={submitting}>
            {t('cancel')}
          </Button>
          <Button 
            type="submit" 
            form="createTourForm" 
            variant="contained" 
            color="primary" 
            disabled={submitting}
          >
            {submitting ? '...' : t('admin_tours_add_modal_btn')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
