import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Stack, Box, Paper, Chip, Divider, Avatar, FormControlLabel, Checkbox
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { stringAvatar } from '../../../utils/avatarUtils';

const AttendanceModal = ({
  open,
  onClose,
  actionLoading,
  selectedItinerary,
  canEditItinerary,
  isDriver,
  myMembership,
  memberships,
  vehicles,
  groups,
  attendanceData,
  handleToggleGroupAttendance,
  handleToggleAttendance,
  handleSaveAttendance
}) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 800, width: '100%' } }}>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
        Điểm danh Hành khách
        {selectedItinerary && (
          <Typography variant="body2" sx={{ display: 'block', color: 'text.secondary', mt: 1 }}>
            Mốc: {new Date(selectedItinerary.date).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })} - {selectedItinerary.location}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {(() => {
          let displayMembers = [];
          if (canEditItinerary) {
            displayMembers = memberships.filter(m => m.status !== 'left' && m.vehicle_id);
          } else if (isDriver && myMembership?.vehicle_id) {
            displayMembers = memberships.filter(m => m.vehicle_id === myMembership.vehicle_id && m.status !== 'left');
          } else {
            return <Typography>Bạn không có quyền điểm danh hoặc chưa được phân xe.</Typography>;
          }

          if (displayMembers.length === 0) return <Typography>Không có hành khách nào cần điểm danh.</Typography>;

          // Group by vehicle first, then by group_id
          const groupedByVehicle = {};
          displayMembers.forEach(m => {
            const vid = m.vehicle_id || 'unassigned';
            if (!groupedByVehicle[vid]) groupedByVehicle[vid] = [];
            groupedByVehicle[vid].push(m);
          });

          return (
            <Stack spacing={4}>
              {Object.entries(groupedByVehicle).map(([vid, vMembers]) => {
                const vehicleInfo = vehicles.find(v => v._id === vid);
                
                // Group by group_id within vehicle
                const groupedByGroup = {};
                vMembers.forEach(m => {
                  const gid = m.group_id?._id || m.group_id || 'individual';
                  if (!groupedByGroup[gid]) groupedByGroup[gid] = [];
                  groupedByGroup[gid].push(m);
                });

                return (
                  <Box key={vid}>
                    {canEditItinerary && vehicleInfo && (
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                        <DirectionsCarIcon /> Xe {vehicleInfo.license_plate}
                      </Typography>
                    )}
                    
                    <Stack spacing={3}>
                      {Object.entries(groupedByGroup).map(([gid, groupMembers]) => {
                        const groupInfo = groups.find(g => g._id === gid);
                        const groupName = groupInfo ? groupInfo.name : 'Khách lẻ (Không theo nhóm)';
                        
                        // Check if all in this group are present
                        const isAllGroupPresent = groupMembers.every(m => {
                          const rec = attendanceData.find(a => a.membership_id === m._id);
                          return rec && rec.status === 'present';
                        });

                        return (
                          <Paper key={gid} variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                                <GroupsIcon color="action" /> {groupName}
                                <Chip label={`${groupMembers.length} người`} size="small" variant="outlined" sx={{ ml: 1, height: 20 }} />
                              </Typography>
                              <Button 
                                variant={isAllGroupPresent ? "outlined" : "contained"}
                                color={isAllGroupPresent ? "inherit" : "primary"}
                                size="small"
                                onClick={() => handleToggleGroupAttendance(groupMembers)}
                                startIcon={<CheckCircleIcon />}
                                sx={{ textTransform: 'none', borderRadius: 8 }}
                              >
                                {isAllGroupPresent ? "Bỏ chọn nhóm" : "Điểm danh nhóm"}
                              </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={1.5}>
                              {groupMembers.map(member => {
                                const name = member.user_id?.name || member.guest_info?.name || 'Không rõ';
                                const phone = member.user_id?.phone || member.guest_info?.phone || '';
                                const attendanceRec = attendanceData.find(a => a.membership_id === member._id);
                                const isPresent = attendanceRec ? attendanceRec.status === 'present' : false;
                                
                                return (
                                  <Box key={member._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, bgcolor: isPresent ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)', border: '1px solid', borderColor: isPresent ? 'success.light' : 'error.light' }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                      <Avatar {...stringAvatar(name)} sx={{ ...stringAvatar(name).sx, width: 36, height: 36 }} />
                                      <Box>
                                        <Typography variant="body2" fontWeight="bold">{name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{phone}</Typography>
                                      </Box>
                                    </Box>
                                    <FormControlLabel
                                      control={
                                        <Checkbox
                                          checked={isPresent}
                                          onChange={() => handleToggleAttendance(member._id)}
                                          icon={<CancelIcon color="error" />}
                                          checkedIcon={<CheckCircleIcon color="success" />}
                                        />
                                      }
                                      label={isPresent ? "Có mặt" : "Vắng"}
                                      labelPlacement="start"
                                      sx={{ m: 0, '& .MuiFormControlLabel-label': { fontSize: '0.875rem', fontWeight: 'bold', color: isPresent ? 'success.main' : 'error.main', mr: 1 } }}
                                    />
                                  </Box>
                                );
                              })}
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          );
        })()}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={actionLoading}>
          Đóng
        </Button>
        <Button onClick={handleSaveAttendance} variant="contained" color="secondary" disabled={actionLoading}>
          {actionLoading ? 'Đang lưu...' : 'Lưu Điểm danh'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AttendanceModal;
