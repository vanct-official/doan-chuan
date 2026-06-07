const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'customer', 'TourDetailPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The new imports
const newImports = `  TableHead, TableRow, Paper, LinearProgress, Stack, IconButton,
  Divider, Tooltip, Tabs, Tab, Avatar, AvatarGroup, Checkbox, FormControlLabel, TableSortLabel,
  BottomNavigation, BottomNavigationAction, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';`;

content = content.replace(
  /  TableHead, TableRow, Paper, LinearProgress, Stack, IconButton,[\s\S]*?} from '@mui\/material';/,
  newImports
);

const newTabImports = `import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

import OverviewTab from './TourDetailTabs/OverviewTab';
import PeopleTab from './TourDetailTabs/PeopleTab';
import VehiclesTab from './TourDetailTabs/VehiclesTab';
import ScheduleTab from './TourDetailTabs/ScheduleTab';`;

content = content.replace(
  /import { DateTimePicker } from '@mui\/x-date-pickers\/DateTimePicker';[\s\S]*?import dayjs from 'dayjs';/,
  newTabImports
);

const newState = `  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leavingMember, setLeavingMember] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Mobile Bottom Navigation State
  const [bottomNavValue, setBottomNavValue] = useState(0); // 0: Overview, 1: People, 2: Vehicles, 3: Schedule`;

content = content.replace(
  /  const \[leaveDialogOpen, setLeaveDialogOpen\] = useState\(false\);[\s\S]*?const \[statusFilter, setStatusFilter\] = useState\(''\);/,
  newState
);

const boxIndex = content.indexOf('<Box sx={{ py: 3, px: { xs: 1, md: 3 } }}>');
if (boxIndex === -1) {
  console.log("Could not find main Box!");
  process.exit(1);
}

const mainReturnStart = content.lastIndexOf('  return (', boxIndex);
if (mainReturnStart === -1) {
  console.log("Could not find mainReturnStart!");
  process.exit(1);
}

const modalsStart = content.indexOf(`{/* MODAL 0A: EDIT/ADD ITINERARY */}`);

if (modalsStart === -1) {
  console.log("Could not find modalsStart!");
  process.exit(1);
}

// Rewind to capture spaces before the comment
let actualModalsStart = modalsStart;
while (content[actualModalsStart - 1] === ' ') {
  actualModalsStart--;
}
// Rewind over the ==== line
const preModalsStr = content.substring(actualModalsStart - 150, actualModalsStart);
const eqMatch = preModalsStr.lastIndexOf(`{/* ========================================================================= */}`);
if (eqMatch !== -1) {
    actualModalsStart = actualModalsStart - 150 + eqMatch;
    while (content[actualModalsStart - 1] === ' ') {
      actualModalsStart--;
    }
}


const beforeMainReturn = content.substring(0, mainReturnStart);
const afterModals = content.substring(actualModalsStart);

