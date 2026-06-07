import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { useTranslation } from 'react-i18next';

const EditTourModal = ({
  open,
  onClose,
  actionLoading,
  actionError,
  actionSuccess,
  tourForm,
  setTourForm,
  handleEditTourSubmit
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {t('modal_edit_tour_title')}
      </DialogTitle>
      <DialogContent>
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
        <form id="editTourForm" onSubmit={handleEditTourSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('tour_name')}
            value={tourForm.name}
            onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
          />
          <TextField
            margin="normal"
            fullWidth
            multiline
            rows={3}
            label={t('tour_description')}
            value={tourForm.description}
            onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDateTimePicker
              label={t('tour_start_time')}
              value={tourForm.start_time}
              onChange={(newValue) => setTourForm({ ...tourForm, start_time: newValue })}
              format="DD/MM/YYYY HH:mm"
              slotProps={{
                textField: { margin: 'normal', required: true, fullWidth: true }
              }}
            />
            <MobileDateTimePicker
              label={t('tour_end_time')}
              value={tourForm.end_time}
              onChange={(newValue) => setTourForm({ ...tourForm, end_time: newValue })}
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
            label={t('tour_capacity')}
            type="number"
            value={tourForm.max_capacity}
            onChange={(e) => setTourForm({ ...tourForm, max_capacity: e.target.value })}
            inputProps={{ min: 1 }}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={actionLoading}>
          {t('cancel')}
        </Button>
        <Button type="submit" form="editTourForm" variant="contained" color="primary" disabled={actionLoading}>
          {actionLoading ? '...' : t('profile_save_btn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTourModal;
