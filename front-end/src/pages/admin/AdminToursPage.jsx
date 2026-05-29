import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';

export const AdminToursPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTours = async () => {
    setLoading(true);
    try {
      const response = await tourService.getAllTours();
      setTours(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu tour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async (id) => {
    if (window.confirm(t('confirm_delete_tour') || 'Bạn có chắc chắn muốn xóa tour này? Tất cả dữ liệu liên quan (hành khách, xe...) sẽ bị xóa!')) {
      try {
        await tourService.deleteTour(id);
        fetchTours();
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Lỗi khi xóa tour');
      }
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{t('admin_tours_title')}</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          {t('admin_tours_add')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Desktop/Tablet Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="tours table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('col_tour_name')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('col_start_time')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('col_status')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('col_capacity')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('col_action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : tours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    {t('admin_tours_none')}
                  </TableCell>
                </TableRow>
              ) : (
                tours.map((tour) => (
                  <TableRow key={tour._id} hover>
                    <TableCell 
                      component="th" 
                      scope="row" 
                      onClick={() => navigate(`/admin/tours/${tour._id}`)}
                      sx={{ 
                        fontWeight: 600, 
                        color: 'primary.main', 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' } 
                      }}
                    >
                      {tour.name}
                    </TableCell>
                    <TableCell>{new Date(tour.start_time).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <Chip
                        label={tour.status}
                        color={tour.status === 'confirmed' ? 'success' : tour.status === 'draft' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{tour.max_capacity}</TableCell>
                    <TableCell align="center">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => navigate(`/admin/tours/${tour._id}`)}
                        sx={{ mr: 1 }}
                      >
                        {t('btn_edit')}
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDeleteTour(tour._id)}>{t('btn_delete')}</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : tours.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">{t('admin_tours_none')}</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tours.map((tour) => (
              <Paper key={tour._id} elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ fontWeight: 'bold', color: 'primary.main', cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/tours/${tour._id}`)}
                  >
                    {tour.name}
                  </Typography>
                  <Chip
                    label={tour.status}
                    color={tour.status === 'confirmed' ? 'success' : tour.status === 'draft' ? 'warning' : 'default'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  <strong>{t('col_start_time')}:</strong> {new Date(tour.start_time).toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  <strong>{t('col_capacity')}:</strong> {tour.max_capacity} người
                </Typography>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => navigate(`/admin/tours/${tour._id}`)}
                  >
                    {t('btn_edit')}
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteTour(tour._id)}>
                    {t('btn_delete')}
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
