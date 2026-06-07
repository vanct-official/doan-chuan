import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const AddVehicleModal = ({
  open,
  onClose,
  actionLoading,
  actionError,
  actionSuccess,
  vehicleForm,
  setVehicleForm,
  handleAddVehicleSubmit,
  memberships
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'warning.main' }}>
        {t('modal_add_vehicle_title')}
      </DialogTitle>
      <DialogContent>
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
        <form id="addVehicleForm" onSubmit={handleAddVehicleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('license_plate')}
            placeholder="Ví dụ: 29A-12345"
            value={vehicleForm.license_plate}
            onChange={(e) => setVehicleForm({ ...vehicleForm, license_plate: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>{t('plate_color')}</InputLabel>
            <Select
              value={vehicleForm.plate_color}
              label={t('plate_color')}
              onChange={(e) => setVehicleForm({ ...vehicleForm, plate_color: e.target.value })}
            >
              <MenuItem value="white">Trắng (Xe cá nhân/doanh nghiệp)</MenuItem>
              <MenuItem value="yellow">Vàng (Xe kinh doanh vận tải)</MenuItem>
              <MenuItem value="blue">Xanh (Xe công vụ)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            label={t('seat_count')}
            type="number"
            placeholder="Ví dụ: 7, 16, 29, 45"
            value={vehicleForm.seat_count}
            onChange={(e) => setVehicleForm({ ...vehicleForm, seat_count: e.target.value })}
            inputProps={{ min: 1 }}
          />

          {/* Chọn tài xế từ danh sách hành khách */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Chọn tài xế từ danh sách hành khách</InputLabel>
            <Select
              value={vehicleForm._selectedDriverId || ''}
              label="Chọn tài xế từ danh sách hành khách"
              onChange={(e) => {
                const memberId = e.target.value;
                if (!memberId) {
                  setVehicleForm({ ...vehicleForm, _selectedDriverId: '', driver_name: '', driver_phone: '' });
                  return;
                }
                const found = memberships.find(m => m._id === memberId);
                if (found) {
                  const name = found.user_id?.name || found.guest_info?.name || '';
                  const phone = found.user_id?.phone || found.guest_info?.phone || '';
                  setVehicleForm({ ...vehicleForm, _selectedDriverId: memberId, driver_name: name, driver_phone: phone });
                }
              }}
              displayEmpty
            >
              <MenuItem value=""><em>-- Nhập tay bên dưới --</em></MenuItem>
              {memberships.map((m) => {
                const name = m.user_id?.name || m.guest_info?.name || 'Không rõ';
                const phone = m.user_id?.phone || m.guest_info?.phone || '';
                return (
                  <MenuItem key={m._id} value={m._id}>
                    {name}{phone ? ` - ${phone}` : ''}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            fullWidth
            label={t('driver_name')}
            placeholder="Ví dụ: Nguyễn Văn B"
            value={vehicleForm.driver_name}
            onChange={(e) => setVehicleForm({ ...vehicleForm, driver_name: e.target.value, _selectedDriverId: '' })}
          />

          <TextField
            margin="normal"
            fullWidth
            label={t('driver_phone')}
            placeholder="Ví dụ: 0912345678"
            value={vehicleForm.driver_phone}
            onChange={(e) => setVehicleForm({ ...vehicleForm, driver_phone: e.target.value, _selectedDriverId: '' })}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={actionLoading}>
          {t('cancel')}
        </Button>
        <Button type="submit" form="addVehicleForm" variant="contained" color="warning" disabled={actionLoading}>
          {t('btn_add_vehicle')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVehicleModal;
