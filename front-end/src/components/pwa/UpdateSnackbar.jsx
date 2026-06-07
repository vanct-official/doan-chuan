import React from 'react';
import { Snackbar, Button, Alert } from '@mui/material';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useServiceWorkerUpdate } from '../../hooks/useServiceWorkerUpdate';

/**
 * Thông báo khi có phiên bản mới của service worker.
 */
export function UpdateSnackbar() {
  const { needRefresh, applyUpdate, dismissUpdate } = useServiceWorkerUpdate();

  return (
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
  );
}
