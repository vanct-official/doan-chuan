const Attendance = require('../models/Attendance');
const Itinerary = require('../models/Itinerary');

// Lấy danh sách điểm danh của 1 lịch trình theo xe
exports.getAttendanceByItineraryAndVehicle = async (req, res) => {
  try {
    const { itineraryId, vehicleId } = req.query;
    if (!itineraryId || !vehicleId) {
      return res.status(400).json({ error: 'itineraryId and vehicleId are required' });
    }
    
    const attendances = await Attendance.find({ 
      itinerary_id: itineraryId,
      vehicle_id: vehicleId 
    });
    
    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy toàn bộ điểm danh của một tour
exports.getAttendanceByTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Tìm tất cả các lịch trình của tour
    const itineraries = await Itinerary.find({ tour_id: tourId });
    const itineraryIds = itineraries.map(i => i._id);
    
    // Tìm tất cả điểm danh thuộc các lịch trình này
    const attendances = await Attendance.find({ itinerary_id: { $in: itineraryIds } });
    
    res.status(200).json(attendances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật điểm danh hàng loạt (Trưởng xe điểm danh)
exports.markAttendanceBatch = async (req, res) => {
  try {
    const { itinerary_id, vehicle_id, attendances } = req.body;
    // attendances is an array of objects: { membership_id, status }
    
    if (!itinerary_id || !vehicle_id || !attendances || !Array.isArray(attendances)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    const recorded_by = req.user.id; // User making the request (assumed to be vehicle leader)
    
    // Process each attendance record
    const promises = attendances.map(async (record) => {
      return Attendance.findOneAndUpdate(
        { itinerary_id, membership_id: record.membership_id },
        { 
          status: record.status, 
          recorded_by,
          vehicle_id 
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });
    
    await Promise.all(promises);
    
    res.status(200).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
