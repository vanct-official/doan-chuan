const Membership = require('../models/Membership');
const Vehicle = require('../models/Vehicle');

module.exports = async (req, res, next) => {
  try {
    // Requires authMiddleware to run first so req.user is set
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa đăng nhập!' });
    }

    // Allow admins to bypass this check
    if (req.user.role === 'admin') {
      return next();
    }

    // vehicle_id usually comes from params or body depending on route
    const vehicle_id = req.params.id || req.body.vehicle_id;
    
    if (!vehicle_id) {
      return res.status(400).json({ message: 'Thiếu vehicle_id trong request.' });
    }

    // Check if current user has a membership on this vehicle with role vehicle_rep
    const membership = await Membership.findOne({
      user_id: req.user._id,
      vehicle_id: vehicle_id,
      role: 'vehicle_rep'
    });

    if (!membership) {
      return res.status(403).json({ message: 'Bạn không phải là Trưởng xe của xe này!' });
    }

    // Inject membership to request for later use if needed
    req.vehicleLeaderMembership = membership;
    
    next();
  } catch (error) {
    console.error('Lỗi xác thực Trưởng xe (isVehicleLeader):', error);
    res.status(500).json({ message: 'Lỗi xác thực quyền Trưởng xe.' });
  }
};
