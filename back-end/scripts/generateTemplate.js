const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Danh sách hành khách');

  // Define headers
  sheet.columns = [
    { header: 'Họ và tên (bắt buộc)', key: 'name', width: 25 },
    { header: 'Số điện thoại', key: 'phone', width: 15 },
    { header: 'Năm sinh', key: 'birth_year', width: 15 },
    { header: 'Giới tính', key: 'gender', width: 15 },
    { header: 'Vai trò', key: 'role', width: 20 },
    { header: 'Loại khách', key: 'customer_type', width: 20 },
    { header: 'Tên nhóm', key: 'group_name', width: 20 },
    { header: 'Ghi chú', key: 'note', width: 30 }
  ];

  // Protect header row (ExcelJS doesn't perfectly lock only headers without locking the sheet, so we just add a warning comment/styling)
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD32F2F' } // Red warning background
  };
  // Add a comment to the first cell
  sheet.getCell('A1').note = 'KHÔNG ĐƯỢC SỬA TÊN CỘT. Sửa sẽ gây lỗi hệ thống.';

  // Add Example rows
  sheet.addRow({ name: 'Nguyễn Văn A', phone: '0901234567', birth_year: 1990, gender: 'Nam', role: 'Đại diện nhóm', customer_type: 'Người lớn', group_name: 'Team A', note: 'Trưởng nhóm' });
  sheet.addRow({ name: 'Trần Thị B', phone: '0901234568', birth_year: 1995, gender: 'Nữ', role: 'Thành viên', customer_type: 'Người lớn', group_name: 'Team A', note: '' });
  sheet.addRow({ name: 'Lê Văn C', phone: '0901234569', birth_year: 2015, gender: 'Nam', role: 'Thành viên', customer_type: 'Trẻ em', group_name: 'Team A', note: 'Trẻ em' });
  sheet.addRow({ name: 'Phạm Thị D', phone: '0901234570', birth_year: 1960, gender: 'Nữ', role: 'Thành viên', customer_type: 'Người cao tuổi', group_name: 'Team B', note: 'Người cao tuổi' });

  // Add Data Validation (Dropdowns) for rows 2 to 1000
  for (let i = 2; i <= 1000; i++) {
    // Gender
    sheet.getCell(`D${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Nam,Nữ"']
    };

    // Role
    sheet.getCell(`E${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Trưởng đoàn,Đại diện nhóm,Đại diện xe,Tài xế,Thành viên"']
    };

    // Customer Type
    sheet.getCell(`F${i}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Người lớn,Trẻ em,Người cao tuổi"']
    };
  }

  // Ensure directory exists
  const publicDir = path.join(__dirname, '../../front-end/public/templates');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filePath = path.join(publicDir, 'DanhSachHanhKhachTemplate.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`Template generated at ${filePath}`);
}

generateTemplate().catch(console.error);
