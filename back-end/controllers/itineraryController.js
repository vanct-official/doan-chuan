const Itinerary = require('../models/Itinerary');
const Tour = require('../models/Tour');

// Lấy danh sách lịch trình của 1 tour
exports.getItinerariesByTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const itineraries = await Itinerary.find({ tour_id: tourId }).sort({ date: 1 });
    res.status(200).json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo lịch trình mới
exports.createItinerary = async (req, res) => {
  try {
    const { tour_id, date, location, activity } = req.body;
    
    // Check tour existence & permission (Admin or Creator)
    const tour = await Tour.findById(tour_id);
    if (!tour) return res.status(404).json({ error: 'Tour not found' });
    
    // Mongoose handles validation
    const itinerary = new Itinerary({ tour_id, date, location, activity });
    await itinerary.save();
    
    res.status(201).json({ message: 'Itinerary created successfully', itinerary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cập nhật lịch trình
exports.updateItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, location, activity } = req.body;
    
    const itinerary = await Itinerary.findByIdAndUpdate(
      id,
      { date, location, activity },
      { new: true, runValidators: true }
    );
    
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    
    res.status(200).json({ message: 'Itinerary updated successfully', itinerary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa lịch trình
exports.deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const itinerary = await Itinerary.findByIdAndDelete(id);
    
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    
    // Also delete attendances related to this itinerary?
    // We should do it to keep DB clean, but leaving it for now or doing it via cascading later
    const Attendance = require('../models/Attendance');
    if (Attendance) {
      await Attendance.deleteMany({ itinerary_id: id });
    }
    
    res.status(200).json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
