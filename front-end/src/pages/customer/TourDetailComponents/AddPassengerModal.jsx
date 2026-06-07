import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert,
  Tabs, Tab, Grid, FormControl, InputLabel, Select, MenuItem, Typography, Box,
  Divider, Paper, IconButton, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import { useTranslation } from 'react-i18next';

const AddPassengerModal = ({
  open,
  onClose,
  actionLoading,
  actionError,
  actionSuccess,
  addPassengerMode,
  setAddPassengerMode,
  passengerForm,
  setPassengerForm,
  handleAddPassengerSubmit,
  handlePassengerPhoneChange,
  newGroupSelected,
  setNewGroupSelected,
  groups,
  groupNameInput,
  setGroupNameInput,
  batchMembers,
  setBatchMembers,
  handleRemoveBatchRow,
  handlePassengerPhoneChangeBatch,
  handleAddBatchRow
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 650, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'success.main' }}>
        {t('modal_add_passenger_title')}
      </DialogTitle>
      <DialogContent>
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}

        <Tabs
          value={addPassengerMode}
          onChange={(_, val) => setAddPassengerMode(val)}
          centered
          sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Tab label="Thêm một người" value="single" sx={{ fontWeight: 'bold' }} />
          <Tab label="Thêm cả nhóm (Nhiều người)" value="batch" sx={{ fontWeight: 'bold' }} />
        </Tabs>

        <form id="addPassengerForm" onSubmit={handleAddPassengerSubmit}>
          {addPassengerMode === 'single' ? (
            <>
              <TextField
                margin="normal"
                fullWidth
                label="Số điện thoại"
                placeholder="Ví dụ: 0987654321"
                value={passengerForm.phone}
                onChange={handlePassengerPhoneChange}
                autoFocus
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label="Họ tên hành khách"
                placeholder="Ví dụ: Nguyễn Văn A"
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
                    placeholder="Ví dụ: 1995"
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

              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="isDriverCheckboxSingle"
                  checked={passengerForm.is_driver}
                  onChange={(e) => setPassengerForm({ ...passengerForm, is_driver: e.target.checked })}
                  style={{ marginRight: 8, transform: 'scale(1.2)', cursor: 'pointer' }}
                />
                <Typography variant="body2" component="label" htmlFor="isDriverCheckboxSingle" sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }}>
                  Đồng thời là Tài xế (Driver) của đoàn
                </Typography>
              </Box>
            </>
          ) : (
            // BATCH MODE: Add many passengers at once
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Chọn phân nhóm</InputLabel>
                <Select
                  value={newGroupSelected ? 'new' : 'none'}
                  label="Chọn phân nhóm"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'new') {
                      setNewGroupSelected(true);
                    } else {
                      setNewGroupSelected(false);
                    }
                  }}
                >
                  <MenuItem value="none">Không lập nhóm mới (Các thành viên riêng lẻ)</MenuItem>
                  <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    + Tạo một Nhóm mới chung cho tất cả thành viên này
                  </MenuItem>
                </Select>
              </FormControl>

              {newGroupSelected && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Tên nhóm mới"
                  placeholder="Ví dụ: Đoàn du lịch Hà Nội"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  helperText="Người đầu tiên trong danh sách dưới đây sẽ tự động làm Đại diện đoàn (Group Representative)"
                />
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Danh sách thành viên đăng ký:
              </Typography>

              {batchMembers.map((member, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 3, position: 'relative' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Thành viên #{index + 1} {index === 0 && newGroupSelected ? "(Đại diện đoàn)" : ""}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          id={`isDriverBatch-${index}`}
                          checked={member.is_driver}
                          onChange={(e) => {
                            const updated = [...batchMembers];
                            updated[index].is_driver = e.target.checked;
                            setBatchMembers(updated);
                          }}
                          style={{ marginRight: 6, transform: 'scale(1)', cursor: 'pointer' }}
                        />
                        <Typography variant="caption" component="label" htmlFor={`isDriverBatch-${index}`} sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'text.secondary' }}>
                          Là tài xế
                        </Typography>
                      </Box>
                    </Stack>
                    {batchMembers.length > 1 && (
                      <IconButton size="small" color="error" onClick={() => handleRemoveBatchRow(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Số điện thoại"
                        placeholder="Ví dụ: 098..."
                        value={member.phone}
                        onChange={(e) => handlePassengerPhoneChangeBatch(index, e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        required
                        fullWidth
                        size="small"
                        label="Họ và Tên"
                        placeholder="Nguyễn Văn A"
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...batchMembers];
                          updated[index].name = e.target.value;
                          setBatchMembers(updated);
                        }}
                        InputProps={{
                          readOnly: !!member.user_id,
                        }}
                        helperText={member.user_id ? "Đã liên kết" : ""}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                      <TextField
                        required
                        fullWidth
                        size="small"
                        label="Năm sinh"
                        type="number"
                        placeholder="1990"
                        value={member.birth_year}
                        onChange={(e) => {
                          const updated = [...batchMembers];
                          updated[index].birth_year = e.target.value;
                          setBatchMembers(updated);
                        }}
                        inputProps={{ min: 1900, max: new Date().getFullYear() }}
                        InputProps={{
                          readOnly: !!member.user_id,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>Giới tính</InputLabel>
                        <Select
                          value={member.gender}
                          label="Giới tính"
                          onChange={(e) => {
                            const updated = [...batchMembers];
                            updated[index].gender = e.target.value;
                            setBatchMembers(updated);
                          }}
                          inputProps={{
                            readOnly: !!member.user_id,
                          }}
                        >
                          <MenuItem value="male">Nam</MenuItem>
                          <MenuItem value="female">Nữ</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4} md={2}>
                      <FormControl fullWidth size="small" required>
                        <InputLabel>Loại khách</InputLabel>
                        <Select
                          value={member.customer_type}
                          label="Loại khách"
                          onChange={(e) => {
                            const updated = [...batchMembers];
                            updated[index].customer_type = e.target.value;
                            setBatchMembers(updated);
                          }}
                        >
                          <MenuItem value="adult">Người lớn</MenuItem>
                          <MenuItem value="child">Trẻ em</MenuItem>
                          <MenuItem value="elderly">Người già</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddBatchRow}
                sx={{ mt: 1, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
              >
                Thêm thành viên khác
              </Button>
            </Box>
          )}
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={actionLoading}>
          {t('cancel')}
        </Button>
        <Button type="submit" form="addPassengerForm" variant="contained" color="success" disabled={actionLoading}>
          {t('btn_add_passenger')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPassengerModal;
