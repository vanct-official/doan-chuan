import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const AssignSeatModal = ({
  open,
  onClose,
  actionLoading,
  actionError,
  actionSuccess,
  assignSeatForm,
  setAssignSeatForm,
  handleAssignSeatSubmit,
  unassignedMembers,
  vehicles,
  memberships
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'info.main' }}>
        {t('modal_assign_seat_title')}
      </DialogTitle>
      <DialogContent>
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
        <form id="assignSeatForm" onSubmit={handleAssignSeatSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t('select_passenger')}</InputLabel>
            <Select
              value={assignSeatForm.membership_id}
              label={t('select_passenger')}
              onChange={(e) => setAssignSeatForm({ ...assignSeatForm, membership_id: e.target.value })}
            >
              {unassignedMembers.length === 0 ? (
                <MenuItem disabled>Tất cả hành khách đã được xếp xe!</MenuItem>
              ) : (
                unassignedMembers.map((member) => {
                  const mName = member.user_id?.name || member.guest_info?.name;
                  return (
                    <MenuItem key={member._id} value={member._id}>
                      {mName} ({member.role})
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>{t('select_vehicle')}</InputLabel>
            <Select
              value={assignSeatForm.vehicle_id}
              label={t('select_vehicle')}
              onChange={(e) => setAssignSeatForm({ ...assignSeatForm, vehicle_id: e.target.value })}
            >
              {vehicles.length === 0 ? (
                <MenuItem disabled>Chưa có phương tiện nào trong Tour!</MenuItem>
              ) : (
                vehicles.map((vehicle) => {
                  const assignedCount = memberships.filter(m => m.vehicle_id === vehicle._id && m.status !== 'left').length;
                  const isFull = assignedCount >= vehicle.seat_count;

                  return (
                    <MenuItem key={vehicle._id} value={vehicle._id} disabled={isFull}>
                      {vehicle.license_plate} - Trống {vehicle.seat_count - assignedCount}/{vehicle.seat_count} chỗ {isFull ? '(ĐÃ ĐẦY)' : ''}
                    </MenuItem>
                  );
                })
              )}
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={actionLoading}>
          {t('cancel')}
        </Button>
        <Button type="submit" form="assignSeatForm" variant="contained" color="info" disabled={actionLoading || vehicles.length === 0 || unassignedMembers.length === 0}>
          {t('btn_assign_seat')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignSeatModal;
