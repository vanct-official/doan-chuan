import React from 'react';
import { 
  Box, Typography, Card, CardActionArea, IconButton, Chip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';

// This acts as a vertical timeline list
export default function ScheduleTab({ 
  itineraries, 
  onItineraryClick,
  onEditItinerary,
  canEditItinerary,
  tourAttendances,
  totalMembers
}) {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 2, pb: 10, height: '100%', overflowY: 'auto' }}>
      {itineraries.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Chưa có lịch trình nào.
        </Typography>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Timeline line */}
          <Box sx={{ 
            position: 'absolute', top: 20, bottom: 20, left: 24, 
            width: 2, bgcolor: 'divider', zIndex: 0 
          }} />

          {itineraries.map((itinerary, index) => {
            // Calculate attendance
            const attendanceForThis = tourAttendances.filter(a => 
              (a.itinerary_id?._id || a.itinerary_id) === itinerary._id && a.status === 'present'
            );
            const presentCount = attendanceForThis.length;

            return (
              <Box key={itinerary._id} sx={{ display: 'flex', mb: 3, position: 'relative', zIndex: 1 }}>
                {/* Timeline dot */}
                <Box sx={{ 
                  width: 50, display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', mr: 1, pt: 1 
                }}>
                  <Box sx={{ 
                    width: 16, height: 16, borderRadius: '50%', 
                    bgcolor: 'primary.main', border: '3px solid white', 
                    boxShadow: '0 0 0 1px #e2e8f0', zIndex: 2
                  }} />
                </Box>

                <Card elevation={0} sx={{ 
                  flex: 1, borderRadius: 3, 
                  border: '1px solid', borderColor: 'divider',
                  bgcolor: 'white'
                }}>
                  <CardActionArea onClick={() => onItineraryClick(itinerary)}>
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
                          {itinerary.activity}
                        </Typography>
                        {canEditItinerary && (
                          <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); onEditItinerary(itinerary); }}
                            sx={{ mt: -0.5, mr: -0.5, color: 'text.secondary' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, mr: 1 }} />
                        <Typography variant="body2">
                          {new Date(itinerary.date).toLocaleString('vi-VN', { 
                            hour: '2-digit', minute: '2-digit',
                            day: '2-digit', month: '2-digit'
                          })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', color: 'text.secondary', mb: 1.5 }}>
                        <LocationOnIcon sx={{ fontSize: 16, mr: 1, mt: 0.2 }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {itinerary.location}
                        </Typography>
                      </Box>

                      {/* Mini attendance indicator */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          icon={<CheckCircleIcon style={{ fontSize: 14 }} />} 
                          label={`Đã điểm danh: ${presentCount}/${totalMembers}`} 
                          size="small" 
                          color={presentCount === totalMembers && totalMembers > 0 ? "success" : "default"}
                          sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </Box>
                    </Box>
                  </CardActionArea>
                </Card>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
