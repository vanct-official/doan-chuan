const fs = require('fs');
const filePath = 'f:/NodeJS/doan-chuan/front-end/src/pages/customer/TourDetailPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
const importTabs = \
import OverviewTab from './TourDetailTabs/OverviewTab';
import PeopleTab from './TourDetailTabs/PeopleTab';
import VehiclesTab from './TourDetailTabs/VehiclesTab';
import ScheduleTab from './TourDetailTabs/ScheduleTab';
\;
if (!content.includes('import OverviewTab')) {
    content = content.replace(/import \{.*?\} from '@mui\/material';/, (match) => match + '\n' + importTabs);
}

// 2. Add missing variables before return (
const missingVars = \
  const unassignedMembers = memberships.filter(m => !m.vehicle_id && m.status !== 'left');
  const isCreatorOrAdmin = isLeaderOrCreator || isAdminPath;
  const canEditItinerary = isLeaderOrCreator || isAdminPath;

  const handleOpenAttendance = (itinerary) => {
    setSelectedItinerary(itinerary);
    setOpenAttendance(true);
  };

  const handleToggleAttendance = async (attendanceId, newStatus) => {
    try {
      await api.put(\\\/attendances/tour/\\\/\\\\\\, { status: newStatus });
      fetchTourData(); // Reload data
    } catch (err) {
      console.error('L?i khi di?m danh:', err);
    }
  };

  const handleSaveAttendance = async (attendanceDataList) => {
    try {
      setLoading(true);
      await api.put(\\\/attendances/tour/\\\/batch\\\, { attendances: attendanceDataList });
      toast.success('Luu di?m danh thành công!');
      fetchTourData();
    } catch (err) {
      console.error(err);
      toast.error('L?i khi luu di?m danh.');
    } finally {
      setLoading(false);
      setOpenAttendance(false);
    }
  };

  const handleSaveItinerary = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (itineraryForm._id) {
        await api.put(\\\/tours/\\\/itinerary/\\\\\\, itineraryForm);
        toast.success(t('msg_itinerary_updated'));
      } else {
        await api.post(\\\/tours/\\\/itinerary\\\, itineraryForm);
        toast.success(t('msg_itinerary_added'));
      }
      setOpenItineraryModal(false);
      fetchTourData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || t('msg_error_occurred'));
    } finally {
      setActionLoading(false);
    }
  };
\;

if (!content.includes('const unassignedMembers =')) {
    const returnIndex = content.indexOf('  return (\\n    <Box sx={{ height: \\'100vh\\'');
    if (returnIndex !== -1) {
        content = content.substring(0, returnIndex) + missingVars + '\\n' + content.substring(returnIndex);
    } else {
        console.error('Could not find return (');
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed TourDetailPage.jsx');

