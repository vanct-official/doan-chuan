/**
 * Chuẩn hóa số điện thoại Việt Nam
 * Đảm bảo đầu số +84 được chuyển thành 0, loại bỏ khoảng trắng và ký tự không hợp lệ.
 */
exports.normalizePhone = (phone) => {
  if (!phone) return phone;
  
  // Xóa tất cả các khoảng trắng, dấu phẩy, dấu gạch ngang, v.v.
  let normalized = String(phone).replace(/\D/g, '');

  // Nếu số bắt đầu bằng 84 (do regex trên xóa mất dấu +), chuyển thành 0
  if (normalized.startsWith('84') && normalized.length > 9) {
    normalized = '0' + normalized.slice(2);
  }

  return normalized;
};
