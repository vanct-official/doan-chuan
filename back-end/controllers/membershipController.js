const Membership = require('../models/Membership');
const Tour = require('../models/Tour');
const User = require('../models/User');
const { normalizePhone } = require('../utils/phoneUtils');

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

    let finalUserId = user_id;
    let finalGuestInfo = guest_info;

    if (!finalUserId && finalGuestInfo && finalGuestInfo.phone) {
      finalGuestInfo.phone = normalizePhone(finalGuestInfo.phone);
      const existingUser = await User.findOne({ phone: finalGuestInfo.phone });
      if (existingUser) {
        finalUserId = existingUser._id;
      }
    }

    const membership = new Membership({
      tour_id, user_id: finalUserId, guest_info: finalGuestInfo, role, is_driver: is_driver || false, customer_type, group_id, vehicle_id, note, status: 'pending' 
    });
    
    try {
      await membership.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Số điện thoại này đã được thêm vào tour!' });
      }
      throw err;
    }
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
        phone: guest_info.phone ? normalizePhone(guest_info.phone) : membership.guest_info.phone,
        birth_year: guest_info.birth_year !== undefined ? Number(guest_info.birth_year) : membership.guest_info.birth_year,
        gender: guest_info.gender || membership.guest_info.gender
      };
      
      if (membership.guest_info.phone) {
        const existingUser = await User.findOne({ phone: membership.guest_info.phone });
        if (existingUser) {
          membership.user_id = existingUser._id;
          membership.is_guest = false;
        }
      }
    }

    try {
      await membership.save();
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Số điện thoại này đã tồn tại trong tour (trùng lặp)!' });
      }
      throw err;
    }
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

    for (const item of members) {
      let finalUserId = item.user_id || null;
      let finalGuestInfo = item.user_id ? null : {
        name: item.name ? item.name.trim() : '',
        phone: item.phone ? normalizePhone(item.phone) : '',
        birth_year: item.birth_year ? Number(item.birth_year) : undefined,
        gender: item.gender || 'male'
      };

      if (!finalUserId && finalGuestInfo && finalGuestInfo.phone) {
        const existingUser = await User.findOne({ phone: finalGuestInfo.phone });
        if (existingUser) {
          finalUserId = existingUser._id;
        }
      }

      const membership = new Membership({
        tour_id,
        user_id: finalUserId,
        guest_info: finalGuestInfo,
        role: item.role || 'member',
        is_driver: item.is_driver || false,
        customer_type: item.customer_type || 'adult',
        group_id: newGroupId || item.group_id || null,
        status: 'pending'
      });
      try {
        await membership.save();
        createdMemberships.push(membership);
      } catch (err) {
        if (err.code === 11000) {
          return res.status(400).json({ error: `Số điện thoại ${finalGuestInfo ? finalGuestInfo.phone : ''} đã có trong tour, bị trùng lặp!` });
        }
        throw err;
      }
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

exports.importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không tìm thấy file tải lên.' });
    }

    const { id } = req.params;
    const tour_id = id;
    const Tour = require('../models/Tour');
    const Group = require('../models/Group');
    const tour = await Tour.findById(tour_id);
    if (!tour) return res.status(404).json({ error: 'Không tìm thấy Tour.' });

    // Business Rule 5: Cannot join after deadline
    if (new Date() > new Date(tour.deadline)) {
      return res.status(400).json({ error: 'Tour đã quá hạn đăng ký.' });
    }

    const xlsx = require('xlsx');
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'File Excel không có dữ liệu.' });
    }

    const validGenders = ['male', 'female', 'other'];
    const validRoles = ['leader', 'group_rep', 'vehicle_rep', 'driver', 'member'];
    const validCustomerTypes = ['adult', 'child', 'elderly'];

    const parsedData = [];
    const errors = [];

    // Parse and validate rows
    rows.forEach((row, index) => {
      const rowIndex = index + 2; // Assuming row 1 is header

      // Support matching exact headers from template
      const name = row['Họ và tên (bắt buộc)'] || row['Họ và tên'] || row['name'];
      const phone = row['Số điện thoại'] || row['phone'];
      const birthYearRaw = row['Năm sinh'] || row['birth_year'];
      const genderRaw = row['Giới tính'] || row['gender'];
      const roleRaw = row['Vai trò'] || row['role'];
      const customerTypeRaw = row['Loại khách'] || row['customer_type'];
      const groupName = row['Tên nhóm'] || row['group_name'];
      const note = row['Ghi chú'] || row['note'];

      if (!name || name.toString().trim() === '') {
        errors.push(`Dòng ${rowIndex}: Thiếu Họ và tên.`);
        return;
      }

      const genderMap = { 'nam': 'true', 'nữ': 'false' };
      const roleMap = { 'trưởng đoàn': 'leader', 'đại diện nhóm': 'group_rep', 'đại diện xe': 'vehicle_rep', 'tài xế': 'driver', 'thành viên': 'member' };
      const customerTypeMap = { 'người lớn': 'adult', 'trẻ em': 'child', 'người cao tuổi': 'elderly' };

      const genderKey = genderRaw ? genderRaw.toString().toLowerCase().trim() : 'nam';
      const gender = genderMap[genderKey];
      if (!gender) {
        errors.push(`Dòng ${rowIndex}: Giới tính không hợp lệ (${genderRaw}). Vui lòng chọn Nam hoặc Nữ.`);
      }

      const roleKey = roleRaw ? roleRaw.toString().toLowerCase().trim() : 'thành viên';
      const role = roleMap[roleKey];
      if (!role) {
        errors.push(`Dòng ${rowIndex}: Vai trò không hợp lệ (${roleRaw}).`);
      }

      const customerTypeKey = customerTypeRaw ? customerTypeRaw.toString().toLowerCase().trim() : 'người lớn';
      const customerType = customerTypeMap[customerTypeKey];
      if (!customerType) {
        errors.push(`Dòng ${rowIndex}: Loại khách không hợp lệ (${customerTypeRaw}).`);
      }

      const birth_year = birthYearRaw ? Number(birthYearRaw) : undefined;
      if (birthYearRaw && isNaN(birth_year)) {
        errors.push(`Dòng ${rowIndex}: Năm sinh không hợp lệ.`);
      }

      parsedData.push({
        rowIndex,
        name: name.toString().trim(),
        phone: phone ? phone.toString().trim() : '',
        birth_year,
        gender,
        role,
        customer_type: customerType,
        group_name: groupName ? groupName.toString().trim() : '',
        note: note ? note.toString().trim() : ''
      });
    });

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: errors });
    }

    // Capacity Limit check
    const currentMemberCount = await Membership.countDocuments({ 
      tour_id, 
      status: { $in: ['pending', 'approved'] } 
    });

    if (currentMemberCount + parsedData.length > tour.max_capacity) {
      return res.status(400).json({ error: `Tour không đủ sức chứa! Chỉ còn ${tour.max_capacity - currentMemberCount} ghế trống.` });
    }

    // Group logic
    const groupsMap = {}; // { group_name: { groupId, members: [] } }
    
    // Pass 1: Identify unique groups and create Group documents
    const uniqueGroupNames = [...new Set(parsedData.map(d => d.group_name).filter(name => name !== ''))];
    
    for (const gName of uniqueGroupNames) {
      const group = new Group({ tour_id, name: gName });
      await group.save();
      groupsMap[gName] = { groupId: group._id, hasRep: false };
    }

    // Pass 2: Prepare memberships for bulk insert
    const membershipsToInsert = [];
    const representativeUpdates = []; // To update groups with their reps later

    for (const item of parsedData) {
      let finalRole = item.role;
      let finalGroupId = null;

      if (item.group_name && groupsMap[item.group_name]) {
        finalGroupId = groupsMap[item.group_name].groupId;
        
        // Handle only 1 group_rep per group logic
        if (finalRole === 'group_rep') {
          if (!groupsMap[item.group_name].hasRep) {
            groupsMap[item.group_name].hasRep = true;
            // We will set this membership as representative after insertion
          } else {
            // Already has a rep, fallback to member
            finalRole = 'member';
          }
        }
      }

      // Try to find if user already exists
      let existingUserId = null;
      if (item.phone) {
        item.phone = normalizePhone(item.phone);
        const user = await User.findOne({ phone: item.phone });
        if (user) {
          existingUserId = user._id;
        }
      }

      const membershipDoc = {
        tour_id,
        user_id: existingUserId,
        guest_info: {
          name: item.name,
          phone: item.phone,
          birth_year: item.birth_year,
          gender: item.gender
        },
        role: finalRole,
        is_driver: finalRole === 'driver',
        customer_type: item.customer_type,
        group_id: finalGroupId,
        note: item.note,
        status: 'pending' // Or approved depending on business rules, let's keep it pending for now
      };
      
      membershipsToInsert.push(membershipDoc);
    }

    let insertedMemberships = [];
    try {
      insertedMemberships = await Membership.insertMany(membershipsToInsert, { ordered: false });
    } catch (err) {
      if (err.code === 11000) {
        // Some duplicates, but ordered: false allows others to succeed
        return res.status(400).json({ error: 'Một số hành khách đã tồn tại trong tour do trùng lặp số điện thoại!' });
      }
      throw err;
    }

    // Pass 3: Set group representatives
    for (const member of insertedMemberships) {
      if (member.role === 'group_rep' && member.group_id) {
        await Group.findByIdAndUpdate(member.group_id, { representative_id: member._id });
      }
    }

    res.status(201).json({ success: true, message: 'Nhập danh sách hành khách thành công!', count: insertedMemberships.length });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

