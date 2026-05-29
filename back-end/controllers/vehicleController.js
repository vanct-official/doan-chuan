const Vehicle = require('../models/Vehicle');
const Membership = require('../models/Membership');
const Tour = require('../models/Tour');

exports.createVehicle = async (req, res) => {
  try {
    const { tour_id, license_plate, plate_color, seat_count, driver_name, driver_phone } = req.body;

    const tour = await Tour.findById(tour_id);
    if (!tour) return res.status(404).json({ error: 'Tour not found' });

    const vehicle = new Vehicle({
      tour_id,
      license_plate,
      plate_color,
      seat_count: Number(seat_count),
      driver_name,
      driver_phone
    });
    await vehicle.save();

    res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignMemberToVehicle = async (req, res) => {
  try {
    const { membership_id, vehicle_id } = req.body;

    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const membership = await Membership.findById(membership_id);
    if (!membership) return res.status(404).json({ error: 'Membership not found' });

    if (membership.tour_id.toString() !== vehicle.tour_id.toString()) {
       return res.status(400).json({ error: 'Vehicle and Membership must belong to the same tour.' });
    }

    // Business Rule 2 Integration check: ensuring vehicle has available seats
    const currentAssignees = await Membership.countDocuments({ vehicle_id, status: { $ne: 'left' } });
    if (currentAssignees >= vehicle.seat_count) {
      return res.status(400).json({ error: 'Vehicle represents over-allocation. No seats left.' });
    }

    membership.vehicle_id = vehicle_id;
    await membership.save();

    res.status(200).json({ message: 'Member assigned to vehicle successfully', membership });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { license_plate, plate_color, seat_count, driver_name, driver_phone } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    vehicle.license_plate = license_plate !== undefined ? license_plate.trim().toUpperCase() : vehicle.license_plate;
    vehicle.plate_color = plate_color !== undefined ? plate_color : vehicle.plate_color;
    vehicle.seat_count = seat_count !== undefined ? Number(seat_count) : vehicle.seat_count;
    vehicle.driver_name = driver_name !== undefined ? driver_name.trim() : vehicle.driver_name;
    vehicle.driver_phone = driver_phone !== undefined ? driver_phone.trim() : vehicle.driver_phone;

    await vehicle.save();
    res.status(200).json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    // Clear assignments
    await Membership.updateMany(
      { vehicle_id: req.params.id },
      { $set: { vehicle_id: null } }
    );

    await Vehicle.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignMembersBatch = async (req, res) => {
  try {
    const { membership_ids, vehicle_id } = req.body;

    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    if (!Array.isArray(membership_ids) || membership_ids.length === 0) {
      return res.status(400).json({ error: 'Danh sách hành khách không hợp lệ' });
    }

    const memberships = await Membership.find({ _id: { $in: membership_ids } });
    
    // Check if all memberships belong to the same tour as the vehicle
    const invalidTour = memberships.some(m => m.tour_id.toString() !== vehicle.tour_id.toString());
    if (invalidTour) {
      return res.status(400).json({ error: 'Một số hành khách không thuộc tour này.' });
    }

    // Check capacity
    const currentAssignees = await Membership.countDocuments({ vehicle_id, status: { $ne: 'left' } });
    const availableSeats = vehicle.seat_count - currentAssignees;
    if (memberships.length > availableSeats) {
      return res.status(400).json({ error: `Số ghế trống không đủ. Còn lại: ${availableSeats}, yêu cầu xếp: ${memberships.length}` });
    }

    // Update vehicle_id
    await Membership.updateMany(
      { _id: { $in: membership_ids } },
      { $set: { vehicle_id } }
    );

    res.status(200).json({ message: 'Xếp xe hàng loạt thành công!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignVehicleLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const { membership_id } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const membership = await Membership.findById(membership_id);
    if (!membership) return res.status(404).json({ error: 'Membership not found' });

    if (membership.vehicle_id?.toString() !== id) {
      return res.status(400).json({ error: 'Thành viên này không nằm trên xe hiện tại.' });
    }

    // Reset old leader if exists and is different
    if (vehicle.representative_id && vehicle.representative_id.toString() !== membership_id) {
      const oldLeader = await Membership.findById(vehicle.representative_id);
      if (oldLeader && oldLeader.role === 'vehicle_rep') {
        oldLeader.role = 'member';
        await oldLeader.save();
      }
    }

    membership.role = 'vehicle_rep';
    await membership.save();

    vehicle.representative_id = membership._id;
    await vehicle.save();

    res.status(200).json({ message: 'Phân quyền Trưởng xe thành công', vehicle, membership });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
