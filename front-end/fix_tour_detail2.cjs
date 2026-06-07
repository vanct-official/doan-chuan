const fs = require('fs');
const filePath = 'f:/NodeJS/doan-chuan/front-end/src/pages/customer/TourDetailPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
const importTabs = `
import OverviewTab from './TourDetailTabs/OverviewTab';
import PeopleTab from './TourDetailTabs/PeopleTab';
import VehiclesTab from './TourDetailTabs/VehiclesTab';
import ScheduleTab from './TourDetailTabs/ScheduleTab';
`;
if (!content.includes('import OverviewTab')) {
    content = content.replace(/import \{.*?\} from '@mui\/material';/, (match) => match + '\n' + importTabs);
}

// 2. Add missing variables before return (
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
      fetchTourData(); // Reload data
    } catch (err) {
      console.error('Lỗi khi điểm danh:', err);
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

if (!content.includes('const isCreatorOrAdmin =')) {
    const returnIndex = content.indexOf('  return (\n    <Box sx={{ py: 3');
    if (returnIndex !== -1) {
        content = content.substring(0, returnIndex) + missingVars + '\n' + content.substring(returnIndex);
    } else {
        console.error('Could not find return (');
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed TourDetailPage.jsx');
