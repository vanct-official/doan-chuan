import React from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardActionArea, 
  LinearProgress, IconButton, Chip, TextField, InputAdornment, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

export default function VehiclesTab({ 
  vehicles, 
  memberships, 
  onVehicleClick,
  onEditVehicle,
  onDeleteVehicle,
  canEditItinerary 
}) {
  const { t } = useTranslation();

  const [search, setSearch] = React.useState('');
  const [filterMode, setFilterMode] = React.useState('all'); // 'all', 'available', 'full'

  const vehiclesWithStats = vehicles.map(vehicle => {
    const assignedMembers = memberships.filter(m => 
      (m.vehicle_id?._id || m.vehicle_id) === vehicle._id
    );
    const occupancy = assignedMembers.length;
    const capacity = vehicle.seat_count || 1;
    const isFull = occupancy >= capacity;
    return { ...vehicle, occupancy, capacity, isFull };
  });

  const filteredVehicles = vehiclesWithStats.filter(v => {
    const matchesSearch = (v.license_plate || '').toLowerCase().includes(search.toLowerCase()) || 
                          (v.driver_name || '').toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filterMode === 'available') matchesFilter = !v.isFull;
    else if (filterMode === 'full') matchesFilter = v.isFull;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Box sx={{ pb: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, position: 'sticky', top: 0, bgcolor: 'background.default', zIndex: 10 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm biển số hoặc tài xế..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3, bgcolor: 'white' }
          }}
          sx={{ mb: 1.5 }}
        />
        
        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
          <Chip 
            label="Tất cả" 
            onClick={() => setFilterMode('all')}
            color={filterMode === 'all' ? 'primary' : 'default'}
            variant={filterMode === 'all' ? 'filled' : 'outlined'}
            sx={{ fontWeight: filterMode === 'all' ? 600 : 400 }}
          />
          <Chip 
            label="Còn chỗ" 
            onClick={() => setFilterMode('available')}
            color={filterMode === 'available' ? 'success' : 'default'}
            variant={filterMode === 'available' ? 'filled' : 'outlined'}
            sx={{ fontWeight: filterMode === 'available' ? 600 : 400 }}
          />
          <Chip 
            label="Đã đầy" 
            onClick={() => setFilterMode('full')}
            color={filterMode === 'full' ? 'error' : 'default'}
            variant={filterMode === 'full' ? 'filled' : 'outlined'}
            sx={{ fontWeight: filterMode === 'full' ? 600 : 400 }}
          />
        </Box>
      </Box>

      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
      {filteredVehicles.length === 0 ? (
        <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
          Không tìm thấy phương tiện nào.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredVehicles.map(vehicle => {
            const { occupancy, capacity, isFull } = vehicle;
            const rate = (occupancy / capacity) * 100;

            return (
              <Grid item xs={12} sm={6} key={vehicle._id}>
                <Card elevation={0} sx={{ 
                  borderRadius: 3, 
                  border: '1px solid', 
                  borderColor: isFull ? 'success.light' : 'divider',
                  bgcolor: 'white',
                  overflow: 'hidden'
                }}>
                  <CardActionArea onClick={() => onVehicleClick(vehicle)}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <Box sx={{ 
                            p: 1, borderRadius: 2, 
                            bgcolor: 'primary.light', color: 'primary.dark', mr: 2,
                            flexShrink: 0,
                          }}>
                            <DirectionsCarIcon />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                              {vehicle.license_plate}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              Tài xế: {vehicle.driver_name || 'Chưa cập nhật'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {canEditItinerary && (
                          <Stack direction="row" spacing={0} onClick={(e) => e.stopPropagation()}>
                            <IconButton 
                              size="small" 
                              onClick={(e) => { e.stopPropagation(); onEditVehicle(vehicle); }}
                              sx={{ color: 'text.secondary' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {onDeleteVehicle && (
                              <IconButton 
                                size="small" 
                                onClick={(e) => { e.stopPropagation(); onDeleteVehicle(vehicle._id); }}
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                          Chỗ ngồi
                        </Typography>
                        <Chip 
                          label={`${occupancy} / ${capacity}`} 
                          size="small" 
                          color={isFull ? "success" : "default"}
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={rate > 100 ? 100 : rate} 
                        color={isFull ? "success" : "primary"}
                        sx={{ height: 6, borderRadius: 3 }} 
                      />
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      </Box>
    </Box>
  );
}
