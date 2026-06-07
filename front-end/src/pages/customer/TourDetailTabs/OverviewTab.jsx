import React from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, LinearProgress, 
  Stack, Avatar, IconButton, Tooltip, Chip
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';

export default function OverviewTab({ tour, memberships, vehicles, canEditItinerary, onEditTour, onInviteLink }) {
  // Calculate stats
  const totalCapacity = vehicles.reduce((sum, v) => sum + (v.seat_count || 0), 0);
  const totalAssigned = memberships.filter(m => m.vehicle_id).length;
  const totalMembers = memberships.filter(m => m.status !== 'left').length;
  const approvedMembers = memberships.filter(m => m.status === 'approved').length;
  const pendingMembers = memberships.filter(m => m.status === 'pending').length;
  const occupancyRate = totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0;
  const unassigned = totalMembers - totalAssigned;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Leader & Tour info card */}
      <Card 
        sx={{ 
          mb: 3, 
          borderRadius: 4, 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar 
              src={tour.leader_id?.avatar} 
              sx={{ width: 60, height: 60, border: '3px solid rgba(255,255,255,0.3)' }}
            >
              {tour.leader_id?.name ? tour.leader_id.name[0] : 'L'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' }}>
                Trưởng đoàn
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {tour.leader_id?.name || 'Chưa cập nhật'}
              </Typography>
              {tour.leader_id?.phone && (
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', opacity: 0.9, mt: 0.5 }}>
                  <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  {tour.leader_id.phone}
                </Typography>
              )}
            </Box>
            {/* Action Buttons */}
            <Stack direction="column" spacing={0.5}>
              {canEditItinerary && onEditTour && (
                <Tooltip title="Chỉnh sửa tour">
                  <IconButton
                    onClick={onEditTour}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onInviteLink && (
                <Tooltip title="Link mời tham gia">
                  <IconButton
                    onClick={onInviteLink}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' } }}
                  >
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, p: 2, backdropFilter: 'blur(10px)' }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 600 }}>
              <EventIcon sx={{ fontSize: 18, mr: 1 }} />
              Lịch trình dự kiến
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Bắt đầu: {new Date(tour.start_time).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
            </Typography>
            <br/>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Kết thúc: {new Date(tour.end_time).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
        Tình trạng chung
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card elevation={0} sx={{ 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider', 
            bgcolor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'primary.main' }}>
                <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark', mr: 1 }}>
                  <GroupsIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Hành khách</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 1 }}>
                {totalMembers}
              </Typography>
              <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                {approvedMembers > 0 && (
                  <Chip label={`${approvedMembers} duyệt`} size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />
                )}
                {pendingMembers > 0 && (
                  <Chip label={`${pendingMembers} chờ`} size="small" color="warning" sx={{ height: 18, fontSize: '0.6rem' }} />
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6}>
          <Card elevation={0} sx={{ 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider', 
            bgcolor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: '#f59e0b' }}>
                <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: '#fef3c7', color: '#d97706', mr: 1 }}>
                  <DirectionsCarIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Phương tiện</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mt: 1 }}>
                {vehicles.length}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Tổng {totalCapacity} chỗ
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={0} sx={{ 
            borderRadius: 4, 
            border: '1px solid', 
            borderColor: 'divider',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Tình trạng xếp xe</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', bgcolor: 'primary.light', px: 1, py: 0.5, borderRadius: 2 }}>
                  {totalAssigned} / {totalCapacity} chỗ
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={occupancyRate > 100 ? 100 : occupancyRate} 
                sx={{ 
                  height: 10, 
                  borderRadius: 5, 
                  bgcolor: '#e2e8f0', 
                  '& .MuiLinearProgress-bar': { borderRadius: 5, bgcolor: occupancyRate >= 100 ? '#10b981' : 'primary.main' } 
                }} 
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Đã xếp {Math.round(occupancyRate)}%
                </Typography>
                <Typography variant="caption" sx={{ color: unassigned > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                  {unassigned > 0 ? `${unassigned} người chưa xếp` : '✓ Đã xếp xong!'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
