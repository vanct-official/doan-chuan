import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Khởi tạo plugin utc cho dayjs
dayjs.extend(utc);

/**
 * [SUBMIT API] Chuyển đổi Local Time sang chuỗi chuẩn UTC ISO để gửi lên backend
 * @param {dayjs.Dayjs | string | Date} date - Local time
 * @returns {string | null} Chuỗi ISO định dạng UTC (VD: "2026-06-07T03:00:00.000Z")
 */
export const toUTC = (date) => {
  if (!date || !dayjs(date).isValid()) return null;
  // .utc() đảm bảo đối tượng đang ở múi giờ UTC, sau đó xuất ra ISO format
  return dayjs(date).utc().toISOString();
};

/**
 * [FETCH API] Chuyển đổi UTC string từ backend sang Local Time dayjs object
 * @param {string | Date} utcDate - Thời gian từ Server (có chứa 'Z' hoặc offset)
 * @returns {dayjs.Dayjs | null} Đối tượng dayjs ở múi giờ hiện tại của user (Local)
 */
export const toLocal = (utcDate) => {
  if (!utcDate) return null;
  // dayjs mặc định parse chuỗi ISO thành Local Time của thiết bị hiện tại
  return dayjs(utcDate).local();
};

export const formatForDateTimeLocal = (date) => {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
};

export const parseDateTimeLocalToISO = (dateString) => {
  if (!dateString) return null;
  return dayjs(dateString).toISOString();
};

