import React from 'react';
import { Alert, AlertTitle, Slide, Box } from '@mui/material';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SyncIcon from '@mui/icons-material/Sync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getPendingCount } from '../../utils/offlineSync';

/**
 * Banner cố định phía trên khi offline.
 * Hiển thị số mutation đang chờ sync.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = React.useState(getPendingCount);

  React.useEffect(() => {
    const update = () => setPendingCount(getPendingCount());
    window.addEventListener('pwa-sync-complete', update);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('pwa-sync-complete', update);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <Slide direction="down" in mountOnEnter unmountOnExit>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
        <Alert
          severity={isOnline ? 'info' : 'warning'}
          icon={isOnline ? <SyncIcon /> : <CloudOffIcon />}
          sx={{ borderRadius: 0 }}
        >
          <AlertTitle sx={{ mb: 0 }}>
            {isOnline
              ? `Đang đồng bộ dữ liệu (${pendingCount} thao tác chờ)...`
              : 'Bạn đang offline — dữ liệu đã cache vẫn xem được'}
          </AlertTitle>
        </Alert>
      </Box>
    </Slide>
  );
}