const newMainLayout = `  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      
      {/* 1. COMPACT HEADER */}
      <Box sx={{ 
        bgcolor: 'primary.main', color: 'white', pt: 2, pb: 2, px: 2, 
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 10
      }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={handleBack} sx={{ color: 'white', p: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, noWrap: true, lineHeight: 1.2 }}>
              {tour.name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center' }}>
              <EventIcon sx={{ fontSize: 14, mr: 0.5 }} />
              {new Date(tour.start_time).toLocaleDateString('vi-VN')} - {new Date(tour.end_time).toLocaleDateString('vi-VN')}
            </Typography>
          </Box>
          <Avatar sx={{ width: 32, height: 32, border: '2px solid white' }}>
            {tour.created_by?.name ? tour.created_by.name[0] : 'A'}
          </Avatar>
        </Stack>
      </Box>

      {/* 2. MAIN SCROLLABLE CONTENT (TABS) */}
      <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative', pb: 10 }}>
        {bottomNavValue === 0 && (
          <OverviewTab tour={tour} memberships={memberships} vehicles={vehicles} />
        )}
        
        {bottomNavValue === 1 && (
          <PeopleTab 
            memberships={memberships} 
            vehicles={vehicles} 
            groups={groups} 
            loading={loading}
            canEditItinerary={canEditItinerary}
            onEditPassenger={(member) => {
              setPassengerForm({
                user_id: member.user_id?._id || member.user_id || '',
                name: member.user_id?.name || member.name,
                phone: member.user_id?.phone || member.phone || '',
                birth_year: member.user_id?.birth_year || member.birth_year || '',
                gender: member.user_id?.gender !== undefined ? (member.user_id.gender ? 'male' : 'female') : (member.gender ? 'male' : 'female'),
                customer_type: member.customer_type,
                role: member.role,
                is_driver: member.is_driver,
                group_id: member.group_id?._id || member.group_id || 'none'
              });
              setGroupNameInput('');
              setNewGroupSelected(false);
              setSelectedPassenger(member);
              setEditPassengerOpen(true);
            }}
            onAssignVehicle={(member) => {
              setAssignSeatForm({
                membership_id: member._id,
                vehicle_id: member.vehicle_id?._id || member.vehicle_id || ''
              });
              setAssignSeatOpen(true);
            }}
          />
        )}

        {bottomNavValue === 2 && (
          <VehiclesTab 
            vehicles={vehicles}
            memberships={memberships}
            canEditItinerary={canEditItinerary}
            onVehicleClick={(vehicle) => handleOpenViewVehiclePassengers(vehicle)}
            onEditVehicle={(vehicle) => {
              setVehicleForm({
                license_plate: vehicle.license_plate,
                plate_color: vehicle.plate_color,
                seat_count: vehicle.seat_count,
                driver_name: vehicle.driver_name,
                driver_phone: vehicle.driver_phone
              });
              setSelectedVehicle(vehicle);
              setEditVehicleOpen(true);
            }}
          />
        )}

        {bottomNavValue === 3 && (
          <ScheduleTab 
            itineraries={itineraries}
            tourAttendances={tourAttendances}
            totalMembers={memberships.length}
            canEditItinerary={canEditItinerary}
            onItineraryClick={(itinerary) => handleOpenAttendance(itinerary)}
            onEditItinerary={(itinerary) => {
              setEditItineraryId(itinerary._id);
              setItineraryForm({
                date: new Date(itinerary.date),
                location: itinerary.location,
                activity: itinerary.activity
              });
              setItineraryModalOpen(true);
            }}
          />
        )}
      </Box>

      {/* 3. DYNAMIC FAB (FLOATING ACTION BUTTON) */}
      {canEditItinerary && (
        <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
          {bottomNavValue === 1 && (
            <SpeedDial
              ariaLabel="People Actions"
              icon={<SpeedDialIcon />}
              direction="up"
              FabProps={{ sx: { bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } } }}
            >
              <SpeedDialAction
                icon={<PersonAddIcon />}
                tooltipTitle="Thêm hành khách"
                onClick={handleOpenAddPassenger}
              />
              {isCreatorOrAdmin && (
                <SpeedDialAction
                  icon={<FormatListBulletedIcon />}
                  tooltipTitle="Import Excel"
                  onClick={() => setExcelModalOpen(true)}
                />
              )}
            </SpeedDial>
          )}

          {bottomNavValue === 2 && (
            <Fab color="primary" onClick={() => {
              setVehicleForm({ license_plate: '', plate_color: 'white', seat_count: '', driver_name: '', driver_phone: '' });
              setAddVehicleOpen(true);
            }}>
              <DirectionsCarIcon />
            </Fab>
          )}

          {bottomNavValue === 3 && (
            <Fab color="primary" onClick={() => {
              setEditItineraryId(null);
              setItineraryForm({ date: null, location: '', activity: '' });
              setItineraryModalOpen(true);
            }}>
              <AddCircleOutlineIcon />
            </Fab>
          )}
        </Box>
      )}

      {/* 4. BOTTOM NAVIGATION */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20 }} elevation={8}>
        <BottomNavigation
          showLabels
          value={bottomNavValue}
          onChange={(event, newValue) => {
            setBottomNavValue(newValue);
          }}
          sx={{ height: 65, '& .MuiBottomNavigationAction-label': { fontWeight: 600 } }}
        >
          <BottomNavigationAction label="Tổng quan" icon={<DashboardIcon />} />
          <BottomNavigationAction label="Hành khách" icon={<GroupsIcon />} />
          <BottomNavigationAction label="Xe" icon={<DirectionsBusIcon />} />
          <BottomNavigationAction label="Lịch trình" icon={<AccessTimeFilledIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Modals are rendered below inside the same root Box */}
`;

fs.writeFileSync(filePath, beforeMainReturn + newMainLayout + afterModals);
console.log("Successfully replaced layout.");
