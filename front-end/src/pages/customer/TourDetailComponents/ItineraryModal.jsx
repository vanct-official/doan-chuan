import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const ItineraryModal = ({
  open,
  onClose,
  actionLoading,
  editItineraryId,
  itineraryForm,
  setItineraryForm,
  handleSaveItinerary
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {editItineraryId ? 'Cập nhật mốc lịch trình' : 'Thêm mốc lịch trình mới'}
      </DialogTitle>
      <DialogContent>
        <form id="itineraryForm" onSubmit={handleSaveItinerary}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Thời gian"
              value={itineraryForm.date}
              onChange={(newValue) => setItineraryForm({ ...itineraryForm, date: newValue })}
              format="DD/MM/YYYY HH:mm"
              slotProps={{
                textField: { margin: 'normal', required: true, fullWidth: true }
              }}
            />
          </LocalizationProvider>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Địa điểm"
            placeholder="VD: Cổng Công viên Thống Nhất"
            value={itineraryForm.location}
            onChange={(e) => setItineraryForm({ ...itineraryForm, location: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            multiline
            rows={3}
            label="Hoạt động"
            placeholder="VD: Tập trung lên xe, ăn sáng..."
            value={itineraryForm.activity}
            onChange={(e) => setItineraryForm({ ...itineraryForm, activity: e.target.value })}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={actionLoading}>
          Hủy
        </Button>
        <Button type="submit" form="itineraryForm" variant="contained" color="primary" disabled={actionLoading}>
          {actionLoading ? '...' : 'Lưu lại'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItineraryModal;
