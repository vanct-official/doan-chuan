import React, { useEffect } from 'react';
import { OfflineBanner } from './OfflineBanner';
import { UpdateSnackbar } from './UpdateSnackbar';
import { setupOfflineSync } from '../../utils/offlineSync';

/**
 * Wrapper PWA — mount toàn bộ UI và logic offline/sync.
 * Đặt bên trong Router để banner/snackbar hiển thị trên mọi route.
 */
export function PwaProvider({ children }) {
  useEffect(() => {
    const cleanup = setupOfflineSync();
    return cleanup;
  }, []);

  return (
    <>
      <OfflineBanner />
      {children}
      <UpdateSnackbar />
    </>
  );
}
