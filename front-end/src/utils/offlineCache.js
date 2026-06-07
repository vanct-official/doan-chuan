/**
 * Cache dữ liệu tour vào localStorage để đọc khi offline.
 * Bổ sung cho Workbox API cache — đảm bảo UI luôn có data fallback.
 */

const CACHE_PREFIX = 'pwa_cache_';
const CACHE_KEYS = {
  TOUR_DETAIL: (id) => `${CACHE_PREFIX}tour_${id}`,
  TOUR_LIST: `${CACHE_PREFIX}tour_list`,
  ITINERARIES: (tourId) => `${CACHE_PREFIX}itineraries_${tourId}`,
  ATTENDANCE_TOUR: (tourId) => `${CACHE_PREFIX}attendance_${tourId}`,
  ATTENDANCE_SESSION: (itineraryId, vehicleId) =>
    `${CACHE_PREFIX}attendance_${itineraryId}_${vehicleId}`,
};

function safeSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }));
  } catch (e) {
    console.warn('[PWA Cache] Không thể lưu:', key, e);
  }
}

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data ?? null;
  } catch {
    return null;
  }
}

export const offlineCache = {
  keys: CACHE_KEYS,

  /** Lưu response tour detail (tour + memberships + vehicles) */
  saveTourDetail(tourId, data) {
    safeSet(CACHE_KEYS.TOUR_DETAIL(tourId), data);
  },

  getTourDetail(tourId) {
    return safeGet(CACHE_KEYS.TOUR_DETAIL(tourId));
  },

  saveTourList(data) {
    safeSet(CACHE_KEYS.TOUR_LIST, data);
  },

  getTourList() {
    return safeGet(CACHE_KEYS.TOUR_LIST);
  },

  saveItineraries(tourId, data) {
    safeSet(CACHE_KEYS.ITINERARIES(tourId), data);
  },

  getItineraries(tourId) {
    return safeGet(CACHE_KEYS.ITINERARIES(tourId));
  },

  saveAttendanceByTour(tourId, data) {
    safeSet(CACHE_KEYS.ATTENDANCE_TOUR(tourId), data);
  },

  getAttendanceByTour(tourId) {
    return safeGet(CACHE_KEYS.ATTENDANCE_TOUR(tourId));
  },

  saveAttendanceSession(itineraryId, vehicleId, data) {
    safeSet(CACHE_KEYS.ATTENDANCE_SESSION(itineraryId, vehicleId), data);
  },

  getAttendanceSession(itineraryId, vehicleId) {
    return safeGet(CACHE_KEYS.ATTENDANCE_SESSION(itineraryId, vehicleId));
  },
};
