const Tour = require('../models/Tour');
const Membership = require('../models/Membership');
const Vehicle = require('../models/Vehicle');

exports.createTour = async (req, res) => {
  try {
    const { name, start_time, end_time, deadline, max_capacity, leader_id } = req.body;
    
    // Note: in a real app, 'created_by' would come from req.user representing the authenticated User/Admin
    const created_by = req.user ? req.user._id : leader_id;

    const tour = new Tour({
      name, start_time, end_time, deadline, max_capacity, created_by, leader_id, status: 'draft'
    });
    await tour.save();

    // The creator/leader should automatically become a member of the tour
    const membership = new Membership({
      tour_id: tour._id,
      user_id: leader_id,
      role: 'leader',
      status: 'approved'
    });
    await membership.save();

    res.status(201).json({ message: 'Tour created successfully', tour, membership });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('created_by', 'name email phone')
      .populate('leader_id', 'name email phone');
      
    if (!tour) {
      return res.status(404).json({ error: 'Không tìm thấy Tour!' });
    }

    let membershipQuery = { tour_id: req.params.id };
    if (req.query.status === 'all') {
      // do nothing, allows all statues
    } else if (req.query.status) {
      membershipQuery.status = req.query.status;
    } else {
      // By default, exclude members who have left
      membershipQuery.status = { $ne: 'left' };
    }

    // Lấy danh sách thành viên/hành khách của tour này
    const memberships = await Membership.find(membershipQuery)
      .populate('user_id', 'name email phone dob gender')
      .sort({ createdAt: 1 });

    // Lấy danh sách phương tiện xe của tour này
    const vehicles = await Vehicle.find({ tour_id: req.params.id })
      .populate({
        path: 'representative_id',
        populate: { path: 'user_id', select: 'name phone' }
      });

    res.status(200).json({ 
      success: true, 
      tour, 
      memberships, 
      vehicles 
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết tour:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { name, start_time, end_time, max_capacity } = req.body;
    const tourId = req.params.id;

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Không tìm thấy Tour!' });
    }

    // Chỉ có người tạo (creator) hoặc leader mới được chỉnh sửa
    if (tour.created_by.toString() !== req.user._id.toString() && tour.leader_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa Tour này!' });
    }

    tour.name = name || tour.name;
    tour.start_time = start_time || tour.start_time;
    tour.end_time = end_time || tour.end_time;
    tour.deadline = start_time || tour.deadline; // deadline matches start_time as required
    tour.max_capacity = max_capacity !== undefined ? Number(max_capacity) : tour.max_capacity;

    await tour.save();
    res.status(200).json({ success: true, message: 'Cập nhật Tour thành công!', tour });
  } catch (error) {
    console.error('Lỗi khi cập nhật tour:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /tours/my
 * Trả về các tour mà người dùng hiện tại là thành viên (có user_id trong membership)
 * hoặc là creator / leader.
 */
exports.getMyTours = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Lấy tất cả tour_id mà user là member (khác 'left')
    const memberships = await Membership.find({ user_id: userId, status: { $ne: 'left' } }).select('tour_id');
    const memberTourIds = memberships.map(m => m.tour_id.toString());

    // 2. Lấy các tour mà user là creator hoặc leader
    const ledTours = await Tour.find({
      $or: [
        { created_by: userId },
        { leader_id: userId }
      ]
    }).select('_id');
    const ledTourIds = ledTours.map(t => t._id.toString());

    // 3. Hợp lại, loại trùng
    const allTourIds = [...new Set([...memberTourIds, ...ledTourIds])];

    // 4. Lấy thông tin đầy đủ các tour này
    const tours = await Tour.find({ _id: { $in: allTourIds } })
      .populate('created_by', 'name phone')
      .populate('leader_id', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tours });
  } catch (error) {
    console.error('Lỗi khi lấy tour của tôi:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tourId = req.params.id;
    const tour = await Tour.findById(tourId);
    
    if (!tour) {
      return res.status(404).json({ error: 'Không tìm thấy Tour!' });
    }

    // Clean up related documents
    const Group = require('../models/Group');
    await Membership.deleteMany({ tour_id: tourId });
    await Vehicle.deleteMany({ tour_id: tourId });
    await Group.deleteMany({ tour_id: tourId });

    // Delete the tour
    await Tour.findByIdAndDelete(tourId);

    res.status(200).json({ success: true, message: 'Xóa Tour thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa tour:', error);
    res.status(500).json({ error: error.message });
  }
};
