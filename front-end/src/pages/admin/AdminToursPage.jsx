import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import { useTranslate } from '../../hooks/useTranslate';

export const AdminToursPage = () => {
  const { t, currentLanguage } = useTranslate(['tour', 'common']);
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (date) =>
    new Intl.DateTimeFormat(currentLanguage === 'vi' ? 'vi-VN' : 'en-US').format(new Date(date));

  const fetchTours = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true);
    try {
      const response = await tourService.getAllTours();
      setTours(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || t('tour.messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleDeleteTour = async (id) => {
    if (!window.confirm(t('tour.messages.confirmDelete'))) return;

    try {
      await tourService.deleteTour(id);
      fetchTours();
    } catch (err) {
      setError(err.response?.data?.error || err.message || t('tour.messages.deleteError'));
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchTours({ showLoading: false });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchTours]);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{t('tour.admin.title')}</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ minHeight: 44 }}>
          {t('tour.admin.add')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="tours table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('tour.fields.name')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('tour.fields.startTime')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('tour.fields.status')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">{t('tour.fields.capacity')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('common.table.action')}</TableCell>
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
                    {t('tour.admin.empty')}
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
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {tour.name}
                    </TableCell>
                    <TableCell>{formatDate(tour.start_time)}</TableCell>
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
                        sx={{ mr: 1, minHeight: 36 }}
                      >
                        {t('common.actions.edit')}
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDeleteTour(tour._id)} sx={{ minHeight: 36 }}>
                        {t('common.actions.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : tours.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">{t('tour.admin.empty')}</Typography>
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
                  <strong>{t('tour.fields.startTime')}:</strong> {formatDate(tour.start_time)}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  <strong>{t('tour.fields.capacity')}:</strong> {tour.max_capacity} {t('tour.units.people')}
                </Typography>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/admin/tours/${tour._id}`)}
                    sx={{ minHeight: 36 }}
                  >
                    {t('common.actions.edit')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteTour(tour._id)}
                    sx={{ minHeight: 36 }}
                  >
                    {t('common.actions.delete')}
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
