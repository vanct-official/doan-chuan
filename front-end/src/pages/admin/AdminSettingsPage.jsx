import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardHeader, CardContent, Typography, TextField, Button,
  IconButton, Alert, Snackbar, Stack, Divider, CircularProgress, Paper, Grid,
  Select, MenuItem, FormControl, InputLabel, Avatar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ChatIcon from '@mui/icons-material/Chat';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import MapIcon from '@mui/icons-material/Map';
import ImageIcon from '@mui/icons-material/Image';
import { settingService } from '../../services/settingService';
import { useTranslation } from 'react-i18next';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([{ label: '', value: '', icon: 'support', imageUrl: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Try fetching the plural setting first
        const resPlural = await settingService.getSetting('contact_links');
        if (resPlural && resPlural.success && resPlural.value) {
          try {
            const parsed = JSON.parse(resPlural.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const sanitized = parsed.map(c => ({
                label: c.label || '',
                value: c.value || '',
                icon: c.icon || 'support',
                imageUrl: c.imageUrl || ''
              }));
              setContacts(sanitized);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse contact_links JSON, falling back to singular contact_link', e);
          }
        }

        // Fallback: singular contact_link
        const resSingular = await settingService.getSetting('contact_link');
        if (resSingular && resSingular.success && resSingular.value) {
          setContacts([{ label: t('contact_support', 'Liên hệ hỗ trợ'), value: resSingular.value, icon: 'support', imageUrl: '' }]);
        } else {
          setContacts([{ label: '', value: '', icon: 'support', imageUrl: '' }]);
        }
      } catch (err) {
        console.error('Lỗi khi tải cấu hình:', err);
        setError('Không thể tải cấu hình cài đặt từ máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [t]);

  const handleAddRow = () => {
    setContacts([...contacts, { label: '', value: '', icon: 'support', imageUrl: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (contacts.length === 1) {
      setContacts([{ label: '', value: '', icon: 'support', imageUrl: '' }]);
      return;
    }
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleChangeRow = (index, field, val) => {
    const updated = [...contacts];
    updated[index][field] = val;
    setContacts(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate entries
    const filtered = contacts.filter(c => c.label.trim() || c.value.trim());
    const invalid = filtered.some(c => !c.label.trim() || !c.value.trim());

    if (invalid) {
      setError('Vui lòng nhập đầy đủ cả nhãn (tên hiển thị) và đường dẫn liên kết cho tất cả các dòng đã nhập.');
      setSaving(false);
      return;
    }

    const invalidImage = filtered.some(c => c.icon === 'image' && !c.imageUrl?.trim());
    if (invalidImage) {
      setError('Vui lòng nhập đầy đủ đường dẫn ảnh (URL) nếu chọn loại Hình ảnh tự chọn.');
      setSaving(false);
      return;
    }

    try {
      // 1. Update contact_links (plural, JSON array)
      const pluralVal = JSON.stringify(filtered);
      await settingService.updateSetting('contact_links', pluralVal);

      // 2. Update contact_link (singular fallback) for backward compatibility
      const singularVal = filtered.length > 0 ? filtered[0].value : '';
      await settingService.updateSetting('contact_link', singularVal);

      setToast({
        open: true,
        message: 'Cập nhật cấu hình cài đặt thành công!',
        severity: 'success'
      });
      setContacts(filtered.length > 0 ? filtered : [{ label: '', value: '', icon: 'support', imageUrl: '' }]);
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình cài đặt:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, maxWidth: 1000, mx: 'auto' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
        <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
            Cài đặt hệ thống
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cấu hình các liên kết hỗ trợ và các tùy chỉnh hệ thống khác
          </Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        <CardHeader
          title="Cấu hình danh sách hỗ trợ khách hàng (FAB)"
          subheader="Hiển thị nút liên hệ nhanh cho khách hàng. Hỗ trợ nhiều liên kết như Zalo, Messenger, Hotline..."
          titleTypographyProps={{ fontWeight: 800, fontSize: '1.15rem' }}
          subheaderTypographyProps={{ fontSize: '0.8rem', mt: 0.5 }}
          sx={{
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2.5
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSave}>
            <Box sx={{ mb: 3 }}>
              {contacts.map((contact, index) => {
                const isCustomImage = contact.icon === 'image';
                return (
                  <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label={`Tên liên hệ #${index + 1}`}
                        placeholder="Ví dụ: Zalo Hỗ Trợ, Hotline 24/7"
                        value={contact.label}
                        onChange={(e) => handleChangeRow(index, 'label', e.target.value)}
                        disabled={saving}
                        size="medium"
                      />
                    </Grid>
                    <Grid item xs={12} sm={isCustomImage ? 3 : 5}>
                      <TextField
                        fullWidth
                        label="Đường dẫn liên kết / SĐT"
                        placeholder="https://zalo.me/..., tel:098..., mailto:..."
                        value={contact.value}
                        onChange={(e) => handleChangeRow(index, 'value', e.target.value)}
                        disabled={saving}
                        size="medium"
                      />
                    </Grid>
                    <Grid item xs={12} sm={isCustomImage ? 2.5 : 3}>
                      <FormControl fullWidth size="medium">
                        <InputLabel id={`icon-select-label-${index}`}>Icon hiển thị</InputLabel>
                        <Select
                          labelId={`icon-select-label-${index}`}
                          value={contact.icon || 'support'}
                          label="Icon hiển thị"
                          onChange={(e) => handleChangeRow(index, 'icon', e.target.value)}
                          disabled={saving}
                        >
                          <MenuItem value="support">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SupportAgentIcon fontSize="small" color="primary" />
                              <Typography variant="body2">Hỗ trợ viên</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="chat">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ChatIcon fontSize="small" color="primary" />
                              <Typography variant="body2">Chat / Zalo / Messenger</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="phone">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" color="primary" />
                              <Typography variant="body2">Hotline / SĐT</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="email">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" color="primary" />
                              <Typography variant="body2">Thư / Email</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="link">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LanguageIcon fontSize="small" color="primary" />
                              <Typography variant="body2">Trang web / Link</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="map">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MapIcon fontSize="small" color="primary" />
                              <Typography variant="body2">Bản đồ / Địa chỉ</Typography>
                            </Box>
                          </MenuItem>
                          <MenuItem value="image">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ImageIcon fontSize="small" color="primary" />
                              <Typography variant="body2">Hình ảnh tự chọn (URL)</Typography>
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {isCustomImage && (
                      <Grid item xs={12} sm={2.5}>
                        <TextField
                          fullWidth
                          label="Đường dẫn ảnh (URL)"
                          placeholder="https://example.com/logo.png"
                          value={contact.imageUrl || ''}
                          onChange={(e) => handleChangeRow(index, 'imageUrl', e.target.value)}
                          disabled={saving}
                          size="medium"
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} sm={1} align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveRow(index)}
                        disabled={saving}
                        sx={{
                          bgcolor: 'error.50',
                          '&:hover': { bgcolor: 'error.100' },
                          p: 1.2
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                );
              })}
            </Box>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              disabled={saving}
              sx={{
                mb: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                borderRadius: 2
              }}
            >
              Thêm liên hệ
            </Button>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <InfoIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                  Nút liên hệ sẽ hiển thị dạng bong bóng nổi (FAB) ở góc dưới bên phải trang khách hàng.<br />
                  Nếu cấu hình nhiều liên hệ, bong bóng sẽ tự động chuyển thành menu lựa chọn các liên hệ.
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{
                  py: 1.2,
                  px: 3.5,
                  fontWeight: 'bold',
                  borderRadius: 2.5,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  textTransform: 'none',
                }}
              >
                {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
