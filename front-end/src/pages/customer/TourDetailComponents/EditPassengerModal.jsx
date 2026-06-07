import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert,
  Grid, FormControl, InputLabel, Select, MenuItem, Typography, Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const EditPassengerModal = ({
  open,
  onClose,
  actionLoading,
  actionError,
  actionSuccess,
  passengerForm,
  setPassengerForm,
  handleEditPassengerSubmit,
  newGroupSelected,
  setNewGroupSelected,
  groups,
  groupNameInput,
  setGroupNameInput
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Chỉnh sửa thông tin hành khách
      </DialogTitle>
      <DialogContent>
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
        <form id="editPassengerForm" onSubmit={handleEditPassengerSubmit}>
          <TextField
            margin="normal"
            fullWidth
            label="Số điện thoại"
            value={passengerForm.phone}
            disabled
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Họ tên hành khách"
            value={passengerForm.name}
            onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })}
            InputProps={{
              readOnly: !!passengerForm.user_id,
            }}
            helperText={passengerForm.user_id ? "Tài khoản liên kết từ hệ thống" : ""}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Năm sinh"
                type="number"
                value={passengerForm.birth_year}
                onChange={(e) => setPassengerForm({ ...passengerForm, birth_year: e.target.value })}
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
                InputProps={{
                  readOnly: !!passengerForm.user_id,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={passengerForm.gender}
                  label="Giới tính"
                  onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                  inputProps={{
                    readOnly: !!passengerForm.user_id,
                  }}
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Loại khách</InputLabel>
                <Select
                  value={passengerForm.customer_type}
                  label="Loại khách"
                  onChange={(e) => setPassengerForm({ ...passengerForm, customer_type: e.target.value })}
                >
                  <MenuItem value="adult">Người lớn</MenuItem>
                  <MenuItem value="child">Trẻ em</MenuItem>
                  <MenuItem value="elderly">Người già</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Group assignment and role on edit */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Nhóm du lịch (Đại diện đoàn)</InputLabel>
            <Select
              value={newGroupSelected ? 'new' : passengerForm.group_id || 'none'}
              label="Nhóm du lịch (Đại diện đoàn)"
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'new') {
                  setNewGroupSelected(true);
                } else {
                  setNewGroupSelected(false);
                  setPassengerForm({ ...passengerForm, group_id: val });
                }
              }}
            >
              <MenuItem value="none">Không thuộc nhóm (Thành viên độc lập)</MenuItem>
              {groups.map((g) => (
                <MenuItem key={g._id} value={g._id}>
                  {g.name} (Đại diện: {g.representative_id?.user_id?.name || g.representative_id?.guest_info?.name || 'Chưa phân'})
                </MenuItem>
              ))}
              <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                + Tạo nhóm mới & làm đại diện đoàn
              </MenuItem>
            </Select>
          </FormControl>

          {newGroupSelected && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Tên nhóm mới"
              placeholder="Ví dụ: Nhóm gia đình A"
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
            />
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Vai trò hành khách</InputLabel>
            <Select
              value={newGroupSelected ? 'group_rep' : passengerForm.role || 'member'}
              label="Vai trò hành khách"
              onChange={(e) => setPassengerForm({ ...passengerForm, role: e.target.value })}
              disabled={newGroupSelected}
            >
              <MenuItem value="member">Thành viên thường (Member)</MenuItem>
              <MenuItem value="group_rep">Đại diện đoàn (Group Rep)</MenuItem>
              <MenuItem value="vehicle_rep">Đại diện xe (Vehicle Rep)</MenuItem>
              <MenuItem value="driver">Tài xế (Driver)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Trạng thái hành khách</InputLabel>
            <Select
              value={passengerForm.status || 'pending'}
              label="Trạng thái hành khách"
              onChange={(e) => setPassengerForm({ ...passengerForm, status: e.target.value })}
            >
              <MenuItem value="pending">Chờ duyệt (Pending)</MenuItem>
              <MenuItem value="approved">Đã duyệt (Approved)</MenuItem>
              <MenuItem value="rejected">Từ chối (Rejected)</MenuItem>
              <MenuItem value="left">Đã rời (Left)</MenuItem>
              <MenuItem value="removed">Đã xóa (Removed)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="isDriverCheckboxEdit"
              checked={passengerForm.is_driver}
              onChange={(e) => setPassengerForm({ ...passengerForm, is_driver: e.target.checked })}
              style={{ marginRight: 8, transform: 'scale(1.2)', cursor: 'pointer' }}
            />
            <Typography variant="body2" component="label" htmlFor="isDriverCheckboxEdit" sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }}>
              Đồng thời là Tài xế (Driver) của đoàn
            </Typography>
          </Box>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={actionLoading}>
          {t('cancel')}
        </Button>
        <Button type="submit" form="editPassengerForm" variant="contained" color="primary" disabled={actionLoading}>
          {actionLoading ? '...' : t('profile_save_btn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPassengerModal;
