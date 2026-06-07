import React, { useEffect, useState, useCallback } from 'react';
import { Snackbar, Button, Alert } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { OfflineBanner } from './OfflineBanner';
import { setupOfflineSync } from '../../utils/offlineSync';
import { initPwa } from '../../pwa/registerSW';

/**
 * Wrapper PWA — offline banner, sync, service worker update snackbar.
 * Logic gộp trong 1 file để tránh lỗi duplicate React từ hook riêng.
 */
export function PwaProvider({ children }) {
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    const cleanup = setupOfflineSync();

    const onNeedRefresh = () => setNeedRefresh(true);
    window.addEventListener('pwa-need-refresh', onNeedRefresh);

    // Đăng ký SW sau khi React đã mount — tránh conflict module
    initPwa();

    return () => {
      cleanup();
      window.removeEventListener('pwa-need-refresh', onNeedRefresh);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    window.dispatchEvent(new Event('pwa-apply-update'));
    setNeedRefresh(false);
  }, []);

  const dismissUpdate = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  return (
    <>
      <OfflineBanner />
      {children}
      <Snackbar
        open={needRefresh}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          icon={<SystemUpdateAltIcon />}
          action={
            <>
              <Button color="inherit" size="small" onClick={dismissUpdate}>
                Để sau
              </Button>
              <Button color="inherit" size="small" onClick={applyUpdate} variant="outlined">
                Cập nhật
              </Button>
            </>
          }
          sx={{ width: '100%', alignItems: 'center' }}
        >
          Có phiên bản mới — cập nhật để dùng tính năng mới nhất
        </Alert>
      </Snackbar>
    </>
  );
}
