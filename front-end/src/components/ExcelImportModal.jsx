import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import * as xlsx from 'xlsx';
import api from '../services/api';

const ExcelImportModal = ({ open, onClose, tourId, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setValidationErrors([]);
      parseExcelForPreview(file);
    }
  };

  const parseExcelForPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = xlsx.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
        
        if (rows.length === 0) {
          setError('File Excel không có dữ liệu.');
          setPreviewData([]);
          return;
        }

        // Validate basic rules for highlighting
        const validGenders = ['Nam', 'Nữ'];
        const validRoles = ['Trưởng đoàn', 'Đại diện nhóm', 'Đại diện xe', 'Tài xế', 'Thành viên'];
        const validCustomerTypes = ['Người lớn', 'Trẻ em', 'Người cao tuổi'];

        const parsed = rows.map((row, index) => {
          const name = row['Họ và tên (bắt buộc)'] || row['Họ và tên'] || row['name'];
          const phone = row['Số điện thoại'] || row['phone'];
          const birthYearRaw = row['Năm sinh'] || row['birth_year'];
          const genderRaw = row['Giới tính'] || row['gender'];
          const roleRaw = row['Vai trò'] || row['role'];
          const customerTypeRaw = row['Loại khách'] || row['customer_type'];
          const groupName = row['Tên nhóm'] || row['group_name'];
          const note = row['Ghi chú'] || row['note'];

          const rowErrors = [];
          if (!name) rowErrors.push('Thiếu Tên');
          
          const gender = genderRaw ? genderRaw.toString().trim() : 'Nam';
          if (!validGenders.includes(gender)) rowErrors.push('Giới tính sai');

          const role = roleRaw ? roleRaw.toString().trim() : 'Thành viên';
          if (!validRoles.includes(role)) rowErrors.push('Vai trò sai');

          const customerType = customerTypeRaw ? customerTypeRaw.toString().trim() : 'Người lớn';
          if (!validCustomerTypes.includes(customerType)) rowErrors.push('Loại khách sai');

          return {
            id: index + 2,
            name: name || '',
            phone: phone || '',
            birth_year: birthYearRaw || '',
            gender,
            role,
            customer_type: customerType,
            group_name: groupName || '',
            note: note || '',
            hasError: rowErrors.length > 0,
            errorMsgs: rowErrors.join(', ')
          };
        });

        setPreviewData(parsed.slice(0, 10)); // Preview only first 10 rows
        
        const invalidRows = parsed.filter(p => p.hasError);
        if (invalidRows.length > 0) {
          setValidationErrors(invalidRows.map(r => `Dòng ${r.id}: ${r.errorMsgs}`));
        }

      } catch (err) {
        console.error(err);
        setError('Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn file.');
      return;
    }

    if (validationErrors.length > 0) {
      if (!window.confirm('Có một số dòng bị lỗi dữ liệu. Bạn có chắc chắn muốn tiếp tục upload (Hệ thống có thể từ chối)?')) {
        return;
      }
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post(`/tours/${tourId}/import-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(response.data.message || 'Nhập dữ liệu thành công!');
      onImportSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        if (err.response.data.details) {
          setError(`Lỗi: ${err.response.data.error}`);
          setValidationErrors(err.response.data.details);
        } else {
          setError(err.response.data.error || 'Đã xảy ra lỗi khi upload.');
        }
      } else {
        setError('Đã xảy ra lỗi kết nối.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setError(null);
    setValidationErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Hướng dẫn sử dụng file Excel
      </DialogTitle>
      <DialogContent dividers>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="secondary" gutterBottom>1. 📥 Tải file mẫu</Typography>
          <Typography variant="body2" paragraph>Nhấn nút tải file template để lấy file chuẩn. (File Excel có sẵn định dạng dropdown và xác thực dữ liệu)</Typography>
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />} 
            href="/templates/DanhSachHanhKhachTemplate.xlsx"
            download
            sx={{ mb: 2 }}
          >
            Tải file mẫu Excel
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="secondary" gutterBottom>2. ✍️ Nhập dữ liệu</Typography>
          <Typography variant="body2" component="ul">
            <li>Không được sửa tên cột (Dòng 1)</li>
            <li>Điền đầy đủ thông tin vào các cột</li>
            <li>Có thể copy/paste nhóm (ví dụ: Team A)</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="secondary" gutterBottom>3. 👥 Nhóm hành khách</Typography>
          <Typography variant="body2" component="ul">
            <li>Các hành khách cùng nhóm phải có cùng "Tên nhóm"</li>
            <li>Một người trong nhóm cần có vai trò "Đại diện nhóm"</li>
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="error" gutterBottom>4. ⚠️ Lưu ý</Typography>
          <Typography variant="body2" component="ul" color="error">
            <li>Không đổi tên cột, không thêm cột mới</li>
            <li>Sai format sẽ bị từ chối nhập</li>
          </Typography>
        </Box>

        <Box sx={{ mt: 4, p: 2, border: '1px dashed #ccc', borderRadius: 2, textAlign: 'center' }}>
          <input
            accept=".xlsx, .xls"
            style={{ display: 'none' }}
            id="excel-upload-button"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="excel-upload-button">
            <Button variant="contained" component="span" startIcon={<FileUploadIcon />} size="large">
              Chọn File Excel để Upload
            </Button>
          </label>
          {selectedFile && (
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
              File đã chọn: {selectedFile.name}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Phát hiện lỗi dữ liệu (Vui lòng sửa trong file Excel rồi upload lại):</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {validationErrors.length > 5 && <li>...và {validationErrors.length - 5} lỗi khác.</li>}
            </ul>
          </Alert>
        )}

        {previewData.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Bản xem trước (Tối đa 10 dòng đầu)
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.100' }}>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>SĐT</TableCell>
                    <TableCell>Năm sinh</TableCell>
                    <TableCell>Vai trò</TableCell>
                    <TableCell>Nhóm</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((row) => (
                    <TableRow key={row.id} sx={{ bgcolor: row.hasError ? 'error.light' : 'inherit' }}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.birth_year}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>{row.group_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isUploading}>Hủy</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!selectedFile || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isUploading ? 'Đang xử lý...' : 'Xác nhận Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExcelImportModal;
