import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert,
  Box, Typography, Stack, FormControl, InputLabel, Select, MenuItem,
  Grid, Avatar, Paper, Card, CardContent, Chip, Tooltip, IconButton,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { stringAvatar } from '../../../utils/avatarUtils';
import { useTranslate } from '../../../hooks/useTranslate';

const ViewVehiclePassengersModal = ({
  open,
  onClose,
  actionLoading,
  actionError,
  actionSuccess,
  activeVehicleForPassengers,
  canEditItinerary,
  showAddPassengerPanel,
  setShowAddPassengerPanel,
  groups,
  memberships,
  unassignedMembers,
  selectedGroupIdFilter,
  setSelectedGroupIdFilter,
  handleGroupFilterChange,
  selectedUnassignedIds,
  setSelectedUnassignedIds,
  handleCheckboxToggle,
  handleAssignSeatsBatchSubmit,
  handleAssignVehicleLeader,
  handleRemoveMemberFromVehicle,
  renderLicensePlate
}) => {
  const { t } = useTranslate(['common', 'tour']);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 1536, width: '100%' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Hành khách trên xe:
            </Typography>
            {activeVehicleForPassengers && renderLicensePlate(activeVehicleForPassengers.license_plate, activeVehicleForPassengers.plate_color)}
          </Stack>
          {activeVehicleForPassengers && canEditItinerary && (
            <Button
              variant={showAddPassengerPanel ? "contained" : "outlined"}
              color="success"
              size="small"
              startIcon={showAddPassengerPanel ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
              onClick={() => setShowAddPassengerPanel(!showAddPassengerPanel)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
            >
              {showAddPassengerPanel ? "Đóng bảng xếp xe" : "+ Xếp khách lên xe"}
            </Button>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent>
        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
        {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}

        {showAddPassengerPanel && activeVehicleForPassengers && (
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 3,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AddCircleOutlineIcon sx={{ fontSize: '1.1rem' }} /> Xếp hành khách lên xe
            </Typography>

            {/* Group quick select */}
            {groups.length > 0 && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Chọn nhanh theo Nhóm du lịch</InputLabel>
                <Select
                  value={selectedGroupIdFilter}
                  label="Chọn nhanh theo Nhóm du lịch"
                  onChange={(e) => handleGroupFilterChange(e.target.value)}
                >
                  <MenuItem value="none">-- Tự chọn thủ công --</MenuItem>
                  {groups.map(g => {
                    const unassignedGroupCount = memberships.filter(m => !m.vehicle_id && (m.group_id?._id === g._id || m.group_id === g._id)).length;
                    return (
                      <MenuItem key={g._id} value={g._id} disabled={unassignedGroupCount === 0}>
                        {g.name} ({unassignedGroupCount} người chưa xếp xe)
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            {/* Passenger checklist */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                Chọn hành khách chưa xếp xe:
              </Typography>
              {(() => {
                const assignedCount = memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').length;
                const remainingSeats = activeVehicleForPassengers.seat_count - assignedCount;
                if (unassignedMembers.length > 0 && unassignedMembers.length <= remainingSeats) {
                  return (
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => setSelectedUnassignedIds(unassignedMembers.map(m => m._id))}
                      sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: 2 }}
                    >
                      Chọn tất cả ({unassignedMembers.length} người)
                    </Button>
                  );
                }
                return null;
              })()}
            </Stack>
            {unassignedMembers.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2, py: 1 }}>Tất cả hành khách trong tour đã được xếp xe!</Alert>
            ) : (
              <Box
                sx={{
                  maxHeight: 280,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  p: 1.5,
                  mb: 2.5,
                  bgcolor: '#ffffff'
                }}
              >
                <Grid container spacing={1.5}>
                  {unassignedMembers.map((member) => {
                    const mId = member._id;
                    const mName = member.user_id?.name || member.guest_info?.name;
                    const isChecked = selectedUnassignedIds.includes(mId);
                    const birthYear = member.guest_info?.birth_year || (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : null);
                    const age = birthYear ? new Date().getFullYear() - birthYear : null;

                    // Get group name if any
                    const passGroupId = member.group_id?._id || member.group_id;
                    const grp = groups.find(g => g._id === passGroupId);

                    return (
                      <Grid item xs={12} sm={6} key={mId}>
                        <Box
                          onClick={() => handleCheckboxToggle(mId)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: isChecked ? 'success.main' : 'grey.300',
                            bgcolor: isChecked ? 'success.50' : 'background.paper',
                            cursor: 'pointer',
                            height: '100%',
                            minWidth: 0,
                            width: '100%',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': { bgcolor: 'action.hover', borderColor: isChecked ? 'success.main' : 'grey.400' }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            style={{ marginRight: 12, transform: 'scale(1.2)', cursor: 'pointer', accentColor: '#2e7d32' }}
                          />
                          <Avatar {...stringAvatar(mName || 'Unknown')} sx={{ ...stringAvatar(mName || 'Unknown').sx, width: 28, height: 28, fontSize: '0.75rem', mr: 1.5 }} />
                          <Box sx={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: isChecked ? 'bold' : 'medium', fontSize: '0.85rem', color: isChecked ? 'success.dark' : 'text.primary' }} noWrap>
                              {mName} <Typography component="span" variant="caption" color="text.secondary">({member.role})</Typography>
                              {birthYear && (
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  · {age ? t('tour_birth_year_with_age', { year: birthYear, age }) : t('tour_birth_year_only', { year: birthYear })}
                                </Typography>
                              )}
                            </Typography>
                            {grp && (
                              <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', lineHeight: 1.2, color: 'text.secondary' }} noWrap>
                                Nhóm: <Typography component="span" variant="caption" color="primary.main" fontWeight="bold">{grp.name}</Typography>
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {/* Stats & Validation bar */}
            {(() => {
              const assigned = memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left');
              const assignedCount = assigned.length;
              const remainingSeats = activeVehicleForPassengers.seat_count - assignedCount;
              const selectedCount = selectedUnassignedIds.length;
              const overCapacity = selectedCount > remainingSeats;

              return (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: overCapacity ? 'error.main' : 'text.primary' }}>
                      Ghế trống: {remainingSeats} | Đã chọn: {selectedCount} khách
                    </Typography>
                    {overCapacity && (
                      <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                        Vượt tải {selectedCount - remainingSeats} ghế!
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={() => {
                        setSelectedUnassignedIds([]);
                        setSelectedGroupIdFilter('none');
                        setShowAddPassengerPanel(false);
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      disabled={selectedCount === 0 || overCapacity || actionLoading}
                      onClick={handleAssignSeatsBatchSubmit}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {actionLoading ? '...' : 'Xác nhận xếp xe'}
                    </Button>
                  </Stack>
                </Box>
              );
            })()}
          </Box>
        )}

        {activeVehicleForPassengers && (
          <Box>
            {/* Seat Availability Summary Block */}
            {(() => {
              const assigned = memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left');
              const assignedCount = assigned.length;
              const remaining = activeVehicleForPassengers.seat_count - assignedCount;
              const isFull = remaining <= 0;

              return (
                <Paper sx={{ p: 2, bgcolor: isFull ? 'error.light' : 'success.light', color: isFull ? 'error.contrastText' : 'success.contrastText', borderRadius: 3, mb: 3, opacity: 0.9 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Tình trạng ghế trống:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {isFull ? "ĐÃ ĐẦY XE" : `CÒN TRỐNG ${remaining} / ${activeVehicleForPassengers.seat_count} GHẾ`}
                    </Typography>
                  </Stack>
                </Paper>
              );
            })()}

            {/* Mobile View: Grid of Occupants */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              {memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300' }}>
                  <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Chưa có hành khách nào được xếp lên xe này.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
                  {memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').map((member) => {
                    const isGuest = !member.user_id;
                    const name = isGuest ? member.guest_info?.name : member.user_id?.name;
                    const phone = isGuest ? member.guest_info?.phone : member.user_id?.phone;
                    const birthYear = isGuest ? member.guest_info?.birth_year : (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : '-');
                    const age = birthYear && birthYear !== '-' ? new Date().getFullYear() - Number(birthYear) : null;
                    const genderRaw = isGuest ? member.guest_info?.gender : (member.user_id?.gender === true ? 'male' : member.user_id?.gender === false ? 'female' : '');
                    const genderLabel = genderRaw === 'male' ? 'Nam' : genderRaw === 'female' ? 'Nữ' : 'Khác';
                    const isRepresentative = activeVehicleForPassengers.representative_id === member._id;

                    return (
                      <Box key={member._id} sx={{ display: 'flex' }}>
                        <Card variant="outlined" sx={{ width: '100%', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', border: isRepresentative ? '2px solid' : '1px solid', borderColor: isRepresentative ? 'primary.main' : 'divider' }}>
                          {isRepresentative && (
                            <Chip 
                              label="Trưởng xe" 
                              color="primary" 
                              size="small" 
                              sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold', height: 22, fontSize: '0.7rem' }} 
                            />
                          )}
                          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5} sx={{ minWidth: 0, width: '100%' }}>
                              <Avatar {...stringAvatar(name || 'Unknown')} sx={{ ...stringAvatar(name || 'Unknown').sx, width: 40, height: 40 }} />
                              <Box sx={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2, pr: isRepresentative ? 8 : 0 }} noWrap>
                                  {name}
                                </Typography>
                                {isGuest && (
                                  <Chip label="GUEST" size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'grey.200', color: 'text.secondary', fontWeight: 'bold', mt: 0.5 }} />
                                )}
                              </Box>
                            </Stack>
                            
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon fontSize="small" sx={{ opacity: 0.7 }} /> {phone || 'Chưa cung cấp SĐT'}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonAddIcon fontSize="small" sx={{ opacity: 0.7 }} /> {genderLabel} • {birthYear && birthYear !== '-' ? (age ? t('tour_birth_year_with_age', { year: birthYear, age }) : t('tour_birth_year_only', { year: birthYear })) : '-'}
                              </Typography>
                            </Box>

                            {canEditItinerary && (
                              <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                {!isRepresentative && (
                                  <Tooltip title="Chỉ định làm Trưởng xe">
                                    <Button 
                                      size="small" 
                                      variant="outlined" 
                                      color="primary" 
                                      onClick={() => handleAssignVehicleLeader(activeVehicleForPassengers._id, member._id)}
                                      disabled={actionLoading}
                                      sx={{ textTransform: 'none', borderRadius: 2 }}
                                    >
                                      Làm trưởng xe
                                    </Button>
                                  </Tooltip>
                                )}
                                <Tooltip title="Hủy xếp xe">
                                  <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={() => handleRemoveMemberFromVehicle(member._id)}
                                    disabled={actionLoading}
                                    sx={{ bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
                                  >
                                    <RemoveCircleOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Desktop View: Table of Occupants */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_name')}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_phone')}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_gender')}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_birth_year')}</TableCell>
                      {canEditItinerary && <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="center">{t('col_action')}</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={canEditItinerary ? 5 : 4} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {t('tour_vehicle_empty_occupants')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').map((member) => {
                        const isGuest = !member.user_id;
                        const name = isGuest ? member.guest_info?.name : member.user_id?.name;
                        const phone = isGuest ? member.guest_info?.phone : member.user_id?.phone;
                        const birthYear = isGuest ? member.guest_info?.birth_year : (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : '-');
                        const age = birthYear && birthYear !== '-' ? new Date().getFullYear() - Number(birthYear) : null;
                        const genderRaw = isGuest ? member.guest_info?.gender : (member.user_id?.gender === true ? 'male' : member.user_id?.gender === false ? 'female' : '');
                        const genderLabel = genderRaw === 'male' ? 'Nam' : genderRaw === 'female' ? 'Nữ' : 'Khác';

                        return (
                          <TableRow key={member._id} hover>
                            <TableCell sx={{ fontWeight: 500 }}>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Avatar {...stringAvatar(name || 'Unknown')} sx={{ ...stringAvatar(name || 'Unknown').sx, width: 30, height: 30, fontSize: '0.8rem' }} />
                                <Stack direction="column">
                                  <Typography sx={{ fontWeight: 500, fontSize: '0.85rem' }}>{name}</Typography>
                                  {isGuest && (
                                    <Chip
                                      label="GUEST"
                                      size="small"
                                      sx={{
                                        fontSize: '0.55rem',
                                        height: 16,
                                        width: 'fit-content',
                                        bgcolor: '#eceff1',
                                        color: '#37474f',
                                        fontWeight: 'bold',
                                        mt: 0.25
                                      }}
                                    />
                                  )}
                                </Stack>
                              </Stack>
                            </TableCell>
                            <TableCell>{phone || 'Chưa cung cấp SĐT'}</TableCell>
                            <TableCell>{genderLabel}</TableCell>
                            <TableCell>{birthYear && birthYear !== '-' ? (age ? t('tour_birth_year_with_age', { year: birthYear, age }) : t('tour_birth_year_only', { year: birthYear })) : '-'}</TableCell>
                            {canEditItinerary && (
                              <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  {activeVehicleForPassengers.representative_id === member._id ? (
                                    <Chip label="Trưởng xe" color="primary" size="small" sx={{ fontWeight: 'bold', height: 24 }} />
                                  ) : (
                                    <Tooltip title="Chỉ định làm Trưởng xe">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleAssignVehicleLeader(activeVehicleForPassengers._id, member._id)}
                                        disabled={actionLoading}
                                      >
                                        <PersonAddIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                  <Tooltip title="Hủy xếp xe">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveMemberFromVehicle(member._id)}
                                      disabled={actionLoading}
                                    >
                                      <RemoveCircleOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="primary" variant="contained" sx={{ borderRadius: 2 }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewVehiclePassengersModal;
