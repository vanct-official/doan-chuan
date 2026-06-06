import dayjs from 'dayjs';

/**
 * Format Date object hoặc ISO string từ Backend thành string 'YYYY-MM-DDTHH:mm' 
 * để gắn vào value của TextField type="datetime-local" trên React.
 * Ngăn ngừa lỗi "Nhập một giá trị hợp lệ" trên Safari.
 * @param {string|Date} dateString - ISO Date string hoặc Date object
 * @returns {string} - Chuỗi định dạng cho datetime-local input
 */
export const formatForDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('YYYY-MM-DDTHH:mm');
};

/**
 * Convert string từ datetime-local sang ISO string chuẩn UTC 
 * để gửi request tạo/update lên Backend an toàn.
 * Hàm này dùng dayjs để tự động parse the local string một cách nhất quán 
 * giữa mọi trình duyệt (Safari, Chrome).
 * @param {string} localString - Chuỗi có định dạng 'YYYY-MM-DDTHH:mm'
 * @returns {string} - Chuỗi định dạng chuẩn ISO UTC
 */
export const parseDateTimeLocalToISO = (localString) => {
  if (!localString) return '';
  // dayjs tự động hiểu string này ở Local Timezone hiện tại của thiết bị
  return dayjs(localString).toISOString(); 
};
