const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập!' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'doanchuan_secret_key_123';
    
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Không tìm thấy người dùng!' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực (authMiddleware):', error);
    res.status(500).json({ message: 'Lỗi xác thực hệ thống.' });
  }
};
