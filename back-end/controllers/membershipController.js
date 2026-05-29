const Membership = require('../models/Membership');
const Tour = require('../models/Tour');
const User = require('../models/User');

exports.addMember = async (req, res) => {
  try {
    const { tour_id, user_id, guest_info, role, is_driver, customer_type, group_id, vehicle_id, note } = req.body;

    const tour = await Tour.findById(tour_id);
    if (!tour) return res.status(404).json({ error: 'Tour not found' });

    // Business Rule 5: Cannot join after deadline
    if (new Date() > new Date(tour.deadline)) {
      return res.status(400).json({ error: 'Join deadline has passed for this tour.' });
    }

    // Business Rule 1: Capacity Limit check
    const currentMemberCount = await Membership.countDocuments({ 
      tour_id, 
      status: { $in: ['pending', 'approved'] } 
    });

    if (currentMemberCount >= tour.max_capacity) {
      return res.status(400).json({ error: 'Tour has reached maximum capacity.' });
    }

    if (user_id) {
       const user = await User.findById(user_id);
       if (!user) return res.status(404).json({ error: 'User not found' });
       // Auto-fill logic handled by UI mapping directly to the DB entity.
       // E.g., we do not allow edits of dob/gender here for existing users (Business Rule 6).
    }

    const membership = new Membership({
      tour_id, user_id, guest_info, role, is_driver: is_driver || false, customer_type, group_id, vehicle_id, note, status: 'pending' 
    });
    
    await membership.save();
    res.status(201).json({ message: 'Member added successfully', membership });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bulkApproveMembers = async (req, res) => {
  try {
    const { membership_ids } = req.body;

    const result = await Membership.updateMany(
      { _id: { $in: membership_ids }, status: 'pending' },
      { $set: { status: 'approved' } }
    );

    res.status(200).json({ message: 'Members approved successfully', count: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { role, status, is_driver, customer_type, guest_info, group_id, vehicle_id, note } = req.body;
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ error: 'Membership not found' });

    membership.role = role || membership.role;
    membership.status = status || membership.status;
    membership.customer_type = customer_type || membership.customer_type;
    if (is_driver !== undefined) {
      membership.is_driver = is_driver;
    }
    membership.group_id = group_id !== undefined ? group_id : membership.group_id;
    membership.vehicle_id = vehicle_id !== undefined ? vehicle_id : membership.vehicle_id;
    membership.note = note !== undefined ? note : membership.note;

    if (guest_info && !membership.user_id) {
      membership.guest_info = {
        name: guest_info.name || membership.guest_info.name,
        phone: guest_info.phone || membership.guest_info.phone,
        birth_year: guest_info.birth_year !== undefined ? Number(guest_info.birth_year) : membership.guest_info.birth_year,
        gender: guest_info.gender || membership.guest_info.gender
      };
    }

    await membership.save();
    res.status(200).json({ success: true, message: 'Membership updated successfully', membership });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ error: 'Membership not found' });

    await Membership.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Membership deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.leaveTour = async (req, res) => {
  try {
    const { leave_reason } = req.body;
    const membershipId = req.params.id;

    if (!leave_reason || leave_reason.trim() === '') {
      return res.status(400).json({ error: 'Lý do rời tour là bắt buộc.' });
    }

    const membership = await Membership.findById(membershipId);
    if (!membership) return res.status(404).json({ error: 'Không tìm thấy Membership.' });

    if (membership.user_id && membership.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bạn không có quyền thực hiện hành động này.' });
    }

    if (membership.group_id) {
      if (membership.role === 'group_rep') {
        // Đại diện nhóm rời -> cả nhóm rời
        await Membership.updateMany(
          { group_id: membership.group_id, status: { $ne: 'left' } },
          { $set: { status: 'left', leave_reason: leave_reason } }
        );
      } else {
        return res.status(403).json({ error: 'Chỉ đại diện nhóm mới có quyền báo rời tour cho nhóm.' });
      }
    } else {
      // Cá nhân tự rời
      membership.status = 'left';
      membership.leave_reason = leave_reason;
      await membership.save();
    }

    res.status(200).json({ success: true, message: 'Đã báo rời tour thành công.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMembersBatch = async (req, res) => {
  try {
    const { tour_id, members, group_name } = req.body;
    if (!tour_id || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: 'tour_id and an array of members are required.' });
    }

    const Tour = require('../models/Tour');
    const tour = await Tour.findById(tour_id);
    if (!tour) return res.status(404).json({ error: 'Tour not found' });

    // Capacity Limit check
    const currentMemberCount = await Membership.countDocuments({ 
      tour_id, 
      status: { $in: ['pending', 'approved'] } 
    });

    if (currentMemberCount + members.length > tour.max_capacity) {
      return res.status(400).json({ error: `Tour không đủ sức chứa! Chỉ còn ${tour.max_capacity - currentMemberCount} ghế trống.` });
    }

    let newGroupId = null;
    if (group_name && group_name.trim()) {
      const Group = require('../models/Group');
      const group = new Group({ tour_id, name: group_name.trim() });
      await group.save();
      newGroupId = group._id;
    }

    const createdMemberships = [];
    for (const item of members) {
      const membership = new Membership({
        tour_id,
        user_id: item.user_id || null,
        guest_info: item.user_id ? null : {
          name: item.name ? item.name.trim() : '',
          phone: item.phone ? item.phone.trim() : '',
          birth_year: item.birth_year ? Number(item.birth_year) : undefined,
          gender: item.gender || 'male'
        },
        role: item.role || 'member',
        is_driver: item.is_driver || false,
        customer_type: item.customer_type || 'adult',
        group_id: newGroupId || item.group_id || null,
        status: 'pending'
      });
      await membership.save();
      createdMemberships.push(membership);
    }

    // Set first passenger as group representative
    if (newGroupId && createdMemberships.length > 0) {
      const Group = require('../models/Group');
      await Group.findByIdAndUpdate(newGroupId, { representative_id: createdMemberships[0]._id });
      createdMemberships[0].role = 'group_rep';
      await createdMemberships[0].save();
    }

    res.status(201).json({ success: true, message: 'Thêm nhóm hành khách thành công!', memberships: createdMemberships });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
