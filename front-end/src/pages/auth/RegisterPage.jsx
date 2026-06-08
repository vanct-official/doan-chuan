import React, { useState } from 'react';
import { 
  Container, Box, Typography, TextField, Button, 
  Paper, Link as MuiLink, Alert, Grid,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useTranslate } from '../../hooks/useTranslate';

const RegisterPage = () => {
  const { t } = useTranslate(['auth', 'common']);
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
      setError(t('auth.register.passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      // Gọi BE theo service
      await authService.register(formData); 
      
      alert(t('auth.register.success'));
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.register.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {t('auth.register.title')}
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  id="name" label={t('auth.register.name')} name="name"
                  value={formData.name} onChange={handleChange}
                  autoFocus
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth
                  id="email" label={t('auth.register.email')} name="email" type="email"
                  value={formData.email} onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth
                  id="phone" label={t('auth.register.phone')} name="phone" type="tel"
                  value={formData.phone} onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontSize: '0.85rem', fontWeight: 500, color: 'text.secondary' }}>{t('auth.register.gender')}</FormLabel>
                  <RadioGroup
                    row
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value === 'true' })}
                  >
                    <FormControlLabel value={true} control={<Radio size="small" />} label={t('auth.register.male')} />
                    <FormControlLabel value={false} control={<Radio size="small" />} label={t('auth.register.female')} />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth
                  id="dateOfBirth" label={t('auth.register.dob')} name="dateOfBirth" type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateOfBirth} onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  name="password" label={t('auth.register.password')} type="password" id="password"
                  value={formData.password} onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required fullWidth
                  name="confirmPassword" label={t('auth.register.confirmPassword')} type="password" id="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Button
              type="submit" fullWidth variant="contained"
              color="primary" disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? t('auth.register.processing') : t('auth.register.button')}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2">
                {t('auth.register.alreadyHaveAccount')}{' '}
                <MuiLink component={Link} to="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                  {t('auth.register.loginHere')}
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
