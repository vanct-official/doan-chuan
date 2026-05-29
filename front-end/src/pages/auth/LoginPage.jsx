import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, 
  Paper, Link as MuiLink, Alert, Divider, Snackbar
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';

const LoginPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && 
    !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('your-google-client-id');

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError('');
    try {
      const token = response.credential;
      const data = await authService.googleLogin(token);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.isNewUser) {
        setToast({ open: true, message: 'Đăng ký bằng Google thành công! Vui lòng hoàn tất thông tin cá nhân của bạn.', severity: 'success' });
        window.dispatchEvent(new Event('userUpdated'));
        setTimeout(() => navigate('/profile?complete=true'), 1500);
      } else {
        setToast({ open: true, message: 'Đăng nhập thành công!', severity: 'success' });
        window.dispatchEvent(new Event('userUpdated'));
        setTimeout(() => {
          const joinRedirect = localStorage.getItem('joinRedirect');
          if (joinRedirect) {
            localStorage.removeItem('joinRedirect');
            navigate(joinRedirect);
          } else if (data.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập bằng Google. Vui lòng thử lại!');
      setLoading(false);
    }
    // Remove finally because of setTimeout delayed navigation. Otherwise loading spinner stops immediately.
  };

  useEffect(() => {
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!isGoogleConfigured) {
        console.warn("Google Client ID is not configured in .env!");
        return;
      }

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('googleBtn'),
          { 
            theme: 'outline', 
            size: 'large', 
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(interval);
        } else if (attempts >= 10) {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGoogleConfigured]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.login(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToast({ open: true, message: 'Đăng nhập thành công!', severity: 'success' });
      window.dispatchEvent(new Event('userUpdated'));
      
      setTimeout(() => {
        // Ưu tiên redirect về trang join nếu có
        const joinRedirect = localStorage.getItem('joinRedirect');
        if (joinRedirect) {
          localStorage.removeItem('joinRedirect');
          navigate(joinRedirect);
        } else if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!');
      setLoading(false);
    }
    // Remove finally to keep button in loading state during delay
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {t('login_title')}
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label={t('login_phone')}
              name="phone"
              type="tel"
              autoComplete="tel"
              autoFocus
              value={formData.phone}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('login_password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? t('login_processing') : t('login_btn')}
            </Button>

            <Divider sx={{ my: 2, fontSize: '0.85rem', color: 'text.secondary' }}>{t('login_or')}</Divider>

            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1, mb: 2 }}>
              <div id="googleBtn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
              {!isGoogleConfigured && (
                <Alert severity="info" sx={{ mt: 1.5, width: '100%', fontSize: '0.82rem' }}>
                  {t('login_google_config_alert')}
                </Alert>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2">
                {t('login_no_account')}{' '}
                <MuiLink component={Link} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
                  {t('login_register_now')}
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

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
    </Container>
  );
};

export default LoginPage;
