import React, { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, 
  Paper, Link as MuiLink, Alert, Grid,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: true,
    dateOfBirth: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Rã ràng password logic trước khi gọi API
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      setLoading(false);
      return;
    }

    try {
      // Gọi BE theo service
      await authService.register(formData); 
      
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Đăng Ký Tài Khoản
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  id="name" label="Họ và Tên" name="name"
                  value={formData.name} onChange={handleChange}
                  autoFocus
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth
                  id="email" label="Email" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth
                  id="phone" label="Số điện thoại" name="phone" type="tel"
                  value={formData.phone} onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontSize: '0.85rem', fontWeight: 500, color: 'text.secondary' }}>Giới tính</FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value === 'true' })}
                  >
                    <FormControlLabel value={true} control={<Radio size="small" />} label="Nam" />
                    <FormControlLabel value={false} control={<Radio size="small" />} label="Nữ" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth
                  id="dateOfBirth" label="Ngày sinh" name="dateOfBirth" type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth} onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  name="password" label="Mật khẩu" type="password" id="password"
                  value={formData.password} onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  name="confirmPassword" label="Nhập lại Mật khẩu" type="password" id="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Button
              type="submit" fullWidth variant="contained"
              color="primary" disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Đang xử lý...' : 'Đăng Ký'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2">
                Đã có tài khoản?{' '}
                <MuiLink component={Link} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                  Đăng nhập tại đây
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
