import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Avatar,
  TextField, Button, Divider, Box, Dialog, DialogTitle,
  DialogContent, DialogActions, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Alert,
  CircularProgress, Paper
} from '@mui/material';
import {
  Person, Email, Phone, Lock, CalendarMonth,
  Wc, Save, Key, Security, Edit, Badge
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';

const ProfilePage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State for user profile
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for editing personal info
  const [infoForm, setInfoForm] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'true' // true for male (string for radio group)
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // State for password management
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // State for mandatory completion modal (Google login first-time)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalForm, setModalForm] = useState({
    name: '',
    phone: '',
    dob: '',
    gender: 'true'
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Fetch profile on mount
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authService.getProfile();
      setProfile(data.user);

      // Update local storage in case user data has updated in db
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role
      }));

      // Prefill edit form
      setInfoForm({
        name: data.user.name || '',
        phone: data.user.phone || '',
        dob: data.user.dob ? new Date(data.user.dob).toISOString().substring(0, 10) : '',
        gender: data.user.gender !== undefined ? String(data.user.gender) : 'true'
      });

      // Prefill modal form too
      setModalForm({
        name: data.user.name || '',
        phone: data.user.phone || '',
        dob: data.user.dob ? new Date(data.user.dob).toISOString().substring(0, 10) : '',
        gender: data.user.gender !== undefined ? String(data.user.gender) : 'true'
      });

      // Show modal if new Google User redirection detected via search query
      if (searchParams.get('complete') === 'true') {
        setModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại!');
      authService.logout();
      setTimeout(() => navigate('/login'), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [navigate]);

  // Handle personal info submit
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoError('');
    setInfoSuccess('');

    try {
      const data = await authService.updateProfile({
        name: infoForm.name,
        phone: infoForm.phone,
        dob: infoForm.dob || undefined,
        gender: infoForm.gender === 'true'
      });

      setProfile(data.user);

      // Sync local storage user
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role
      }));

      setInfoSuccess('Cập nhật thông tin cá nhân thành công!');
      setIsEditingInfo(false);

      // Auto refresh header display (since Header relies on localStorage)
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 100);

    } catch (err) {
      setInfoError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin cá nhân.');
    } finally {
      setInfoLoading(false);
    }
  };

  // Handle password change/setup submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError('');
    setPassSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassError('Xác nhận mật khẩu mới không khớp!');
      setPassLoading(false);
      return;
    }

    try {
      const data = await authService.changePassword({
        oldPassword: profile?.hasPassword ? passwordForm.oldPassword : undefined,
        newPassword: passwordForm.newPassword
      });

      setPassSuccess(data.message || 'Thay đổi mật khẩu thành công!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });

      // Refresh user profile to update hasPassword state
      const updatedProfile = await authService.getProfile();
      setProfile(updatedProfile.user);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu.');
    } finally {
      setPassLoading(false);
    }
  };

  // Handle mandatory modal submit (Google Register)
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    if (!modalForm.name.trim()) {
      setModalError('Họ tên không được để trống!');
      setModalLoading(false);
      return;
    }
    if (!modalForm.phone.trim()) {
      setModalError('Số điện thoại không được để trống!');
      setModalLoading(false);
      return;
    }
    if (!modalForm.dob) {
      setModalError('Ngày sinh không được để trống!');
      setModalLoading(false);
      return;
    }

    try {
      const data = await authService.updateProfile({
        name: modalForm.name,
        phone: modalForm.phone,
        dob: modalForm.dob,
        gender: modalForm.gender === 'true'
      });

      setProfile(data.user);

      localStorage.setItem('user', JSON.stringify({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role
      }));

      // Sync form displays
      setInfoForm({
        name: data.user.name || '',
        phone: data.user.phone || '',
        dob: data.user.dob ? new Date(data.user.dob).toISOString().substring(0, 10) : '',
        gender: data.user.gender !== undefined ? String(data.user.gender) : 'true'
      });

      alert('Hoàn tất hồ sơ thành công! Chào mừng bạn tham gia hệ thống.');

      // Close modal and remove query param
      setModalOpen(false);
      setSearchParams({});

      // Dispatch storage event to update Header profile
      window.dispatchEvent(new Event('storage'));
      navigate('/'); // Go back to Home page
    } catch (err) {
      setModalError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin bắt buộc.');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Main Profile Card (Avatar + Info) */}
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: '#e2e8f0', mb: 4, overflow: 'hidden', bgcolor: '#ffffff' }}>
        <Box sx={{
          background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
          height: 140,
          width: '100%'
        }} />
        <Grid container>
          {/* Left side: Avatar & Summary */}
          <Grid item xs={12} md={4} sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            mt: -7, px: 3, pb: 4,
            borderRight: { md: '1px solid #f1f5f9' },
          }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                bgcolor: '#1976d2',
                fontSize: '3rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
              }}
            >
              {profile?.name ? profile.name.charAt(0).toUpperCase() : <Person />}
            </Avatar>

            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 2,
              py: 0.5,
              bgcolor: profile?.role === 'admin' ? '#fee2e2' : '#eff6ff',
              color: profile?.role === 'admin' ? '#b91c1c' : '#1d4ed8',
              borderRadius: 2,
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              {profile?.role === 'admin' ? t('profile_role_admin') : t('profile_role_customer')}
            </Box>
          </Grid>

          {/* Right side: Personal Info & Form */}
          <Grid item xs={12} md={8}>
            <Box sx={{ p: { xs: 3, sm: 4 }, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Person color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Thông tin cá nhân
                  </Typography>
                </Box>
                {!isEditingInfo ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setIsEditingInfo(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={() => {
                      setIsEditingInfo(false);
                      setInfoError('');
                      setInfoSuccess('');
                    }}
                  >
                    Hủy
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 4 }} />

              {infoError && <Alert severity="error" sx={{ mb: 3 }}>{infoError}</Alert>}
              {infoSuccess && <Alert severity="success" sx={{ mb: 3 }}>{infoSuccess}</Alert>}

              {!isEditingInfo ? (
                /* Read-Only View (Minimalist List) */
                <Box sx={{ px: { xs: 0, sm: 1 } }}>
                  {[
                    { icon: <Badge />, label: t('profile_name'), value: profile?.name },
                    { icon: <Email />, label: t('profile_email'), value: profile?.email },
                    { icon: <Phone />, label: t('profile_phone'), value: profile?.phone || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Chưa cập nhật</span> },
                    { icon: <CalendarMonth />, label: t('profile_dob'), value: profile?.dob ? new Date(profile.dob).toLocaleDateString('vi-VN') : <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Chưa cập nhật</span> },
                    { icon: <Wc />, label: t('profile_gender'), value: profile?.gender === undefined ? <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Chưa cập nhật</span> : (profile.gender ? t('profile_male') : t('profile_female')) }
                  ].map((item, idx, arr) => (
                    <React.Fragment key={idx}>
                      <Box sx={{ display: 'flex', py: 2.5, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: 140, sm: 200 }, flexShrink: 0 }}>
                          {React.cloneElement(item.icon, { sx: { fontSize: 20, mr: 1.5, color: '#94a3b8' } })}
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
                            {item.label}
                          </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" sx={{ color: '#334155', fontWeight: 500 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                      {idx < arr.length - 1 && <Divider sx={{ borderColor: '#f8fafc' }} />}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                /* Editing Form View */
                <form onSubmit={handleInfoSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label={t('profile_name')}
                        value={infoForm.name}
                        onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('profile_phone')}
                        type="tel"
                        value={infoForm.phone}
                        onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('profile_dob')}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={infoForm.dob}
                        onChange={(e) => setInfoForm({ ...infoForm, dob: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl component="fieldset">
                        <FormLabel component="legend">{t('profile_gender')}</FormLabel>
                        <RadioGroup
                          row
                          value={infoForm.gender}
                          onChange={(e) => setInfoForm({ ...infoForm, gender: e.target.value })}
                        >
                          <FormControlLabel value="true" control={<Radio />} label={t('profile_male')} />
                          <FormControlLabel value="false" control={<Radio />} label={t('profile_female')} />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={infoLoading}
                        startIcon={infoLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                      >
                        Lưu thay đổi
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Security / Password Card */}
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: '#e2e8f0', bgcolor: '#ffffff' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Security color="secondary" sx={{ mr: 1.5, fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {profile?.hasPassword ? t('password_change_title') : t('password_set_title')}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {passError && <Alert severity="error" sx={{ mb: 3 }}>{passError}</Alert>}
          {passSuccess && <Alert severity="success" sx={{ mb: 3 }}>{passSuccess}</Alert>}

          {!profile?.hasPassword && (
            <Alert severity="info" sx={{ mb: 4, lineHeight: 1.6, borderRadius: 2 }}>
              {t('password_google_alert')}
            </Alert>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              {profile?.hasPassword && (
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label={t('password_old')}
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label={t('password_new')}
                  type="password"
                  placeholder={t('password_new_hint')}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label={t('password_confirm')}
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={passLoading}
                  startIcon={passLoading ? <CircularProgress size={20} color="inherit" /> : <Key />}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                  {profile?.hasPassword ? t('password_change_title') : t('password_set_title')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Mandatory Profile Completion Dialog Modal (For new Google sign-ups) */}
      <Dialog
        open={modalOpen}
        disableEscapeKeyDown
        onClose={(event, reason) => {
          // Prevent closing by clicking outside or pressing ESC key
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          setModalOpen(false);
        }}
        PaperProps={{
          sx: { borderRadius: 3, p: 2, maxWidth: 550 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.4rem', pb: 1, color: 'primary.main' }}>
          {t('modal_complete_title')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            {t('modal_complete_desc')}
          </Typography>

          {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}

          <form id="modalForm" onSubmit={handleModalSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={t('profile_name')}
                  value={modalForm.name}
                  onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={t('profile_phone')}
                  type="tel"
                  value={modalForm.phone}
                  onChange={(e) => setModalForm({ ...modalForm, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label={t('profile_dob')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={modalForm.dob}
                  onChange={(e) => setModalForm({ ...modalForm, dob: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t('profile_gender')}</FormLabel>
                  <RadioGroup
                    row
                    value={modalForm.gender}
                    onChange={(e) => setModalForm({ ...modalForm, gender: e.target.value })}
                  >
                    <FormControlLabel value="true" control={<Radio />} label={t('profile_male')} />
                    <FormControlLabel value="false" control={<Radio />} label={t('profile_female')} />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            type="submit"
            form="modalForm"
            variant="contained"
            color="primary"
            disabled={modalLoading}
            startIcon={modalLoading ? <CircularProgress size={20} /> : <Save />}
            fullWidth
            sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1rem', borderRadius: 2 }}
          >
            {modalLoading ? 'Đang cập nhật...' : t('modal_complete_btn')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;
