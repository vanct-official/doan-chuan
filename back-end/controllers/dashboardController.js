const Tour = require('../models/Tour');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Vehicle = require('../models/Vehicle');

exports.getDashboardStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập thông tin này.' });
    }

    const totalTours = await Tour.countDocuments();
    const activeTours = await Tour.countDocuments({ end_time: { $gte: new Date() } });
    const totalUsers = await User.countDocuments();
    const totalPassengers = await Membership.countDocuments({ status: 'approved' });
    const totalVehicles = await Vehicle.countDocuments();

    // Fetch latest 5 tours
    const recentTours = await Tour.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('leader_id', 'name phone');

    res.status(200).json({
      success: true,
      data: {
        totalTours,
        activeTours,
        totalUsers,
        totalPassengers,
        totalVehicles,
        recentTours
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
