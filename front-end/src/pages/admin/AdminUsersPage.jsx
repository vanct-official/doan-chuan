import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip, CircularProgress, Alert,
  Switch, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, Snackbar
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';

export const AdminUsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [statusModal, setStatusModal] = useState({ open: false, user: null, password: '', loading: false });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authService.getAllUsers();
      setUsers(response.users || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenStatusModal = (user) => {
    setStatusModal({ open: true, user, password: '', loading: false });
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ open: false, user: null, password: '', loading: false });
  };

  const handleStatusSubmit = async () => {
    if (!statusModal.password) {
      setToast({ open: true, message: t('admin_status_password_required'), severity: 'error' });
      return;
    }
    
    setStatusModal(prev => ({ ...prev, loading: true }));
    try {
      const response = await authService.toggleUserStatus(statusModal.user._id, statusModal.password);
      setToast({ open: true, message: response.message || t('admin_status_success'), severity: 'success' });
      fetchUsers();
      handleCloseStatusModal();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.message || err.message || t('admin_status_error'), severity: 'error' });
      setStatusModal(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{t('admin_users_title')}</Typography>
        <Button variant="contained" color="primary" startIcon={<PersonAddIcon />}>
          {t('admin_users_add')}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Desktop/Tablet Table View */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('col_name')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('col_email')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('col_phone')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('col_gender')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('col_dob')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('col_role')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('col_status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    {t('admin_users_none')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                      {u.name}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone || t('profile_unspecified')}</TableCell>
                    <TableCell align="center">
                      {u.gender !== undefined ? (
                        <Chip
                          label={u.gender ? t('profile_male') : t('profile_female')}
                          color={u.gender ? 'info' : 'secondary'}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">{t('profile_unspecified')}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {u.dob ? new Date(u.dob).toLocaleDateString('vi-VN') : 'N/A'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={u.role === 'admin' ? t('profile_role_admin') : t('profile_role_customer')}
                        color={u.role === 'admin' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {u.role !== 'admin' ? (
                        <Switch 
                          checked={u.isActive !== false} 
                          color="success"
                          onChange={() => handleOpenStatusModal(u)}
                        />
                      ) : (
                        <Chip 
                          label={u.isActive !== false ? t('common.status.active') : t('common.status.inactive')} 
                          color={u.isActive !== false ? 'success' : 'error'} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
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
        ) : users.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">{t('admin_users_none')}</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {users.map((u) => (
              <Paper key={u._id} elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {u.name}
                  </Typography>
                  {u.role !== 'admin' ? (
                    <Switch 
                      checked={u.isActive !== false} 
                      color="success"
                      size="small"
                      onChange={() => handleOpenStatusModal(u)}
                    />
                  ) : (
                    <Chip 
                      label={u.isActive !== false ? t('common.status.active') : t('common.status.inactive')} 
                      color={u.isActive !== false ? 'success' : 'error'} 
                      size="small" 
                      variant="outlined" 
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  <strong>{t('col_email')}:</strong> {u.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  <strong>{t('col_phone')}:</strong> {u.phone || t('profile_unspecified')}
                </Typography>
                <Box display="flex" gap={1}>
                  <Chip
                    label={u.role === 'admin' ? t('profile_role_admin') : t('profile_role_customer')}
                    color={u.role === 'admin' ? 'error' : 'default'}
                    size="small"
                  />
                  {u.gender !== undefined && (
                    <Chip
                      label={u.gender ? t('profile_male') : t('profile_female')}
                      color={u.gender ? 'info' : 'secondary'}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      {/* Modals & Notifications */}
      <Dialog open={statusModal.open} onClose={handleCloseStatusModal}>
        <DialogTitle>{t('admin_status_confirm_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            {t('admin_status_confirm_desc', { 
              action: statusModal.user?.isActive !== false ? t('admin_status_disable') : t('admin_status_activate'), 
              name: statusModal.user?.name 
            })}
          </DialogContentText>
          <TextField
            autoFocus
            label={t('admin_status_password')}
            type="password"
            fullWidth
            variant="outlined"
            value={statusModal.password}
            onChange={(e) => setStatusModal(prev => ({ ...prev, password: e.target.value }))}
            disabled={statusModal.loading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseStatusModal} disabled={statusModal.loading} color="inherit">{t('cancel')}</Button>
          <Button onClick={handleStatusSubmit} variant="contained" color="primary" disabled={statusModal.loading}>
            {statusModal.loading ? <CircularProgress size={24} /> : t('common.actions.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
