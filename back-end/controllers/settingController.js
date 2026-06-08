const Setting = require('../models/Setting');

exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findOne({ key });
    
    res.status(200).json({
      success: true,
      value: setting ? setting.value : ''
    });
  } catch (error) {
    console.error(`Lỗi khi lấy cài đặt (key: ${req.params.key}):`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    // Chỉ admin mới có quyền chỉnh sửa settings
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này!' });
    }

    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ success: false, message: 'Giá trị cài đặt không hợp lệ.' });
    }

    let setting = await Setting.findOne({ key });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = new Setting({ key, value });
      await setting.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật cài đặt thành công.',
      setting
    });
  } catch (error) {
    console.error(`Lỗi khi cập nhật cài đặt (key: ${req.params.key}):`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};
