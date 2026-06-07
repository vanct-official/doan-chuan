import { useState, useEffect, useCallback, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Phát hiện service worker mới và cho phép user reload.
 * Dùng virtual:pwa-register/react từ vite-plugin-pwa.
 */
export function useServiceWorkerUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateIntervalRef = useRef(null);

  const {
    needRefresh: [swNeedRefresh, setSwNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      // Kiểm tra update mỗi 1 giờ (leader có thể dùng app cả ngày)
      if (registration) {
        updateIntervalRef.current = setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Đăng ký service worker thất bại:', error);
    },
  });

  useEffect(() => {
    setNeedRefresh(swNeedRefresh);
  }, [swNeedRefresh]);

  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const applyUpdate = useCallback(async () => {
    await updateServiceWorker(true);
    setSwNeedRefresh(false);
    setNeedRefresh(false);
  }, [updateServiceWorker, setSwNeedRefresh]);

  const dismissUpdate = useCallback(() => {
    setSwNeedRefresh(false);
    setNeedRefresh(false);
  }, [setSwNeedRefresh]);

  return { needRefresh, applyUpdate, dismissUpdate };
}
