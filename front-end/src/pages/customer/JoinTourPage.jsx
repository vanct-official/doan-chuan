import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Stack, Chip, Divider,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Grid, IconButton, Alert, CircularProgress, LinearProgress,
  Stepper, Step, StepLabel
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import { tourService } from '../../services/tourService';
import { membershipService } from '../../services/membershipService';

const EMPTY_EXTRA = () => ({
  name: '', phone: '', birth_year: '', gender: 'male', customer_type: 'adult'
});

export default function JoinTourPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  // Auth
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isLoggedIn = !!localStorage.getItem('token') && !!currentUser;

  // Data
  const [tour, setTour] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loadingTour, setLoadingTour] = useState(true);
  const [tourError, setTourError] = useState('');

  // Form
  const [step, setStep] = useState(0); // 0 = preview, 1 = form, 2 = success
  const [groupName, setGroupName] = useState('');
  const [useGroup, setUseGroup] = useState(false);
  const [extraMembers, setExtraMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Decode token
  const decodedTourId = React.useMemo(() => {
    try {
      return atob(token);
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!decodedTourId) {
      setTourError('Link không hợp lệ.');
      setLoadingTour(false);
      return;
    }
    tourService.getTourById(decodedTourId)
      .then(res => {
        if (res.success) {
          setTour(res.tour);
          setMemberships(res.memberships || []);
        } else {
          setTourError('Không tìm thấy tour.');
        }
      })
      .catch(() => setTourError('Không thể tải thông tin tour.'))
      .finally(() => setLoadingTour(false));
  }, [decodedTourId]);

  // Nếu đã có trong danh sách hành khách → chuyển thẳng đến trang tour
  useEffect(() => {
    if (!tour || !isLoggedIn || !currentUser) return;
    const currentId = currentUser._id || currentUser.id;
    const alreadyMember = memberships.some((m) => {
      const uid = m.user_id?._id || m.user_id;
      return uid && uid.toString() === currentId.toString();
    });
    if (alreadyMember) {
      navigate(`/tours/${decodedTourId}`, { replace: true });
    }
  }, [tour, memberships, isLoggedIn, currentUser, decodedTourId]);

  const handleAddExtra = () => {
    setExtraMembers(prev => [...prev, EMPTY_EXTRA()]);
  };

  const handleRemoveExtra = (idx) => {
    setExtraMembers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleExtraChange = (idx, field, value) => {
    setExtraMembers(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      // Build members array: first = logged-in user, then extras
      const members = [
        {
          user_id: currentUser._id || currentUser.id,
          role: 'member',
        },
        ...extraMembers.map(m => ({
          user_id: null,
          name: m.name.trim(),
          phone: m.phone.trim(),
          birth_year: m.birth_year ? Number(m.birth_year) : undefined,
          gender: m.gender,
          customer_type: m.customer_type,
          role: 'member',
        }))
      ];

      const payload = {
        tour_id: decodedTourId,
        members,
        group_name: useGroup && groupName.trim() ? groupName.trim() : undefined,
      };

      const res = await membershipService.addMembersBatch(payload);
      if (res.success) {
        setStep(2);
      } else {
        setSubmitError(res.error || 'Có lỗi xảy ra khi đăng ký.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.error || err.message || 'Có lỗi xảy ra khi đăng ký.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading state ─────────────────────────────────────────────
  if (loadingTour) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress sx={{ color: '#fff' }} size={48} />
          <Typography color="#fff" variant="h6">Đang tải thông tin tour...</Typography>
        </Stack>
      </Box>
    );
  }

  // ─── Error state ────────────────────────────────────────────────
  if (tourError || !tour) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
          p: 3,
        }}
      >
        <Paper sx={{ p: 5, borderRadius: 4, maxWidth: 460, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" color="error" mb={2}>Oops!</Typography>
          <Typography color="text.secondary" mb={3}>{tourError || 'Link không hợp lệ hoặc tour không tồn tại.'}</Typography>
          <Button variant="contained" component={Link} to="/tours" startIcon={<ArrowBackIcon />}>
            Về danh sách tour
          </Button>
        </Paper>
      </Box>
    );
  }

  // Check expiry: link valid until tour start_time
  const isExpired = new Date() >= new Date(tour.start_time);

  const activeMembersCount = memberships.length;
  const occupancyPercent = Math.min(100, Math.round((activeMembersCount / tour.max_capacity) * 100));
  const daysLeft = Math.max(0, Math.ceil((new Date(tour.start_time) - new Date()) / (1000 * 60 * 60 * 24)));

  // ─── Expired link ────────────────────────────────────────────────
  if (isExpired) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
          p: 3,
        }}
      >
        <Paper sx={{ p: 5, borderRadius: 4, maxWidth: 480, textAlign: 'center' }}>
          <Typography variant="h2" mb={1}>⏰</Typography>
          <Typography variant="h5" fontWeight="bold" mb={1}>Link đã hết hạn</Typography>
          <Typography color="text.secondary" mb={1}>
            Tour <strong>{tour.name}</strong> đã bắt đầu hoặc link mời đã hết hiệu lực.
          </Typography>
          <Typography color="text.secondary" mb={3} variant="body2">
            Liên hệ với người tổ chức để được cấp link mới.
          </Typography>
          <Button variant="contained" component={Link} to="/tours">
            Khám phá các tour khác
          </Button>
        </Paper>
      </Box>
    );
  }

  // ─── Not logged in ───────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            maxWidth: 520,
            width: '100%',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.97)',
          }}
          elevation={12}
        >
          {/* Tour preview even when not logged in */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              borderRadius: 3,
              p: 3,
              mb: 3,
              color: '#fff',
            }}
          >
            <FlightTakeoffIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
            <Typography variant="h5" fontWeight="bold">{tour.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              {new Date(tour.start_time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              {' → '}
              {new Date(tour.end_time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Typography>
          </Box>

          <LockIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" mb={1}>
            Bạn cần đăng nhập để tham gia
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Vui lòng đăng nhập để xác nhận danh tính và đăng ký tham gia tour <strong>{tour.name}</strong>.
          </Typography>

          <Stack spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold', fontSize: '1rem' }}
              onClick={() => {
                // Save the current join URL so we can redirect back after login
                localStorage.setItem('joinRedirect', window.location.pathname);
                navigate('/login');
              }}
            >
              Đăng nhập để tham gia
            </Button>
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/register"
              sx={{ borderRadius: 3 }}
            >
              Chưa có tài khoản? Đăng ký
            </Button>
            <Button
              variant="text"
              color="inherit"
              component={Link}
              to="/tours"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{ color: 'text.secondary' }}
            >
              Về trang chủ
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // ─── SUCCESS ─────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, maxWidth: 500, width: '100%', textAlign: 'center' }} elevation={12}>
          <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" mb={1}>Đăng ký thành công!</Typography>
          <Typography color="text.secondary" mb={1}>
            Bạn{extraMembers.length > 0 ? ` và ${extraMembers.length} thành viên khác` : ''} đã đăng ký tham gia tour
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary" mb={3}>
            {tour.name}
          </Typography>
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
            Đăng ký của bạn đang ở trạng thái <strong>chờ duyệt</strong>. 
            Người tổ chức sẽ xác nhận trong thời gian sớm nhất.
          </Alert>
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate(`/tours/${decodedTourId}`)}
              sx={{ borderRadius: 3, fontWeight: 'bold' }}
            >
              Xem chi tiết Tour
            </Button>
            <Button variant="outlined" fullWidth component={Link} to="/tours" sx={{ borderRadius: 3 }}>
              Về danh sách Tour
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // ─── MAIN: Tour preview + join form ─────────────────────────────
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        py: { xs: 3, md: 6 },
        px: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>

        {/* ── Header logo / back ── */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            component={Link}
            to="/tours"
            sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
          >
            Trang chủ
          </Button>
          <Chip
            label={`Còn ${daysLeft} ngày`}
            sx={{
              bgcolor: daysLeft <= 3 ? 'error.main' : 'success.main',
              color: '#fff',
              fontWeight: 'bold',
            }}
          />
        </Stack>

        {/* ── Tour Banner Card ── */}
        <Paper
          elevation={20}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            mb: 3,
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: '#fff',
          }}
        >
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2} flexWrap="wrap" useFlexGap>
              <FlightTakeoffIcon sx={{ fontSize: 32 }} />
              <Chip
                label="Lời mời tham gia Tour"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 'bold' }}
              />
            </Stack>

            <Typography variant="h4" fontWeight="900" mb={2} sx={{ lineHeight: 1.2 }}>
              {tour.name}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2.5, p: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', mb: 0.5 }}>
                    <EventIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    Thời gian
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Date(tour.start_time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    đến {new Date(tour.end_time).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2.5, p: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', mb: 0.5 }}>
                    <PeopleIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                    Trưởng đoàn
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {tour.leader_id?.name || 'Chưa phân công'}
                  </Typography>
                  {tour.leader_id?.phone && (
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      {tour.leader_id.phone}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Capacity bar */}
            <Box sx={{ mt: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Sức chứa</Typography>
                <Typography variant="caption" fontWeight="bold">
                  {activeMembersCount} / {tour.max_capacity} người
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={occupancyPercent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': { bgcolor: occupancyPercent >= 90 ? '#ff5252' : '#69f0ae' },
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* ── Join Section ── */}
        {step === 0 && (
          <Paper elevation={10} sx={{ borderRadius: 4, p: { xs: 3, md: 4 } }}>
            {/* Logged-in user preview */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box
                sx={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 'bold', fontSize: '1.3rem',
                  flexShrink: 0,
                }}
              >
                {(currentUser.name || 'U')[0].toUpperCase()}
              </Box>
              <Box>
                <Typography fontWeight="bold">{currentUser.name}</Typography>
                <Typography variant="body2" color="text.secondary">{currentUser.phone}</Typography>
              </Box>
              <Chip label="Đang đăng nhập" size="small" color="success" sx={{ ml: 'auto !important' }} />
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" fontWeight="bold" mb={1}>
              Bạn có muốn tham gia tour này không?
            </Typography>
            <Typography color="text.secondary" mb={3} variant="body2">
              Bạn sẽ được đăng ký với thông tin tài khoản hiện tại. Có thể thêm các thành viên khác trong đoàn của bạn.
            </Typography>

            <Stack spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => setStep(1)}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #162d58 0%, #1f3f7a 100%)' },
                }}
                startIcon={<FlightTakeoffIcon />}
              >
                Tham gia tour này
              </Button>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/tours"
                sx={{ borderRadius: 3 }}
              >
                Có thể sau
              </Button>
            </Stack>
          </Paper>
        )}

        {/* ── Form step ── */}
        {step === 1 && (
          <Paper elevation={10} sx={{ borderRadius: 4, p: { xs: 3, md: 4 } }}>
            <Typography variant="h6" fontWeight="bold" mb={0.5}>
              Xác nhận đăng ký
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Điền thêm thành viên trong đoàn của bạn (nếu có).
            </Typography>

            {/* Main registrant info (read-only) */}
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: 'primary.50', borderColor: 'primary.light' }}
            >
              <Typography variant="caption" color="primary" fontWeight="bold" display="block" mb={1}>
                👤 Người đăng ký (bạn)
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Typography variant="body2" fontWeight="bold">{currentUser.name}</Typography>
                <Typography variant="body2" color="text.secondary">· {currentUser.phone}</Typography>
              </Stack>
            </Paper>

            {/* Group option */}
            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, mb: 3,
                p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3,
                cursor: 'pointer', bgcolor: useGroup ? 'primary.50' : 'transparent',
                borderColor: useGroup ? 'primary.main' : 'divider',
                transition: 'all 0.2s',
              }}
              onClick={() => setUseGroup(v => !v)}
            >
              <input
                type="checkbox"
                checked={useGroup}
                onChange={() => setUseGroup(v => !v)}
                style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
              />
              <GroupsIcon color={useGroup ? 'primary' : 'action'} />
              <Typography variant="body2" fontWeight={useGroup ? 'bold' : 'normal'}>
                Lập nhóm cho đoàn của tôi
              </Typography>
            </Box>

            {useGroup && (
              <TextField
                fullWidth
                size="small"
                label="Tên nhóm"
                placeholder="Ví dụ: Gia đình Nguyễn, Team công ty..."
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                sx={{ mb: 3 }}
              />
            )}

            {/* Extra members */}
            {extraMembers.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" fontWeight="bold" mb={1.5} color="text.secondary">
                  Thành viên trong đoàn
                </Typography>
                {extraMembers.map((m, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ p: 2, mb: 1.5, borderRadius: 3, position: 'relative' }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="caption" fontWeight="bold" color="primary">
                        Thành viên #{idx + 1}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => handleRemoveExtra(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label="Họ và tên"
                          value={m.name}
                          onChange={e => handleExtraChange(idx, 'name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Số điện thoại"
                          value={m.phone}
                          onChange={e => handleExtraChange(idx, 'phone', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Năm sinh"
                          type="number"
                          placeholder="1990"
                          value={m.birth_year}
                          inputProps={{ min: 1900, max: new Date().getFullYear() }}
                          onChange={e => handleExtraChange(idx, 'birth_year', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Giới tính</InputLabel>
                          <Select
                            value={m.gender}
                            label="Giới tính"
                            onChange={e => handleExtraChange(idx, 'gender', e.target.value)}
                          >
                            <MenuItem value="male">Nam</MenuItem>
                            <MenuItem value="female">Nữ</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Loại khách</InputLabel>
                          <Select
                            value={m.customer_type}
                            label="Loại khách"
                            onChange={e => handleExtraChange(idx, 'customer_type', e.target.value)}
                          >
                            <MenuItem value="adult">Người lớn</MenuItem>
                            <MenuItem value="child">Trẻ em</MenuItem>
                            <MenuItem value="elderly">Người già</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}

            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddExtra}
              sx={{ mb: 3, borderRadius: 2.5, textTransform: 'none', fontWeight: 'bold' }}
            >
              Thêm thành viên khác
            </Button>

            {submitError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{submitError}</Alert>
            )}

            <Divider sx={{ mb: 2.5 }} />

            <Stack spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubmit}
                disabled={submitting}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                }}
              >
                {submitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : `✅ Xác nhận đăng ký${extraMembers.length > 0 ? ` (${1 + extraMembers.length} người)` : ''}`}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setStep(0)}
                disabled={submitting}
                sx={{ borderRadius: 3 }}
              >
                Quay lại
              </Button>
            </Stack>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
