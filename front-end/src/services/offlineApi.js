/**
 * Wrapper API với fallback cache + offline queue.
 * Dùng trong TourDetailPage và các tab quan trọng.
 */
import { tourService } from './tourService';
import { itineraryService } from './itineraryService';
import { attendanceService } from './attendanceService';
import { offlineCache } from '../utils/offlineCache';
import { queueMutation } from '../utils/offlineSync';

function isNetworkError(err) {
  return !err.response && (err.code === 'ERR_NETWORK' || !navigator.onLine);
}

export const offlineApi = {
  /** GET tour — cache-first khi offline */
  async getTourById(id, status) {
    try {
      const data = await tourService.getTourById(id, status);
      offlineCache.saveTourDetail(id, data);
      return { data, fromCache: false };
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = offlineCache.getTourDetail(id);
        if (cached) return { data: cached, fromCache: true };
      }
      throw err;
    }
  },

  async getMyTours() {
    try {
      const data = await tourService.getMyTours();
      offlineCache.saveTourList(data);
      return { data, fromCache: false };
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = offlineCache.getTourList();
        if (cached) return { data: cached, fromCache: true };
      }
      throw err;
    }
  },

  async getItinerariesByTour(tourId) {
    try {
      const data = await itineraryService.getItinerariesByTour(tourId);
      offlineCache.saveItineraries(tourId, data);
      return { data, fromCache: false };
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = offlineCache.getItineraries(tourId);
        if (cached) return { data: cached, fromCache: true };
      }
      throw err;
    }
  },

  async getAttendanceByTour(tourId) {
    try {
      const data = await attendanceService.getAttendanceByTour(tourId);
      offlineCache.saveAttendanceByTour(tourId, data);
      return { data, fromCache: false };
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = offlineCache.getAttendanceByTour(tourId);
        if (cached) return { data: cached, fromCache: true };
      }
      throw err;
    }
  },

  async getAttendance(itineraryId, vehicleId) {
    try {
      const data = await attendanceService.getAttendance(itineraryId, vehicleId);
      offlineCache.saveAttendanceSession(itineraryId, vehicleId, data);
      return { data, fromCache: false };
    } catch (err) {
      if (isNetworkError(err)) {
        const cached = offlineCache.getAttendanceSession(itineraryId, vehicleId);
        if (cached) return { data: cached, fromCache: true };
      }
      throw err;
    }
  },

  /**
   * Điểm danh batch — queue khi offline.
   * Leader có thể điểm danh trên xe/bus dù mạng yếu.
   */
  async markAttendanceBatch(payload) {
    if (!navigator.onLine) {
      queueMutation('ATTENDANCE_BATCH', payload);
      return { queued: true, data: payload };
    }
    try {
      const data = await attendanceService.markAttendanceBatch(payload);
      return { queued: false, data };
    } catch (err) {
      if (isNetworkError(err)) {
        queueMutation('ATTENDANCE_BATCH', payload);
        return { queued: true, data: payload };
      }
      throw err;
    }
  },

  /** Tạo itinerary — queue khi offline */
  async createItinerary(payload) {
    if (!navigator.onLine) {
      queueMutation('ITINERARY_CREATE', payload);
      return { queued: true };
    }
    try {
      const data = await itineraryService.createItinerary(payload);
      return { queued: false, data };
    } catch (err) {
      if (isNetworkError(err)) {
        queueMutation('ITINERARY_CREATE', payload);
        return { queued: true };
      }
      throw err;
    }
  },

  async updateItinerary(id, payload) {
    if (!navigator.onLine) {
      queueMutation('ITINERARY_UPDATE', { id, data: payload });
      return { queued: true };
    }
    try {
      const data = await itineraryService.updateItinerary(id, payload);
      return { queued: false, data };
    } catch (err) {
      if (isNetworkError(err)) {
        queueMutation('ITINERARY_UPDATE', { id, data: payload });
        return { queued: true };
      }
      throw err;
    }
  },

  async deleteItinerary(id) {
    if (!navigator.onLine) {
      queueMutation('ITINERARY_DELETE', { id });
      return { queued: true };
    }
    try {
      const data = await itineraryService.deleteItinerary(id);
      return { queued: false, data };
    } catch (err) {
      if (isNetworkError(err)) {
        queueMutation('ITINERARY_DELETE', { id });
        return { queued: true };
      }
      throw err;
    }
  },
};
