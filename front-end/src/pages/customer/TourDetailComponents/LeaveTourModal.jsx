import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Typography, TextField
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const LeaveTourModal = ({
  open,
  onClose,
  actionLoading,
  actionError,
  leaveReason,
  setLeaveReason,
  handleLeaveTour
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
        Rời tour
      </DialogTitle>
      <DialogContent>
        <Typography mb={2}>
          Bạn có chắc chắn muốn rời khỏi tour này không? Việc này là không thể hoàn tác.
        </Typography>
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        <TextField
          fullWidth
          label="Lý do rời tour"
          variant="outlined"
          multiline
          rows={3}
          value={leaveReason}
          onChange={(e) => setLeaveReason(e.target.value)}
          disabled={actionLoading}
          required
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={actionLoading}>
          {t('btn_cancel')}
        </Button>
        <Button onClick={handleLeaveTour} color="error" variant="contained" disabled={actionLoading}>
          Xác nhận rời tour
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveTourModal;
