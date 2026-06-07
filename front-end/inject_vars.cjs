const fs = require('fs');
let c = fs.readFileSync('src/pages/customer/TourDetailPage.jsx', 'utf8');

const importTabs = `
import OverviewTab from './TourDetailTabs/OverviewTab';
import PeopleTab from './TourDetailTabs/PeopleTab';
import VehiclesTab from './TourDetailTabs/VehiclesTab';
import ScheduleTab from './TourDetailTabs/ScheduleTab';
`;

if (!c.includes('import OverviewTab')) {
  c = c.replace(/import \{.*?\} from '@mui\/material';/, m => m + importTabs);
}

const missingVars = `
  const isCreatorOrAdmin = isLeaderOrCreator || isAdminPath;
  const canEditItinerary = isLeaderOrCreator || isAdminPath;

  const handleOpenAttendance = (itinerary) => {
    setSelectedItinerary(itinerary);
    setAttendanceModalOpen(true);
  };

  const handleToggleAttendance = async (attendanceId, newStatus) => {
    try {
      await api.put(\`/attendances/tour/\${tour._id}/\${attendanceId}\`, { status: newStatus });
      fetchTourData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAttendance = async (attendanceDataList) => {
    try {
      setLoading(true);
      await api.put(\`/attendances/tour/\${tour._id}/batch\`, { attendances: attendanceDataList });
      setActionSuccess('Lưu điểm danh thành công!');
      fetchTourData();
    } catch (err) {
      console.error(err);
      setActionError('Lỗi khi lưu điểm danh.');
    } finally {
      setLoading(false);
      setAttendanceModalOpen(false);
    }
  };

  const handleSaveItinerary = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (itineraryForm._id) {
        await api.put(\`/tours/\${id}/itinerary/\${itineraryForm._id}\`, itineraryForm);
        setActionSuccess(t('msg_itinerary_updated'));
      } else {
        await api.post(\`/tours/\${id}/itinerary\`, itineraryForm);
        setActionSuccess(t('msg_itinerary_added'));
      }
      setItineraryModalOpen(false);
      fetchTourData();
    } catch (error) {
      console.error(error);
      setActionError(error.response?.data?.message || t('msg_error_occurred'));
    } finally {
      setActionLoading(false);
    }
  };
`;

if (!c.includes('const isCreatorOrAdmin =')) {
  const returnPattern = "  return (\r\n    <Box sx={{ height: '100vh'";
  const returnPatternUnix = "  return (\n    <Box sx={{ height: '100vh'";
  let idx = c.indexOf(returnPattern);
  if (idx === -1) idx = c.indexOf(returnPatternUnix);
  
  if (idx !== -1) {
    c = c.substring(0, idx) + missingVars + '\n' + c.substring(idx);
    console.log("Injected vars");
  } else {
    console.log('Could not find return index for vars injection!');
  }
}

fs.writeFileSync('src/pages/customer/TourDetailPage.jsx', c);
console.log("Done");
