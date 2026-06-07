import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogActions, Button, Box, Typography, Stack
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const InviteLinkModal = ({
  open,
  onClose,
  tour
}) => {
  const [inviteCopied, setInviteCopied] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          maxWidth: 520,
          width: '100%',
          overflow: 'hidden',
        }
      }}
    >
      {/* Gradient header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          px: 3,
          py: 2.5,
          color: '#fff',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <LinkIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">Link mời tham gia Tour</Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              Chỉ bạn và trưởng đoàn mới thấy nút này
            </Typography>
          </Box>
        </Stack>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Chia sẻ link bên dưới để mời mọi người tham gia tour{' '}
          <strong>{tour?.name}</strong>. Link có hiệu lực đến trước thời điểm tour bắt đầu.
        </Typography>

        {/* Link display box */}
        {(() => {
          const inviteToken = tour ? btoa(tour._id) : '';
          const inviteLink = `${window.location.origin}/join/${inviteToken}`;
          return (
            <Box>
              <Box
                sx={{
                  bgcolor: 'grey.50',
                  border: '1.5px solid',
                  borderColor: inviteCopied ? 'success.main' : 'divider',
                  borderRadius: 2.5,
                  p: 2,
                  mb: 2,
                  wordBreak: 'break-all',
                  transition: 'border-color 0.3s',
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'text.primary' }}>
                  {inviteLink}
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={inviteCopied ? null : <ContentCopyIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    setInviteCopied(true);
                    setTimeout(() => setInviteCopied(false), 3000);
                  }}
                  sx={{
                    borderRadius: 2.5,
                    fontWeight: 'bold',
                    bgcolor: inviteCopied ? 'success.main' : '#7c3aed',
                    '&:hover': { bgcolor: inviteCopied ? 'success.dark' : '#6d28d9' },
                    transition: 'background-color 0.3s',
                  }}
                >
                  {inviteCopied ? '✅ Đã sao chép!' : 'Sao chép link'}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<OpenInNewIcon />}
                  onClick={() => window.open(inviteLink, '_blank')}
                  sx={{ borderRadius: 2.5, borderColor: '#7c3aed', color: '#7c3aed' }}
                >
                  Mở thử link
                </Button>
              </Stack>

              <Box
                sx={{
                  mt: 2.5,
                  p: 1.5,
                  bgcolor: 'warning.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'warning.light',
                }}
              >
                <Typography variant="caption" color="warning.dark">
                  ⏰ Link hết hạn lúc:{' '}
                  <strong>
                    {tour ? new Date(tour.start_time).toLocaleString('vi-VN', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    }) : ''}
                  </strong>
                </Typography>
              </Box>
            </Box>
          );
        })()}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2.5 }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteLinkModal;
