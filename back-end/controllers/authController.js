const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, gender, dateOfBirth } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống!' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      gender,
      dob: dateOfBirth
    });

    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Số điện thoại hoặc mật khẩu không chính xác!' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Số điện thoại hoặc mật khẩu không chính xác!' });
    }

    // Create JWT
    const payload = {
      userId: user._id,
      role: user.role
    };

    const jwtSecret = process.env.JWT_SECRET || 'doanchuan_secret_key_123';
    const token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng.' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc thiếu!' });
    }

    let payload;
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Lỗi xác thực Google token:', verifyError);
      return res.status(400).json({ message: 'Xác thực tài khoản Google thất bại!', error: verifyError.message });
    }

    const { sub: googleId, email, name, picture } = payload;
    let isNewUser = false;

    // 1. Tìm user bằng googleId
    let user = await User.findOne({ googleId });

    // 2. Nếu không tìm thấy, tìm theo email
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        // Liên kết googleId vào tài khoản hiện tại
        user.googleId = googleId;
        await user.save();
      }
    }

    // 3. Nếu vẫn không thấy, tự động tạo mới tài khoản
    if (!user) {
      user = new User({
        name,
        email,
        googleId,
        role: 'customer' // Vai trò mặc định
      });
      await user.save();
      isNewUser = true;
    }

    // 4. Tạo JWT cho phiên đăng nhập
    const jwtPayload = {
      userId: user._id,
      role: user.role
    };

    const jwtSecret = process.env.JWT_SECRET || 'doanchuan_secret_key_123';
    const jwtToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Đăng nhập bằng Google thành công!',
      token: jwtToken,
      isNewUser,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      }
    });

  } catch (error) {
    console.error('Lỗi khi đăng nhập bằng Google:', error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập bằng Google.', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // req.user được điền bởi authMiddleware, ta lấy thêm các trường cần thiết
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }
    
    // Kiểm tra xem người dùng đã thiết lập mật khẩu hay chưa (để hiển thị đổi mật khẩu hay thiết lập mật khẩu)
    const rawUser = await User.findById(req.user._id);
    const hasPassword = !!rawUser.password;

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        dob: user.dob,
        gender: user.gender,
        role: user.role,
        hasPassword
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin cá nhân:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin cá nhân.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, dob, gender } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: 'Họ tên không được để trống!' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, dob, gender },
      { new: true, runValidators: true }
    ).select('-password');

    const rawUser = await User.findById(userId);
    const hasPassword = !!rawUser.password;

    res.status(200).json({
      message: 'Cập nhật thông tin cá nhân thành công!',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        role: updatedUser.role,
        hasPassword
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin cá nhân:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin cá nhân.', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
    }

    // Lấy user cùng password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    const hasPassword = !!user.password;

    if (hasPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu cũ!' });
      }
      
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
      }
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ 
      message: hasPassword ? 'Đổi mật khẩu thành công!' : 'Thiết lập mật khẩu mới thành công!',
      hasPassword: true
    });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu.', error: error.message });
  }
};

exports.checkPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const user = await User.findOne({ phone }).select('name phone dob gender');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { password } = req.body;
    const adminId = req.user._id;
    const targetUserId = req.params.id;

    // Verify admin password
    const admin = await User.findById(adminId);
    if (!admin || !admin.password) {
      return res.status(400).json({ message: 'Tài khoản admin chưa được thiết lập mật khẩu hợp lệ!' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu xác nhận không chính xác!' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    // Cấm tự deactive chính mình hoặc nếu cần có thể cho phép
    if (adminId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'Không thể vô hiệu hóa chính mình!' });
    }

    // Check if isActive field exists, if undefined treat as true
    const currentStatus = targetUser.isActive !== undefined ? targetUser.isActive : true;
    targetUser.isActive = !currentStatus;
    
    await targetUser.save();

    res.status(200).json({ 
      message: targetUser.isActive ? 'Kích hoạt tài khoản thành công!' : 'Vô hiệu hóa tài khoản thành công!',
      user: {
        id: targetUser._id,
        isActive: targetUser.isActive
      }
    });
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái tài khoản:', error);
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

