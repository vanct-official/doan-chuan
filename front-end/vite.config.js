import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Escape ký tự đặc biệt trong RegExp.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_URL || 'http://localhost:5000/api'

  let apiOrigin = 'http://localhost:5000'
  try {
    apiOrigin = new URL(apiBase).origin
  } catch {
    // giữ default
  }

  // Chỉ cache GET các endpoint quan trọng cho leader khi đi tour
  const apiCachePattern = new RegExp(
    `^${escapeRegExp(apiOrigin)}/api/(tours|attendance|groups)(/|$)`,
    'i'
  )

  return {
    resolve: {
      alias: {
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    plugins: [
      react(),
      legacy({
        targets: ['Chrome >= 92', 'iOS >= 12', 'Safari >= 12'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        modernPolyfills: true,
      }),
      VitePWA({
        // 'prompt' → React hiển thị snackbar "Có phiên bản mới" thay vì auto-reload
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'offline.html'],
        manifest: {
          // Tên đầy đủ hiển thị khi cài đặt / splash screen
          name: 'Hệ Thống Quản Lý Tour Du Lịch',
          // Tên ngắn dưới icon trên màn hình chính (tối đa ~12 ký tự)
          short_name: 'Tour Manager',
          // URL mở khi launch từ home screen
          start_url: '/',
          // standalone = ẩn thanh địa chỉ trình duyệt, giống app native
          display: 'standalone',
          // Màu thanh trạng thái / theme (Android, một số trình duyệt)
          theme_color: '#4f46e5',
          // Màu nền splash screen khi app đang load
          background_color: '#f8fafc',
          // Hướng ưu tiên trên mobile
          orientation: 'portrait-primary',
          lang: 'vi',
          scope: '/',
          categories: ['travel', 'productivity'],
          description: 'Quản lý tour du lịch tự tổ chức — dùng offline khi mạng yếu.',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache toàn bộ JS/CSS/HTML sau build
          globPatterns: ['**/*.{js,css,html,json,ico,png,svg,woff2,woff}'],
          // SPA fallback — không reload trắng khi offline
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          // Tăng giới hạn file precache (TourDetailPage bundle lớn)
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          runtimeCaching: [
            // ── Static assets: Cache-first ──
            {
              urlPattern: /\.(?:js|css|woff2?)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets',
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-assets',
                expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            // ── Google Fonts ──
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
            // ── API GET: Stale-while-revalidate ──
            // Trả cache ngay → UI không bị trắng; đồng thời fetch mới ở background
            {
              urlPattern: apiCachePattern,
              handler: 'StaleWhileRevalidate',
              method: 'GET',
              options: {
                cacheName: 'api-data-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [0, 200] },
                // Chỉ cache response JSON hợp lệ
                matchOptions: { ignoreVary: true },
              },
            },
          ],
        },
        devOptions: {
          // Tắt SW trong dev — tránh cache lỗi gây màn trắng khi dev
          enabled: false,
          type: 'module',
        },
      }),
    ],
    build: {
      target: 'es2015',
      rollupOptions: {
        output: {
          // Tách vendor chunks → initial load nhẹ hơn (Vite 8 / Rolldown yêu cầu function)
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/react/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/@mui/')) {
              return 'vendor-mui';
            }
            if (
              id.includes('node_modules/axios') ||
              id.includes('node_modules/dayjs') ||
              id.includes('node_modules/i18next')
            ) {
              return 'vendor-utils';
            }
          },
        },
      },
    },
  }
})
