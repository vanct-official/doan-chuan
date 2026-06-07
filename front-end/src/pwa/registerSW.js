/**
 * Đăng ký Service Worker an toàn — không chặn render React.
 * Ở môi trường DEV, chủ động hủy đăng ký SW để tránh cache cũ gây lỗi trắng trang hoặc 404.
 */
export async function initPwa() {
  if (!('serviceWorker' in navigator)) return;

  if (import.meta.env.DEV) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('[PWA] Đã hủy đăng ký service worker ở chế độ DEV để tránh cache.');
      }
    } catch (e) {
      console.warn('[PWA] Không thể hủy đăng ký service worker:', e);
    }
    return;
  }

  try {
    const { registerSW } = await import('virtual:pwa-register');
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        window.dispatchEvent(new Event('pwa-need-refresh'));
      },
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          setInterval(() => registration.update(), 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.error('[PWA] Đăng ký service worker thất bại:', error);
      },
    });

    window.addEventListener('pwa-apply-update', () => {
      updateSW(true);
    });
  } catch (error) {
    console.warn('[PWA] Không thể khởi tạo service worker:', error);
  }
}

