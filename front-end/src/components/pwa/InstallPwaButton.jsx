import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, IconButton, Tooltip,
} from '@mui/material';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import IosShareIcon from '@mui/icons-material/IosShare';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Nút "Cài đặt ứng dụng" — Android/Chrome dùng beforeinstallprompt,
 * iOS hiển thị hướng dẫn Add to Home Screen thủ công.
 */
export function InstallPwaButton({ variant = 'outlined', size = 'small' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [iosDialogOpen, setIosDialogOpen] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa_install_dismissed') === '1'
  );

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const canInstall = !!deferredPrompt && !isInstalled;
  const showIOSGuide = isIOS && !isInstalled;

  if (isInstalled || dismissed) return null;
  if (!canInstall && !showIOSGuide) return null;

  const handleInstall = async () => {
    if (canInstall) {
      const ok = await promptInstall();
      if (!ok) setDismissed(true);
    } else if (showIOSGuide) {
      setIosDialogOpen(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_dismissed', '1');
    setDismissed(true);
  };

  return (
    <>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        <Button
          variant={variant}
          size={size}
          startIcon={<InstallMobileIcon />}
          onClick={handleInstall}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Cài đặt app
        </Button>
        <Tooltip title="Ẩn gợi ý cài đặt">
          <IconButton size="small" onClick={handleDismiss}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog open={iosDialogOpen} onClose={() => setIosDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cài đặt trên iPhone/iPad</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            iOS không hỗ trợ popup cài đặt tự động. Làm theo các bước sau:
          </Typography>
          <Box component="ol" sx={{ pl: 2, '& li': { mb: 1.5 } }}>
            <li>
              <Typography variant="body2">
                Nhấn nút <IosShareIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />{' '}
                <strong>Chia sẻ</strong> ở thanh dưới Safari
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Chọn <AddBoxOutlinedIcon sx={{ fontSize: 16, verticalAlign: 'middle' }} />{' '}
                <strong>Thêm vào Màn hình chính</strong>
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Nhấn <strong>Thêm</strong> — app sẽ mở ở chế độ toàn màn hình
              </Typography>
            </li>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Lưu ý iOS: storage cache giới hạn ~50MB, background sync hạn chế.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIosDialogOpen(false)}>Đã hiểu</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
