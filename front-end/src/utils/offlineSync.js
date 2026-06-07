/**
 * Hàng đợi mutation offline — đồng bộ khi online lại.
 *
 * Use-case chính:
 *  - Attendance: leader điểm danh khi mạng yếu → queue POST /attendance/batch
 *  - Itinerary: sửa lịch trình offline → queue PUT/POST/DELETE
 *
 * Chiến lược sync:
 *  1. Mutation offline → lưu vào queue (localStorage)
 *  2. Khi online → flushQueue() gọi API tuần tự
 *  3. Thành công → xóa khỏi queue; thất bại → giữ lại, retry lần sau
 */

import api from '../services/api';

const QUEUE_KEY = 'pwa_offline_mutation_queue';

const MUTATION_HANDLERS = {
  /** POST /attendance/batch */
  ATTENDANCE_BATCH: {
    execute: (payload) => api.post('/attendance/batch', payload),
  },
  /** POST /itineraries */
  ITINERARY_CREATE: {
    execute: (payload) => api.post('/itineraries', payload),
  },
  /** PUT /itineraries/:id */
  ITINERARY_UPDATE: {
    execute: ({ id, data }) => api.put(`/itineraries/${id}`, data),
  },
  /** DELETE /itineraries/:id */
  ITINERARY_DELETE: {
    execute: ({ id }) => api.delete(`/itineraries/${id}`),
  },
};

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Thêm mutation vào hàng đợi.
 * @param {'ATTENDANCE_BATCH'|'ITINERARY_CREATE'|'ITINERARY_UPDATE'|'ITINERARY_DELETE'} type
 * @param {object} payload
 */
export function queueMutation(type, payload) {
  const queue = readQueue();
  queue.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    payload,
    createdAt: Date.now(),
    retries: 0,
  });
  writeQueue(queue);
  return queue.length;
}

export function getPendingCount() {
  return readQueue().length;
}

export function getPendingQueue() {
  return readQueue();
}

/**
 * Đồng bộ toàn bộ queue lên server.
 * @returns {{ synced: number, failed: number, remaining: number }}
 */
export async function flushQueue() {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0, remaining: getPendingCount() };
  }

  const queue = readQueue();
  if (queue.length === 0) {
    return { synced: 0, failed: 0, remaining: 0 };
  }

  const remaining = [];
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    const handler = MUTATION_HANDLERS[item.type];
    if (!handler) {
      remaining.push(item);
      failed++;
      continue;
    }

    try {
      await handler.execute(item.payload);
      synced++;
    } catch (err) {
      item.retries = (item.retries || 0) + 1;
      // Giữ lại tối đa 5 lần retry
      if (item.retries < 5) {
        remaining.push(item);
      }
      failed++;
      console.warn('[PWA Sync] Thất bại:', item.type, err);
    }
  }

  writeQueue(remaining);
  return { synced, failed, remaining: remaining.length };
}

/** Đăng ký auto-sync khi online */
export function setupOfflineSync() {
  const sync = async () => {
    const count = getPendingCount();
    if (count === 0) return;

    const result = await flushQueue();
    if (result.synced > 0) {
      window.dispatchEvent(
        new CustomEvent('pwa-sync-complete', { detail: result })
      );
    }
  };

  window.addEventListener('online', sync);

  // Sync ngay nếu đang online và có queue tồn đọng
  if (navigator.onLine && getPendingCount() > 0) {
    sync();
  }

  return () => window.removeEventListener('online', sync);
}
