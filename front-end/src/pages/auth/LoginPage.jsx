import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link as MuiLink,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useTranslate } from '../../hooks/useTranslate';

const LoginPage = () => {
  const { t } = useTranslate(['auth', 'common']);
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const isGoogleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID) &&
    !import.meta.env.VITE_GOOGLE_CLIENT_ID.includes('your-google-client-id');

  const redirectAfterLogin = useCallback((user) => {
    const joinRedirect = localStorage.getItem('joinRedirect');
    if (joinRedirect) {
      localStorage.removeItem('joinRedirect');
      navigate(joinRedirect);
      return;
    }

    navigate(user?.role === 'admin' ? '/admin' : '/');
  }, [navigate]);

  const handleGoogleCallback = useCallback(async (response) => {
    setLoading(true);
    setError('');

    try {
      const data = await authService.googleLogin(response.credential);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('userUpdated'));

      if (data.isNewUser) {
        setToast({ open: true, message: t('auth.login.googleSuccessNewUser'), severity: 'success' });
        setTimeout(() => navigate('/profile?complete=true'), 1500);
        return;
      }

      setToast({ open: true, message: t('auth.login.success'), severity: 'success' });
      setTimeout(() => redirectAfterLogin(data.user), 1500);
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.googleError'));
      setLoading(false);
    }
  }, [navigate, redirectAfterLogin, t]);

  useEffect(() => {
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!isGoogleConfigured) {
        console.warn('Google Client ID is not configured in .env!');
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
      return undefined;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      if (window.google?.accounts?.id) {
        initGoogle();
        clearInterval(interval);
      } else if (attempts >= 10) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [handleGoogleCallback, isGoogleConfigured]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setToast({ open: true, message: t('auth.login.success'), severity: 'success' });
      window.dispatchEvent(new Event('userUpdated'));
      setTimeout(() => redirectAfterLogin(data.user), 1500);
    } catch (err) {
      setError(err.response?.data?.message || t('auth.login.error'));
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {t('auth.login.title')}
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="phone"
              label={t('auth.login.phone')}
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
              label={t('auth.login.password')}
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
              sx={{ mt: 3, mb: 2, py: 1.5, minHeight: 48 }}
            >
              {loading ? t('auth.login.processing') : t('auth.login.button')}
            </Button>

            <Divider sx={{ my: 2, fontSize: '0.85rem', color: 'text.secondary' }}>
              {t('auth.login.or')}
            </Divider>

            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1, mb: 2 }}>
              <div id="googleBtn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />
              {!isGoogleConfigured && (
                <Alert severity="info" sx={{ mt: 1.5, width: '100%', fontSize: '0.82rem' }}>
                  {t('auth.login.googleConfigAlert')}
                </Alert>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2">
                {t('auth.login.noAccount')}{' '}
                <MuiLink component={Link} to="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
                  {t('auth.login.registerNow')}
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
