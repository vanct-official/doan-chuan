import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OverviewTab from './TourDetailTabs/OverviewTab';
import { ContactFloatButton } from '../../components/ContactFloatButton';
import PeopleTab from './TourDetailTabs/PeopleTab';
import VehiclesTab from './TourDetailTabs/VehiclesTab';
import ScheduleTab from './TourDetailTabs/ScheduleTab';
import {
  Typography, Box, Card, CardContent, Grid, Chip, Button,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, LinearProgress, Stack, IconButton,
  Divider, Tooltip, Tabs, Tab, Avatar, AvatarGroup, Checkbox, FormControlLabel, TableSortLabel,
  BottomNavigation, BottomNavigationAction, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  accentGradient, attendanceAvatarBorder, attendanceMemberSx, groupHeaderColors,
} from './tourDetailTheme';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupsIcon from '@mui/icons-material/Groups';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MapIcon from '@mui/icons-material/Map';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslate } from '../../hooks/useTranslate';
import { tourService } from '../../services/tourService';
import { vehicleService } from '../../services/vehicleService';
import { membershipService } from '../../services/membershipService';
import { groupService } from '../../services/groupService';
import { authService } from '../../services/authService';
import { offlineApi } from '../../services/offlineApi';
import ExcelImportModal from '../../components/ExcelImportModal';
import { formatForDateTimeLocal, parseDateTimeLocalToISO } from '../../utils/dateUtils';
import * as xlsx from 'xlsx';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Helper function to generate avatar color and initials from name
function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name) {
  if (!name) return { sx: { bgcolor: '#bdbdbd' }, children: '?' };
  const parts = name.trim().split(' ');
  let initials = name[0].toUpperCase();
  if (parts.length > 1) {
    initials = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials,
  };
}

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslate(['common', 'tour']);
  const localeCode = currentLanguage === 'vi' ? 'vi-VN' : currentLanguage === 'ja' ? 'ja-JP' : 'en-US';
  const theme = useTheme();

  const [tour, setTour] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineData, setIsOfflineData] = useState(false);

  // Modals state
  const [editTourOpen, setEditTourOpen] = useState(false);
  const [addPassengerOpen, setAddPassengerOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [editPassengerOpen, setEditPassengerOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editVehicleOpen, setEditVehicleOpen] = useState(false);
  const [assignSeatOpen, setAssignSeatOpen] = useState(false);
  const [viewVehiclePassengersOpen, setViewVehiclePassengersOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leavingMember, setLeavingMember] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Mobile Bottom Navigation State
  const [bottomNavValue, setBottomNavValue] = useState(0); // 0: Overview, 1: People, 2: Vehicles, 3: Schedule

  // Form states
  const [tourForm, setTourForm] = useState({ name: '', start_time: '', end_time: '', max_capacity: '' });

  // Passenger Form State
  const [passengerForm, setPassengerForm] = useState({
    user_id: '',
    name: '',
    phone: '',
    birth_year: '',
    gender: 'male',
    customer_type: 'adult',
    role: 'member',
    status: 'pending',
    is_driver: false,
    group_id: 'none'
  });
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [newGroupSelected, setNewGroupSelected] = useState(false);

  // Batch Passenger Form State
  const [addPassengerMode, setAddPassengerMode] = useState('single'); // 'single' or 'batch'
  const [batchMembers, setBatchMembers] = useState([
    { user_id: '', name: '', phone: '', birth_year: '', gender: 'male', customer_type: 'adult', role: 'member', is_driver: false }
  ]);

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({ license_plate: '', plate_color: 'white', seat_count: '', driver_name: '', driver_phone: '' });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeVehicleForPassengers, setActiveVehicleForPassengers] = useState(null);
  const [assignSeatForm, setAssignSeatForm] = useState({ membership_id: '', vehicle_id: '' });

  // State for adding passengers directly to active vehicle inside modal
  const [showAddPassengerPanel, setShowAddPassengerPanel] = useState(false);
  const [selectedUnassignedIds, setSelectedUnassignedIds] = useState([]);
  const [selectedGroupIdFilter, setSelectedGroupIdFilter] = useState('none');

  // Submitting states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Itinerary & Attendance States
  const [activeTab, setActiveTab] = useState(0); // 0: Members&Vehicles, 1: Itinerary
  const [itineraries, setItineraries] = useState([]);
  const [itineraryForm, setItineraryForm] = useState({ date: '', location: '', activity: '' });
  const [editItineraryId, setEditItineraryId] = useState(null);
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]); // Array of { membership_id, status }
  const [tourAttendances, setTourAttendances] = useState([]); // Array of all attendances in tour

  // Get current user
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentUserId = user ? (user.id || user._id) : null;
  const currentUserPhone = user?.phone || '';

  const fetchTourData = async () => {
    try {
      const { data: response, fromCache } = await offlineApi.getTourById(id, statusFilter);
      setIsOfflineData(fromCache);
      if (!response) {
        setError(t('tour.messages.loadError'));
        return;
      }
      if (response.success) {
        setTour(response.tour);

        const sortedMemberships = (response.memberships || []).sort((a, b) => {
          const groupA = (a.group_id?._id || a.group_id || '').toString();
          const groupB = (b.group_id?._id || b.group_id || '').toString();

          if (groupA !== groupB) {
            if (!groupA) return 1;
            if (!groupB) return -1;
            return groupA.localeCompare(groupB);
          }

          const getYear = (m) => {
            if (!m.user_id && m.guest_info?.birth_year) return Number(m.guest_info.birth_year);
            if (m.user_id?.dob) return new Date(m.user_id.dob).getFullYear();
            return 9999;
          };

          return getYear(a) - getYear(b);
        });

        setMemberships(sortedMemberships);
        setVehicles(response.vehicles || []);
        setError(null);
      } else {
        setError(t('tour_not_found') || t('tour.messages.loadError'));
      }

      // Fetch groups associated with this tour
      const groupRes = await groupService.getGroupsByTour(id);
      if (groupRes.success) {
        setGroups(groupRes.groups || []);
      }

      // Fetch itineraries & attendances (có cache offline)
      try {
        const { data: itinRes } = await offlineApi.getItinerariesByTour(id);
        setItineraries(itinRes || []);

        const { data: attRes } = await offlineApi.getAttendanceByTour(id);
        setTourAttendances(attRes || []);
      } catch (e) {
        console.error('Failed to fetch itineraries', e);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || t('tour.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userStr) {
      navigate('/login');
      return;
    }
    fetchTourData();
  }, [id, statusFilter, navigate, userStr]);

  const handleBack = () => {
    if (window.location.pathname.includes('/admin')) {
      navigate('/admin/tours');
    } else {
      navigate('/tours');
    }
  };

  const isAdminPath = window.location.pathname.includes('/admin');

  // Check if current user is Creator or Leader
  const createdByVal = tour?.created_by?._id || tour?.created_by;
  const leaderIdVal = tour?.leader_id?._id || tour?.leader_id;
  const isLeaderOrCreator = !isAdminPath && currentUserId && (createdByVal === currentUserId || leaderIdVal === currentUserId);

  const canLeave = (member) => {
    if (isAdminPath) return false;
    if (!user || member.status === 'left') return false;
    const memberUserId = member.user_id?._id || member.user_id;
    if (memberUserId !== currentUserId) return false;
    if (member.group_id) return member.role === 'group_rep';
    return true;
  };

  const showActionColumn = isLeaderOrCreator || memberships.some(canLeave);

  // 1. EDIT TOUR HANDLERS
  const handleOpenEditTour = () => {
    if (!tour) return;

    setTourForm({
      name: tour.name || '',
      start_time: formatForDateTimeLocal(tour.start_time),
      end_time: formatForDateTimeLocal(tour.end_time),
      max_capacity: tour.max_capacity || ''
    });
    setActionError('');
    setActionSuccess('');
    setEditTourOpen(true);
  };

  const handleEditTourSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const response = await tourService.updateTour(id, {
        name: tourForm.name,
        start_time: parseDateTimeLocalToISO(tourForm.start_time),
        end_time: parseDateTimeLocalToISO(tourForm.end_time),
        max_capacity: Number(tourForm.max_capacity)
      });
      if (response.success) {
        setActionSuccess(t('msg_update_success'));
        fetchTourData();
        setTimeout(() => setEditTourOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  // 1B. EXPORT EXCEL HANDLER
  const handleExportExcel = () => {
    if (!memberships || memberships.length === 0) {
      alert(t('tour_no_passengers_found') || 'Không có hành khách nào để xuất!');
      return;
    }

    try {
      const dataToExport = memberships.map((member) => {
        const name = member.user_id?.name || member.guest_info?.name || '';
        const phone = member.user_id?.phone || member.guest_info?.phone || member.phone || '';
        
        let birthYear = '';
        if (member.user_id?.dob) {
          birthYear = new Date(member.user_id.dob).getFullYear();
        } else if (member.guest_info?.birth_year) {
          birthYear = Number(member.guest_info.birth_year);
        } else if (member.birth_year) {
          birthYear = Number(member.birth_year);
        }

        let gender = '';
        let genderRaw = null;
        if (member.user_id) {
          genderRaw = member.user_id.gender === true ? 'male' : member.user_id.gender === false ? 'female' : null;
        } else {
          genderRaw = member.guest_info?.gender || member.gender || null;
        }
        
        if (genderRaw === 'male' || genderRaw === 'Nam') {
          gender = 'Nam';
        } else if (genderRaw === 'female' || genderRaw === 'Nữ') {
          gender = 'Nữ';
        }

        let role = 'Thành viên';
        if (member.role === 'leader') role = 'Trưởng đoàn';
        else if (member.role === 'group_rep') role = 'Đại diện nhóm';
        else if (member.role === 'vehicle_rep') role = 'Đại diện xe';
        else if (member.role === 'driver') role = 'Tài xế';

        let customerType = 'Người lớn';
        if (member.customer_type === 'child') customerType = 'Trẻ em';
        else if (member.customer_type === 'elderly') customerType = 'Người cao tuổi';

        const groupName = member.group_id?.name || '';

        const vehicleId = member.vehicle_id?._id || member.vehicle_id;
        const vehicle = vehicles.find(v => v._id === vehicleId);
        const vehiclePlate = vehicle ? vehicle.license_plate : '';

        let status = 'Chờ duyệt';
        if (member.status === 'approved') status = 'Đã duyệt';
        else if (member.status === 'rejected') status = 'Từ chối';
        else if (member.status === 'removed') status = 'Đã xóa';
        else if (member.status === 'left') status = 'Đã rời';

        const note = member.note || '';

        return {
          'Họ và tên (bắt buộc)': name,
          'Số điện thoại': phone,
          'Năm sinh': birthYear,
          'Giới tính': gender,
          'Vai trò': role,
          'Loại khách': customerType,
          'Tên nhóm': groupName,
          'Phương tiện (Biển số)': vehiclePlate,
          'Trạng thái': status,
          'Ghi chú': note
        };
      });

      const worksheet = xlsx.utils.json_to_sheet(dataToExport);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Danh sách hành khách');

      const tourNameSafe = (tour.name || 'Tour').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const filename = `DanhSachHanhKhach_${tourNameSafe}.xlsx`;

      xlsx.writeFile(workbook, filename);
    } catch (err) {
      console.error('Lỗi khi xuất file Excel:', err);
      alert('Đã xảy ra lỗi khi xuất file Excel: ' + err.message);
    }
  };

  // 2. ADD PASSENGER HANDLERS
  const handleOpenAddPassenger = () => {
    setPassengerForm({
      user_id: '',
      name: '',
      phone: '',
      birth_year: '',
      gender: 'male',
      customer_type: 'adult',
      role: 'member',
      is_driver: false,
      group_id: 'none'
    });
    setBatchMembers([
      { user_id: '', name: '', phone: '', birth_year: '', gender: 'male', customer_type: 'adult', role: 'member', is_driver: false }
    ]);
    setAddPassengerMode('single');
    setGroupNameInput('');
    setNewGroupSelected(false);
    setActionError('');
    setActionSuccess('');
    setAddPassengerOpen(true);
  };

  const handlePassengerPhoneChange = async (e) => {
    const val = e.target.value;
    setPassengerForm(prev => ({ ...prev, phone: val }));
    setActionSuccess('');
    setActionError('');

    // Query DB if number has 10 digits (Standard Vietnam Phone Number)
    if (val.trim().length === 10) {
      try {
        const response = await authService.checkPhone(val.trim());
        if (response.success && response.user) {
          const u = response.user;
          const birthYearVal = u.dob ? new Date(u.dob).getFullYear() : '';
          const genderVal = u.gender === true ? 'male' : u.gender === false ? 'female' : 'male';

          setPassengerForm(prev => ({
            ...prev,
            user_id: u._id,
            name: u.name || '',
            birth_year: birthYearVal,
            gender: genderVal
          }));
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setPassengerForm(prev => ({
            ...prev,
            user_id: ''
          }));
        } else {
          console.error('Lỗi khi kiểm tra SĐT người dùng:', err);
        }
      }
    } else {
      if (passengerForm.user_id) {
        setPassengerForm(prev => ({
          ...prev,
          user_id: '',
          name: '',
          birth_year: '',
          gender: 'male'
        }));
      }
    }
  };

  const handlePassengerPhoneChangeBatch = async (index, val) => {
    const updated = [...batchMembers];
    updated[index].phone = val;
    setBatchMembers(updated);

    if (val.trim().length === 10) {
      try {
        const response = await authService.checkPhone(val.trim());
        if (response.success && response.user) {
          const u = response.user;
          const birthYearVal = u.dob ? new Date(u.dob).getFullYear() : '';
          const genderVal = u.gender === true ? 'male' : u.gender === false ? 'female' : 'male';

          const updatedWithUser = [...batchMembers];
          updatedWithUser[index] = {
            ...updatedWithUser[index],
            user_id: u._id,
            name: u.name || '',
            birth_year: birthYearVal,
            gender: genderVal
          };
          setBatchMembers(updatedWithUser);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          const updatedWithReset = [...batchMembers];
          updatedWithReset[index].user_id = '';
          setBatchMembers(updatedWithReset);
        }
      }
    } else {
      if (updated[index].user_id) {
        const updatedWithReset = [...batchMembers];
        updatedWithReset[index] = {
          ...updatedWithReset[index],
          user_id: '',
          name: '',
          birth_year: '',
          gender: 'male'
        };
        setBatchMembers(updatedWithReset);
      }
    }
  };

  const handleAddPassengerSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      if (addPassengerMode === 'single') {
        if (!passengerForm.name.trim()) throw new Error(t('err_passenger_name_required'));
        if (!passengerForm.birth_year) throw new Error(t('err_birth_year_required'));

        const payload = {
          tour_id: id,
          role: newGroupSelected ? 'group_rep' : passengerForm.role,
          is_driver: passengerForm.is_driver,
          group_id: passengerForm.group_id === 'none' || newGroupSelected ? null : passengerForm.group_id
        };

        if (passengerForm.user_id) {
          payload.user_id = passengerForm.user_id;
        } else {
          payload.guest_info = {
            name: passengerForm.name.trim(),
            phone: passengerForm.phone ? passengerForm.phone.trim() : '',
            birth_year: Number(passengerForm.birth_year),
            gender: passengerForm.gender
          };
        }
        payload.customer_type = passengerForm.customer_type;

        const response = await membershipService.addMember(payload);
        if (response.membership) {
          if (newGroupSelected && groupNameInput.trim()) {
            await groupService.createGroup({
              tour_id: id,
              name: groupNameInput.trim(),
              representative_id: response.membership._id
            });
          }

          setActionSuccess(t('msg_add_success'));
          fetchTourData();
          setTimeout(() => setAddPassengerOpen(false), 1200);
        }
      } else {
        // Batch passenger insertion
        if (newGroupSelected && !groupNameInput.trim()) {
          throw new Error(t('err_group_name_required'));
        }

        // Validate all batch members have complete names and birth years
        batchMembers.forEach((member, i) => {
          if (!member.name.trim()) throw new Error(t('err_passenger_name_at_row', { row: i + 1 }));
          if (!member.birth_year) throw new Error(t('err_birth_year_at_row', { row: i + 1 }));
        });

        const batchPayload = {
          tour_id: id,
          members: batchMembers,
          group_name: newGroupSelected ? groupNameInput.trim() : undefined
        };

        const response = await membershipService.addMembersBatch(batchPayload);
        if (response.success) {
          setActionSuccess(t('msg_batch_add_passenger_success'));
          fetchTourData();
          setTimeout(() => setAddPassengerOpen(false), 1200);
        }
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBatchRow = () => {
    setBatchMembers([
      ...batchMembers,
      { user_id: '', name: '', phone: '', birth_year: '', gender: 'male', customer_type: 'adult', role: 'member', is_driver: false }
    ]);
  };

  const handleRemoveBatchRow = (index) => {
    if (batchMembers.length === 1) return;
    setBatchMembers(batchMembers.filter((_, i) => i !== index));
  };

  // 3. EDIT PASSENGER HANDLERS
  const handleOpenEditPassenger = (member) => {
    setSelectedPassenger(member);
    const isGuest = !member.user_id;
    const nameVal = isGuest ? member.guest_info?.name : member.user_id?.name;
    const phoneVal = isGuest ? member.guest_info?.phone : member.user_id?.phone;
    const birthYearVal = isGuest ? member.guest_info?.birth_year : (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : '');
    const genderVal = isGuest ? member.guest_info?.gender : (member.user_id?.gender === true ? 'male' : 'female');

    setPassengerForm({
      user_id: member.user_id?._id || member.user_id || '',
      name: nameVal || '',
      phone: phoneVal || '',
      birth_year: birthYearVal || '',
      gender: genderVal || 'male',
      customer_type: member.customer_type || 'adult',
      role: member.role || 'member',
      status: member.status || 'pending',
      is_driver: member.is_driver || false,
      group_id: member.group_id?._id || member.group_id || 'none'
    });
    setGroupNameInput('');
    setNewGroupSelected(false);
    setActionError('');
    setActionSuccess('');
    setEditPassengerOpen(true);
  };

  const handleEditPassengerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPassenger) return;
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const isGuest = !passengerForm.user_id;
      const payload = {
        role: newGroupSelected ? 'group_rep' : passengerForm.role,
        is_driver: passengerForm.is_driver,
        customer_type: passengerForm.customer_type,
        status: passengerForm.status,
        group_id: passengerForm.group_id === 'none' || newGroupSelected ? null : passengerForm.group_id
      };

      if (isGuest) {
        payload.guest_info = {
          name: passengerForm.name.trim(),
          phone: passengerForm.phone.trim(),
          birth_year: passengerForm.birth_year ? Number(passengerForm.birth_year) : undefined,
          gender: passengerForm.gender
        };
      }

      if (newGroupSelected && groupNameInput.trim()) {
        const newGroupRes = await groupService.createGroup({
          tour_id: id,
          name: groupNameInput.trim(),
          representative_id: selectedPassenger._id
        });
        if (newGroupRes.success && newGroupRes.group) {
          payload.group_id = newGroupRes.group._id;
        }
      }

      const response = await membershipService.updateMember(selectedPassenger._id, payload);
      if (response.success) {
        setActionSuccess(t('msg_update_passenger_success'));
        fetchTourData();
        setTimeout(() => setEditPassengerOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenLeaveDialog = (member) => {
    setLeavingMember(member);
    setLeaveReason('');
    setLeaveDialogOpen(true);
  };

  const handleLeaveTour = async () => {
    if (!leavingMember) return;
    if (!leaveReason.trim()) {
      setActionError(t('err_leave_reason_required'));
      return;
    }
    setActionLoading(true);
    setActionError('');
    try {
      const res = await membershipService.leaveTour(leavingMember._id, leaveReason);
      if (res.success) {
        setLeaveDialogOpen(false);
        fetchTourData();
      } else {
        setActionError(res.error || t('common.messages.error'));
      }
    } catch (err) {
      setActionError(err.response?.data?.error || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  // 4. DELETE PASSENGER HANDLER
  const handleDeletePassenger = async (memberId) => {
    if (!window.confirm(t('confirm_delete_passenger'))) {
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      await membershipService.deleteMember(memberId);
      setActionSuccess(t('msg_delete_passenger_success'));
      fetchTourData();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  // 5. ADD VEHICLE HANDLERS
  const handleOpenAddVehicle = () => {
    setVehicleForm({
      license_plate: '',
      plate_color: 'white',
      seat_count: '',
      driver_name: '',
      driver_phone: ''
    });
    setActionError('');
    setActionSuccess('');
    setAddVehicleOpen(true);
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      if (!vehicleForm.license_plate.trim()) throw new Error(t('err_license_plate_required'));
      if (!vehicleForm.seat_count || Number(vehicleForm.seat_count) <= 0) throw new Error(t('err_seats_must_be_positive'));

      const response = await vehicleService.createVehicle({
        tour_id: id,
        license_plate: vehicleForm.license_plate.trim().toUpperCase(),
        plate_color: vehicleForm.plate_color,
        seat_count: Number(vehicleForm.seat_count),
        driver_name: vehicleForm.driver_name.trim(),
        driver_phone: vehicleForm.driver_phone.trim()
      });

      if (response.vehicle) {
        setActionSuccess(t('msg_add_success'));
        fetchTourData();
        setTimeout(() => setAddVehicleOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  // 6. EDIT VEHICLE HANDLERS
  const handleOpenEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      license_plate: vehicle.license_plate || '',
      plate_color: vehicle.plate_color || 'white',
      seat_count: vehicle.seat_count || '',
      driver_name: vehicle.driver_name || '',
      driver_phone: vehicle.driver_phone || ''
    });
    setActionError('');
    setActionSuccess('');
    setEditVehicleOpen(true);
  };

  const handleEditVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      if (!vehicleForm.license_plate.trim()) throw new Error(t('err_license_plate_required'));
      if (!vehicleForm.seat_count || Number(vehicleForm.seat_count) <= 0) throw new Error(t('err_seats_must_be_positive'));

      const response = await vehicleService.updateVehicle(selectedVehicle._id, {
        license_plate: vehicleForm.license_plate.trim().toUpperCase(),
        plate_color: vehicleForm.plate_color,
        seat_count: Number(vehicleForm.seat_count),
        driver_name: vehicleForm.driver_name.trim(),
        driver_phone: vehicleForm.driver_phone.trim()
      });

      if (response.vehicle) {
        setActionSuccess(t('msg_update_vehicle_success'));
        fetchTourData();
        setTimeout(() => setEditVehicleOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  // 7. DELETE VEHICLE HANDLER
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm(t('confirm_delete_vehicle'))) {
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      await vehicleService.deleteVehicle(vehicleId);
      setActionSuccess(t('msg_delete_vehicle_success'));
      fetchTourData();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  // 8. VIEW VEHICLE PASSENGERS HANDLERS
  const handleOpenViewVehiclePassengers = (vehicle) => {
    setActiveVehicleForPassengers(vehicle);
    setActionError('');
    setActionSuccess('');
    setViewVehiclePassengersOpen(true);
    // Reset add passenger panel states
    setShowAddPassengerPanel(false);
    setSelectedUnassignedIds([]);
    setSelectedGroupIdFilter('none');
  };

  const handleCheckboxToggle = (memberId) => {
    setSelectedUnassignedIds(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleGroupFilterChange = (groupId) => {
    setSelectedGroupIdFilter(groupId);
    if (groupId === 'none') {
      setSelectedUnassignedIds([]);
      return;
    }

    // Find all unassigned memberships that belong to this group
    const groupMemberIds = memberships
      .filter(m => !m.vehicle_id && (m.group_id?._id === groupId || m.group_id === groupId))
      .map(m => m._id);

    setSelectedUnassignedIds(groupMemberIds);
  };

  const handleAssignSeatsBatchSubmit = async (e) => {
    e.preventDefault();
    if (!activeVehicleForPassengers) return;
    if (selectedUnassignedIds.length === 0) {
      setActionError(t('err_select_passenger_to_assign'));
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const response = await vehicleService.assignSeatsBatch(
        selectedUnassignedIds,
        activeVehicleForPassengers._id
      );
      if (response.success) {
        setActionSuccess(t('msg_batch_assign_seat_success'));
        fetchTourData();
        setTimeout(() => {
          setShowAddPassengerPanel(false);
          setSelectedUnassignedIds([]);
        }, 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMemberFromVehicle = async (memberId) => {
    if (!window.confirm(t('confirm_unassign_seat'))) {
      return;
    }
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const response = await membershipService.updateMember(memberId, { vehicle_id: null });
      if (response.success) {
        setActionSuccess(t('msg_unassign_seat_success'));
        fetchTourData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignVehicleLeader = async (vehicleId, memberId) => {
    if (!window.confirm(t('confirm_assign_vehicle_rep'))) return;
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const response = await vehicleService.updateVehicle(vehicleId, { representative_id: memberId });
      if (response.success) {
        setActionSuccess(t('msg_assign_vehicle_rep_success'));
        fetchTourData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  // 9. ASSIGN SEAT HANDLERS
  const handleOpenAssignSeat = () => {
    setAssignSeatForm({
      membership_id: '',
      vehicle_id: ''
    });
    setActionError('');
    setActionSuccess('');
    setAssignSeatOpen(true);
  };

  const handleAssignSeatSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      if (!assignSeatForm.membership_id) throw new Error(t('err_passenger_required'));
      if (!assignSeatForm.vehicle_id) throw new Error(t('err_vehicle_required'));

      const response = await membershipService.updateMember(assignSeatForm.membership_id, {
        vehicle_id: assignSeatForm.vehicle_id
      });
      if (response.success) {
        setActionSuccess(t('msg_assign_success'));
        fetchTourData();
        setTimeout(() => setAssignSeatOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('common.messages.error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Realistic License Plate Renderer
  const renderLicensePlate = (plateText, color, fullWidth = false) => {
    if (!plateText) return null;

    let bgColor = '#ffffff';
    let textColor = '#000000';
    let borderColor = '#333333';

    if (color === 'yellow') {
      bgColor = '#fdd835'; // Golden yellow
      textColor = '#000000';
      borderColor = '#f57f17';
    } else if (color === 'blue') {
      bgColor = '#0d47a1'; // Deep public service blue
      textColor = '#ffffff';
      borderColor = '#0a367c';
    }

    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: bgColor,
          color: textColor,
          border: `2px solid ${borderColor}`,
          borderRadius: '6px',
          px: fullWidth ? 2.5 : 1.5,
          py: fullWidth ? 1.2 : 0.5,
          fontWeight: '800',
          fontFamily: '"Roboto Mono", "Courier New", monospace',
          fontSize: fullWidth ? '1.25rem' : '0.85rem',
          letterSpacing: fullWidth ? '2px' : '1px',
          boxShadow: fullWidth ? '0 3px 6px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
          textTransform: 'uppercase',
          position: 'relative',
          width: fullWidth ? '100%' : 'auto',
          minWidth: fullWidth ? '100%' : '105px',
          textAlign: 'center',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '3px',
            bottom: '3px',
            left: '3px',
            right: '3px',
            border: `1px solid ${borderColor}`,
            borderRadius: '4px',
            opacity: 0.35,
            pointerEvents: 'none'
          }
        }}
      >
        {plateText}
      </Box>
    );
  };

  // Helper for rendering role chips
  const getRoleChip = (role) => {
    let color = 'default';
    if (role === 'leader') color = 'error';
    else if (role === 'group_rep') color = 'primary';
    else if (role === 'vehicle_rep') color = 'secondary';
    else if (role === 'driver') color = 'info';

    return <Chip label={role.toUpperCase()} color={color} size="small" variant="outlined" />;
  };

  // Helper for rendering status chips
  const getStatusChip = (status) => {
    if (status === 'left') {
      return (
        <Chip
          label={t('tour_status_left')}
          color="error"
          size="small"
        />
      );
    }
    const isApproved = status === 'approved';
    return (
      <Chip
        label={isApproved ? t('status_approved') : t('status_pending')}
        color={isApproved ? 'success' : 'warning'}
        size="small"
      />
    );
  };

  // ─── ITINERARY HANDLERS ──────────────────────────────────────────────
  const handleSaveItinerary = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const payload = {
        ...itineraryForm,
        date: itineraryForm.date ? new Date(itineraryForm.date).toISOString() : ''
      };
      if (editItineraryId) {
        const result = await offlineApi.updateItinerary(editItineraryId, payload);
        if (result.queued) {
          setActionSuccess('Da luu offline — se dong bo khi co mang!');
        } else {
          setItineraries(itineraries.map(i => i._id === editItineraryId ? result.data.itinerary : i));
          setActionSuccess('Da cap nhat lich trinh!');
        }
      } else {
        const result = await offlineApi.createItinerary({ ...payload, tour_id: id });
        if (result.queued) {
          setActionSuccess('Da luu offline — se dong bo khi co mang!');
        } else {
          setItineraries([...itineraries, result.data.itinerary].sort((a, b) => new Date(a.date) - new Date(b.date)));
          setActionSuccess('Da them lich trinh moi!');
        }
      }
      setTimeout(() => {
        setItineraryModalOpen(false);
        setItineraryForm({ date: '', location: '', activity: '' });
        setEditItineraryId(null);
        setActionSuccess('');
      }, 1000);
    } catch (err) {
      setActionError(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (!window.confirm(t('confirm_delete_itinerary'))) return;
    try {
      const result = await offlineApi.deleteItinerary(itineraryId);
      if (!result.queued) {
        setItineraries(itineraries.filter(i => i._id !== itineraryId));
      } else {
        setItineraries(itineraries.filter(i => i._id !== itineraryId));
        alert('Da xoa offline — se dong bo khi co mang!');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // ─── ATTENDANCE HANDLERS ─────────────────────────────────────────────
  const handleOpenAttendance = async (itinerary) => {
    setSelectedItinerary(itinerary);
    setAttendanceModalOpen(true);
    setAttendanceData([]);
    try {
      const myMembership = memberships.find(m => (m.user_id?._id || m.user_id) === currentUserId && m.status !== 'left');
      if (isCreatorOrAdmin) {
        const vehicleIds = [...new Set(memberships.filter(m => m.vehicle_id).map(m => m.vehicle_id?._id || m.vehicle_id))];
        const allData = [];
        for (const vId of vehicleIds) {
          try {
            const { data: res } = await offlineApi.getAttendance(itinerary._id, vId);
            allData.push(...res.map(a => ({ membership_id: a.membership_id, status: a.status })));
          } catch (_) { }
        }
        setAttendanceData(allData);
      } else if (myMembership?.vehicle_id) {
        const vId = myMembership.vehicle_id?._id || myMembership.vehicle_id;
        const { data: res } = await offlineApi.getAttendance(itinerary._id, vId);
        setAttendanceData(res.map(a => ({ membership_id: a.membership_id, status: a.status })));
      }
    } catch (err) {
      console.error('Loi tai diem danh:', err);
    }
  };

  const handleToggleAttendance = (membershipId) => {
    const existing = attendanceData.find(a => a.membership_id === membershipId);
    if (existing) {
      const newStatus = existing.status === 'present' ? 'absent' : 'present';
      setAttendanceData(attendanceData.map(a => a.membership_id === membershipId ? { ...a, status: newStatus } : a));
    } else {
      setAttendanceData([...attendanceData, { membership_id: membershipId, status: 'present' }]);
    }
  };

  const handleToggleGroupAttendance = (groupMemberIds, markPresent) => {
    setAttendanceData(prev => {
      const updated = [...prev];
      groupMemberIds.forEach(mid => {
        const idx = updated.findIndex(a => a.membership_id === mid);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], status: markPresent ? 'present' : 'absent' };
        } else {
          updated.push({ membership_id: mid, status: markPresent ? 'present' : 'absent' });
        }
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    setActionLoading(true);
    try {
      if (isCreatorOrAdmin) {
        const byVehicle = new Map();
        memberships.filter(m => m.status !== 'left' && m.vehicle_id).forEach(m => {
          const vId = m.vehicle_id?._id || m.vehicle_id;
          if (!byVehicle.has(vId)) byVehicle.set(vId, []);
          byVehicle.get(vId).push(m);
        });
        await Promise.all([...byVehicle.entries()].map(([vehicleId, members]) => {
          const attendances = members.map(m => {
            const ex = attendanceData.find(a => a.membership_id === m._id);
            return { membership_id: m._id, status: ex?.status || 'absent' };
          });
          return offlineApi.markAttendanceBatch({ itinerary_id: selectedItinerary._id, vehicle_id: vehicleId, attendances });
        }));
        setTourAttendances(prev => [
          ...prev.filter(a => (a.itinerary_id?._id || a.itinerary_id) !== selectedItinerary._id),
          ...memberships.filter(m => m.status !== 'left' && m.vehicle_id).map(m => {
            const ex = attendanceData.find(a => a.membership_id === m._id);
            return { itinerary_id: selectedItinerary._id, vehicle_id: m.vehicle_id?._id || m.vehicle_id, membership_id: m._id, status: ex?.status || 'absent' };
          })
        ]);
      } else {
        const myMembership = memberships.find(m => (m.user_id?._id || m.user_id) === currentUserId && m.status !== 'left');
        if (!myMembership?.vehicle_id) { setActionLoading(false); return; }
        const myVId = myMembership.vehicle_id?._id || myMembership.vehicle_id;
        const vehicleMembers = memberships.filter(m => (m.vehicle_id?._id || m.vehicle_id) === myVId && m.status !== 'left');
        const attendances = vehicleMembers.map(m => {
          const ex = attendanceData.find(a => a.membership_id === m._id);
          return { membership_id: m._id, status: ex?.status || 'absent' };
        });
        await offlineApi.markAttendanceBatch({ itinerary_id: selectedItinerary._id, vehicle_id: myVId, attendances });
        setTourAttendances(prev => [
          ...prev.filter(a => !((a.itinerary_id?._id || a.itinerary_id) === selectedItinerary._id && (a.vehicle_id?._id || a.vehicle_id) === myVId)),
          ...attendances.map(f => ({ itinerary_id: selectedItinerary._id, vehicle_id: myVId, membership_id: f.membership_id, status: f.status }))
        ]);
      }
      setAttendanceModalOpen(false);
      alert(!navigator.onLine
        ? 'Da luu offline — se dong bo khi co mang!'
        : 'Da luu diem danh thanh cong!');
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleBack} startIcon={<ArrowBackIcon />}>
            {t('back')}
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!tour) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', minHeight: '100vh' }}>
        <Typography color="text.secondary">{t('tour_no_data')}</Typography>
        <Button sx={{ mt: 2 }} onClick={handleBack} startIcon={<ArrowBackIcon />}>
          {t('back')}
        </Button>
      </Box>
    );
  }

  // Compute overall stats
  const activeMembersCount = memberships.filter(m => m.status === 'approved' || m.status === 'pending').length;
  const tourOccupancyPercent = Math.min(100, Math.round((activeMembersCount / tour.max_capacity) * 100));

  // Filter passengers who do not have a vehicle assigned yet
  const unassignedMembers = memberships.filter(m => !m.vehicle_id && m.status !== 'left');

  // ─── Access Control: phone-based ─────────────────────────────────────────
  // Admin path bypasses check; creator/leader always has access
  if (!isAdminPath && !isLeaderOrCreator) {
    // Normalize phone: strip spaces/dashes for comparison
    const normalize = (p) => (p || '').replace(/[\s\-]/g, '');
    const userPhone = normalize(currentUserPhone);
    const isInPassengerList = userPhone && memberships.some((m) => {
      const phoneViaUser = normalize(m.user_id?.phone);
      const phoneViaGuest = normalize(m.guest_info?.phone);
      return phoneViaUser === userPhone || phoneViaGuest === userPhone;
    });

    if (!isInPassengerList) {
      return (
        <Box
          sx={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
            <Typography variant="h1" sx={{ fontSize: '5rem', mb: 1 }}>🔒</Typography>
            <Typography variant="h5" fontWeight="bold" mb={1}>
              {t('tour_not_in_list_title')}
            </Typography>
            <Typography color="text.secondary" mb={1}>
              {t('tour_not_in_list_desc', { phone: currentUserPhone || t('tour_unnamed') })}
            </Typography>
            <Typography color="text.secondary" variant="body2" mb={3}>
              {t('tour_not_in_list_hint')}
            </Typography>
            <Button
              variant="contained"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 3, fontWeight: 'bold', px: 3 }}
            >
              {t('tour_list_back')}
            </Button>
          </Box>
        </Box>
      );
    }
  }


  const isCreatorOrAdmin = isLeaderOrCreator || isAdminPath;
  const canEditItinerary = isLeaderOrCreator || isAdminPath;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', overflow: 'hidden' }}>

      {/* 1. COMPACT HEADER */}
      <Box sx={{
        bgcolor: 'primary.main', color: 'white', pt: 'calc(env(safe-area-inset-top) + 16px)', pb: 2, px: 2,
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
              {new Date(tour.start_time).toLocaleDateString(localeCode)} - {new Date(tour.end_time).toLocaleDateString(localeCode)}
            </Typography>
          </Box>
          <Avatar sx={{ width: 32, height: 32, border: '2px solid white' }}>
            {tour.created_by?.name ? tour.created_by.name[0] : 'A'}
          </Avatar>
        </Stack>
      </Box>

      {isOfflineData && (
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          {t('tour_offline_cache_warning')}
        </Alert>
      )}

      {/* 2. MAIN SCROLLABLE CONTENT (TABS) */}
      <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative', pb: 'calc(80px + env(safe-area-inset-bottom))' }}>
        {bottomNavValue === 0 && (
          <OverviewTab
            tour={tour}
            memberships={memberships}
            vehicles={vehicles}
            canEditItinerary={canEditItinerary}
            onEditTour={isCreatorOrAdmin ? handleOpenEditTour : undefined}
            onInviteLink={() => setInviteDialogOpen(true)}
          />
        )}

        {bottomNavValue === 1 && (
          <PeopleTab
            memberships={memberships}
            vehicles={vehicles}
            groups={groups}
            loading={loading}
            canEditItinerary={canEditItinerary}
            currentUserId={currentUserId}
            onEditPassenger={(member) => {
              setPassengerForm({
                user_id: member.user_id?._id || member.user_id || '',
                name: member.user_id?.name || member.guest_info?.name || '',
                phone: member.user_id?.phone || member.guest_info?.phone || member.phone || '',
                birth_year: member.user_id?.birth_year || member.guest_info?.birth_year || member.birth_year || '',
                gender: member.user_id?.gender !== undefined ? (member.user_id.gender ? 'male' : 'female') : (member.guest_info?.gender || member.gender || 'male'),
                customer_type: member.customer_type,
                role: member.role,
                status: member.status || 'pending',
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
            onDeletePassenger={isCreatorOrAdmin ? handleDeletePassenger : undefined}
            onLeavePassenger={handleOpenLeaveDialog}
            onExportExcel={handleExportExcel}
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
            onDeleteVehicle={isCreatorOrAdmin ? handleDeleteVehicle : undefined}
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
        <Box sx={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', right: 16, zIndex: 1000 }}>
          {bottomNavValue === 1 && (
            <SpeedDial
              ariaLabel="People Actions"
              icon={<SpeedDialIcon />}
              direction="up"
              FabProps={{ sx: { bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } } }}
            >
              <SpeedDialAction
                icon={<PersonAddIcon />}
                tooltipTitle={t('btn_add_passenger')}
                onClick={handleOpenAddPassenger}
              />
              {isCreatorOrAdmin && (
                <SpeedDialAction
                  icon={<FormatListBulletedIcon />}
                  tooltipTitle={t('tour_import_excel')}
                  onClick={() => setExcelModalOpen(true)}
                />
              )}
              {isCreatorOrAdmin && (
                <SpeedDialAction
                  icon={<FileDownloadIcon />}
                  tooltipTitle={t('tour_export_excel')}
                  onClick={handleExportExcel}
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
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, bgcolor: 'background.paper', pb: 'env(safe-area-inset-bottom)' }} elevation={8}>
        <BottomNavigation
          showLabels
          value={bottomNavValue}
          onChange={(event, newValue) => {
            setBottomNavValue(newValue);
          }}
          sx={{ height: 65, '& .MuiBottomNavigationAction-label': { fontWeight: 600 } }}
        >
          <BottomNavigationAction label={t('tab_overview')} icon={<DashboardIcon />} />
          <BottomNavigationAction label={t('tab_passengers')} icon={<GroupsIcon />} />
          <BottomNavigationAction label={t('tab_vehicles')} icon={<DirectionsBusIcon />} />
          <BottomNavigationAction label={t('tab_schedule')} icon={<AccessTimeFilledIcon />} />
        </BottomNavigation>
      </Paper>

      {/* Modals are rendered below inside the same root Box */}
      {/* ========================================================================= */}
      {/* MODAL 0A: EDIT/ADD ITINERARY */}
      {/* ========================================================================= */}
      <Dialog open={itineraryModalOpen} onClose={() => !actionLoading && setItineraryModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {editItineraryId ? t('tour_itinerary_edit_title') : t('tour_itinerary_add_title')}
        </DialogTitle>
        <DialogContent>
          <form id="itineraryForm" onSubmit={handleSaveItinerary}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_time')}
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={itineraryForm.date}
              onChange={(e) => setItineraryForm({ ...itineraryForm, date: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_location')}
              placeholder={t('tour_location_placeholder')}
              value={itineraryForm.location}
              onChange={(e) => setItineraryForm({ ...itineraryForm, location: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              rows={3}
              label={t('tour_activity')}
              placeholder={t('tour_activity_placeholder')}
              value={itineraryForm.activity}
              onChange={(e) => setItineraryForm({ ...itineraryForm, activity: e.target.value })}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setItineraryModalOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="itineraryForm" variant="contained" color="primary" disabled={actionLoading}>
            {actionLoading ? '...' : t('profile_save_btn')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 0B: ATTENDANCE */}
      {/* ========================================================================= */}
      <Dialog
        open={attendanceModalOpen}
        onClose={() => !actionLoading && setAttendanceModalOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 0, maxWidth: 640, width: '100%', maxHeight: '90vh' } }}
        fullWidth
      >
        {/* Header */}
        <Box sx={{
          px: 3, pt: 2.5, pb: 2,
          background: accentGradient(theme),
          color: 'white',
        }}>
          <Typography variant="h6" fontWeight={800}>📋 {t('tour_attendance_title')}</Typography>
          {selectedItinerary && (
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              🕐 {new Date(selectedItinerary.date).toLocaleString(localeCode, { dateStyle: 'medium', timeStyle: 'short' })} &nbsp;·&nbsp; 📍 {selectedItinerary.location}
            </Typography>
          )}
          {/* Summary stats */}
          {(() => {
            const total = attendanceData.length;
            const present = attendanceData.filter(a => a.status === 'present').length;
            return total > 0 ? (
              <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                <Chip label={`${t('tour_attendance_present')}: ${present}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 700, height: 24 }} />
                <Chip label={`${t('tour_attendance_absent')}: ${total - present}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, height: 24 }} />
              </Box>
            ) : null;
          })()}
        </Box>

        <DialogContent sx={{ p: 2, overflowY: 'auto' }}>
          {(() => {
            const myMembership = memberships.find(m => {
              const mUserId = m.user_id?._id || m.user_id;
              return mUserId === currentUserId && m.status !== 'left';
            });

            // Determine scope: admin/leader sees all; members see own vehicle
            let scopeMembers = [];
            if (isCreatorOrAdmin) {
              scopeMembers = memberships.filter(m => m.status !== 'left');
            } else {
              if (!myMembership?.vehicle_id) {
                return (
                  <Box textAlign="center" py={3}>
                    <Typography fontSize="2rem">🚗</Typography>
                    <Typography color="text.secondary" mt={1}>{t('tour_attendance_no_permission')}</Typography>
                  </Box>
                );
              }
              scopeMembers = memberships.filter(m => {
                const vId = m.vehicle_id?._id || m.vehicle_id;
                const myVId = myMembership.vehicle_id?._id || myMembership.vehicle_id;
                return vId === myVId && m.status !== 'left';
              });
            }

            if (scopeMembers.length === 0) {
              return <Typography textAlign="center" py={3} color="text.secondary">{t('tour_no_passengers_found')}</Typography>;
            }

            // Group members by group_id
            const groupMap = new Map();
            scopeMembers.forEach(m => {
              const gId = m.group_id?._id || m.group_id;
              const key = gId ? gId.toString() : '__none__';
              if (!groupMap.has(key)) groupMap.set(key, []);
              groupMap.get(key).push(m);
            });

            // Render each group section
            const sections = [];
            groupMap.forEach((gMembers, key) => {
              const groupObj = key !== '__none__' ? groups.find(g => g._id.toString() === key) : null;
              const groupName = groupObj?.name || gMembers.find(m => m.group_id?.name)?.group_id?.name || (key === '__none__' ? t('tour_no_group') : t('tour_group_suffix', { id: key.slice(-4) }));
              const groupMemberIds = gMembers.map(m => m._id);
              const groupPresentCount = gMembers.filter(m => {
                const rec = attendanceData.find(a => a.membership_id === m._id);
                return rec?.status === 'present';
              }).length;
              const allPresent = groupPresentCount === gMembers.length;

              const headerColors = groupHeaderColors(theme, key === '__none__');
              sections.push(
                <Box key={key} sx={{ mb: 2 }}>
                  {/* Group header with quick-select */}
                  <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    px: 1.5, py: 1, mb: 1,
                    bgcolor: headerColors.bgcolor,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: headerColors.borderColor,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700} color={headerColors.titleColor}>
                        👥 {groupName}
                      </Typography>
                      <Chip
                        label={`${groupPresentCount}/${gMembers.length}`}
                        size="small"
                        color={allPresent ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleToggleGroupAttendance(groupMemberIds, true)}
                        sx={{ height: 28, fontSize: '0.72rem', px: 1.5, borderRadius: 2, minWidth: 0 }}
                      >
                        {t('tour_select_group')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleToggleGroupAttendance(groupMemberIds, false)}
                        sx={{ height: 28, fontSize: '0.72rem', px: 1.5, borderRadius: 2, minWidth: 0 }}
                      >
                        {t('tour_deselect_group')}
                      </Button>
                    </Box>
                  </Box>

                  {/* Members */}
                  <Stack spacing={1}>
                    {gMembers.map(member => {
                      const name = member.user_id?.name || member.guest_info?.name || t('tour_unnamed');
                      const phone = member.user_id?.phone || member.guest_info?.phone || '';
                      const birthYear = member.guest_info?.birth_year || (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : null);
                      const age = birthYear ? new Date().getFullYear() - birthYear : null;
                      const rec = attendanceData.find(a => a.membership_id === member._id);
                      const isPresent = rec?.status === 'present';

                      return (
                        <Paper
                          key={member._id}
                          variant="outlined"
                          onClick={() => handleToggleAttendance(member._id)}
                          sx={{
                            p: 1.5,
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            ...attendanceMemberSx(theme, isPresent),
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar
                              {...stringAvatar(name)}
                              sx={{
                                ...stringAvatar(name).sx,
                                width: 38, height: 38,
                                border: '2px solid',
                                borderColor: attendanceAvatarBorder(theme, isPresent)
                              }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={700} lineHeight={1.3}>{name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {[phone, birthYear && age ? t('tour_birth_year_with_age', { year: birthYear, age }) : birthYear ? t('tour_birth_year_only', { year: birthYear }) : null].filter(Boolean).join(' · ')}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" fontWeight={700} color={isPresent ? 'success.main' : 'error.main'}>
                              {isPresent ? t('tour_attendance_present') : t('tour_attendance_absent')}
                            </Typography>
                            <Checkbox
                              checked={isPresent}
                              onChange={() => handleToggleAttendance(member._id)}
                              onClick={e => e.stopPropagation()}
                              icon={<CancelIcon color="error" />}
                              checkedIcon={<CheckCircleIcon color="success" />}
                              size="medium"
                              sx={{ p: 0.5 }}
                            />
                          </Box>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>
              );
            });

            return <Box>{sections}</Box>;
          })()}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setAttendanceModalOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('btn_close', 'Đóng')}
          </Button>
          {/* Mark all present */}
          <Button
            variant="outlined"
            color="success"
            disabled={actionLoading}
            onClick={() => {
              const scopeIds = (() => {
                if (isCreatorOrAdmin) return memberships.filter(m => m.status !== 'left').map(m => m._id);
                const myM = memberships.find(m => (m.user_id?._id || m.user_id) === currentUserId && m.status !== 'left');
                if (!myM?.vehicle_id) return [];
                const myVId = myM.vehicle_id?._id || myM.vehicle_id;
                return memberships.filter(m => (m.vehicle_id?._id || m.vehicle_id) === myVId && m.status !== 'left').map(m => m._id);
              })();
              handleToggleGroupAttendance(scopeIds, true);
            }}
          >
            {t('tour_attendance_present_all', 'Tất cả có mặt')}
          </Button>
          <Button onClick={handleSaveAttendance} variant="contained" color="secondary" disabled={actionLoading} sx={{ minWidth: 130 }}>
            {actionLoading ? '...' : t('tour_save_attendance')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT TOUR */}
      {/* ========================================================================= */}
      <Dialog open={editTourOpen} onClose={() => !actionLoading && setEditTourOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {t('modal_edit_tour_title')}
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
          <form id="editTourForm" onSubmit={handleEditTourSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_name')}
              value={tourForm.name}
              onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_start_time')}
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={tourForm.start_time}
              onChange={(e) => setTourForm({ ...tourForm, start_time: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_end_time')}
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={tourForm.end_time}
              onChange={(e) => setTourForm({ ...tourForm, end_time: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_capacity')}
              type="number"
              value={tourForm.max_capacity}
              onChange={(e) => setTourForm({ ...tourForm, max_capacity: e.target.value })}
              inputProps={{ min: 1 }}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditTourOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="editTourForm" variant="contained" color="primary" disabled={actionLoading}>
            {actionLoading ? '...' : t('profile_save_btn')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: ADD PASSENGER */}
      {/* ========================================================================= */}
      <Dialog open={addPassengerOpen} onClose={() => !actionLoading && setAddPassengerOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 650, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'success.main' }}>
          {t('modal_add_passenger_title')}
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}

          <Tabs
            value={addPassengerMode}
            onChange={(_, val) => setAddPassengerMode(val)}
            centered
            sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Tab label={t('tour_add_passenger_single')} value="single" sx={{ fontWeight: 'bold' }} />
            <Tab label={t('tour_add_passenger_batch')} value="batch" sx={{ fontWeight: 'bold' }} />
          </Tabs>

          <form id="addPassengerForm" onSubmit={handleAddPassengerSubmit}>
            {addPassengerMode === 'single' ? (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  label={t('profile_phone')}
                  placeholder={t('phone_placeholder_short')}
                  value={passengerForm.phone}
                  onChange={handlePassengerPhoneChange}
                  autoFocus
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label={t('profile_name')}
                  placeholder={t('tour_driver_name_placeholder')}
                  value={passengerForm.name}
                  onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })}
                  InputProps={{
                    readOnly: !!passengerForm.user_id,
                  }}
                  helperText={passengerForm.user_id ? t('tour_linked_account_helper') : ""}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label={t('col_birth_year')}
                      type="number"
                      placeholder={t('birth_year_placeholder_short')}
                      value={passengerForm.birth_year}
                      onChange={(e) => setPassengerForm({ ...passengerForm, birth_year: e.target.value })}
                      inputProps={{ min: 1900, max: new Date().getFullYear() }}
                      InputProps={{
                        readOnly: !!passengerForm.user_id,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>{t('profile_gender')}</InputLabel>
                      <Select
                        value={passengerForm.gender}
                        label={t('profile_gender')}
                        onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                        inputProps={{
                          readOnly: !!passengerForm.user_id,
                        }}
                      >
                        <MenuItem value="male">{t('profile_male')}</MenuItem>
                        <MenuItem value="female">{t('profile_female')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>{t('tour_customer_type')}</InputLabel>
                      <Select
                        value={passengerForm.customer_type}
                        label={t('tour_customer_type')}
                        onChange={(e) => setPassengerForm({ ...passengerForm, customer_type: e.target.value })}
                      >
                        <MenuItem value="adult">{t('tour_adult')}</MenuItem>
                        <MenuItem value="child">{t('tour_child')}</MenuItem>
                        <MenuItem value="elderly">{t('tour_elderly')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('tour_group_label')}</InputLabel>
                  <Select
                    value={newGroupSelected ? 'new' : passengerForm.group_id || 'none'}
                    label={t('tour_group_label')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'new') {
                        setNewGroupSelected(true);
                      } else {
                        setNewGroupSelected(false);
                        setPassengerForm({ ...passengerForm, group_id: val });
                      }
                    }}
                  >
                    <MenuItem value="none">{t('tour_group_none')}</MenuItem>
                    {groups.map((g) => (
                      <MenuItem key={g._id} value={g._id}>
                        {g.name} ({t('tour_representative')}: {g.representative_id?.user_id?.name || g.representative_id?.guest_info?.name || t('profile_unspecified')})
                      </MenuItem>
                    ))}
                    <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      + {t('tour_group_create_new_rep')}
                    </MenuItem>
                  </Select>
                </FormControl>

                {newGroupSelected && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label={t('tour_group_new_name')}
                    placeholder={t('tour_group_new_name_placeholder')}
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                  />
                )}

                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('tour_passenger_role')}</InputLabel>
                  <Select
                    value={newGroupSelected ? 'group_rep' : passengerForm.role || 'member'}
                    label={t('tour_passenger_role')}
                    onChange={(e) => setPassengerForm({ ...passengerForm, role: e.target.value })}
                    disabled={newGroupSelected}
                  >
                    <MenuItem value="member">{t('tour_role_member_desc')}</MenuItem>
                    <MenuItem value="group_rep">{t('tour_role_group_rep_desc')}</MenuItem>
                    <MenuItem value="vehicle_rep">{t('tour_role_vehicle_rep_desc')}</MenuItem>
                    <MenuItem value="driver">{t('tour_role_driver_desc')}</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id="isDriverCheckboxSingle"
                    checked={passengerForm.is_driver}
                    onChange={(e) => setPassengerForm({ ...passengerForm, is_driver: e.target.checked })}
                    style={{ marginRight: 8, transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                  <Typography variant="body2" component="label" htmlFor="isDriverCheckboxSingle" sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }}>
                    {t('tour_is_driver_checkbox')}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('tour_select_group_division')}</InputLabel>
                  <Select
                    value={newGroupSelected ? 'new' : 'none'}
                    label={t('tour_select_group_division')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'new') {
                        setNewGroupSelected(true);
                      } else {
                        setNewGroupSelected(false);
                      }
                    }}
                  >
                    <MenuItem value="none">{t('tour_no_new_group_desc')}</MenuItem>
                    <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      + {t('tour_create_new_group_all_desc')}
                    </MenuItem>
                  </Select>
                </FormControl>

                {newGroupSelected && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label={t('tour_group_new_name')}
                    placeholder={t('tour_group_new_name_placeholder_batch')}
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    helperText={t('tour_group_batch_first_helper')}
                  />
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('tour_batch_passenger_list')}
                </Typography>

                {batchMembers.map((member, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 3, position: 'relative' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {t('tour_member_prefix')} #{index + 1} {index === 0 && newGroupSelected ? t('tour_role_group_rep_short') : ""}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            id={`isDriverBatch-${index}`}
                            checked={member.is_driver}
                            onChange={(e) => {
                              const updated = [...batchMembers];
                              updated[index].is_driver = e.target.checked;
                              setBatchMembers(updated);
                            }}
                            style={{ marginRight: 6, transform: 'scale(1)', cursor: 'pointer' }}
                          />
                          <Typography variant="caption" component="label" htmlFor={`isDriverBatch-${index}`} sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'text.secondary' }}>
                            {t('tour_is_driver')}
                          </Typography>
                        </Box>
                      </Stack>
                      {batchMembers.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => handleRemoveBatchRow(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          size="small"
                          label={t('profile_phone')}
                          placeholder={t('phone_placeholder_short')}
                          value={member.phone}
                          onChange={(e) => handlePassengerPhoneChangeBatch(index, e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label={t('profile_name')}
                          placeholder={t('tour_driver_name_placeholder')}
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...batchMembers];
                            updated[index].name = e.target.value;
                            setBatchMembers(updated);
                          }}
                          InputProps={{
                            readOnly: !!member.user_id,
                          }}
                          helperText={member.user_id ? t('tour_linked_account_helper_short') : ""}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={2}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label={t('col_birth_year')}
                          type="number"
                          placeholder={t('birth_year_placeholder_short')}
                          value={member.birth_year}
                          onChange={(e) => {
                            const updated = [...batchMembers];
                            updated[index].birth_year = e.target.value;
                            setBatchMembers(updated);
                          }}
                          inputProps={{ min: 1900, max: new Date().getFullYear() }}
                          InputProps={{
                            readOnly: !!member.user_id,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>{t('profile_gender')}</InputLabel>
                          <Select
                            value={member.gender}
                            label={t('profile_gender')}
                            onChange={(e) => {
                              const updated = [...batchMembers];
                              updated[index].gender = e.target.value;
                              setBatchMembers(updated);
                            }}
                            inputProps={{
                              readOnly: !!member.user_id,
                            }}
                          >
                            <MenuItem value="male">{t('profile_male')}</MenuItem>
                            <MenuItem value="female">{t('profile_female')}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>{t('tour_customer_type')}</InputLabel>
                          <Select
                            value={member.customer_type}
                            label={t('tour_customer_type')}
                            onChange={(e) => {
                              const updated = [...batchMembers];
                              updated[index].customer_type = e.target.value;
                              setBatchMembers(updated);
                            }}
                          >
                            <MenuItem value="adult">{t('tour_adult')}</MenuItem>
                            <MenuItem value="child">{t('tour_child')}</MenuItem>
                            <MenuItem value="elderly">{t('tour_elderly')}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={handleAddBatchRow}
                  sx={{ mt: 1, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                  {t('tour_add_other_member')}
                </Button>
              </Box>
            )}
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddPassengerOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="addPassengerForm" variant="contained" color="success" disabled={actionLoading}>
            {t('btn_add_passenger')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT PASSENGER */}
      {/* ========================================================================= */}
      <Dialog open={editPassengerOpen} onClose={() => !actionLoading && setEditPassengerOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {t('modal_edit_passenger_title')}
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
          <form id="editPassengerForm" onSubmit={handleEditPassengerSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label={t('profile_phone')}
              value={passengerForm.phone}
              disabled
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('profile_name')}
              value={passengerForm.name}
              onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })}
              InputProps={{
                readOnly: !!passengerForm.user_id,
              }}
              helperText={passengerForm.user_id ? t('tour_linked_account_helper') : ""}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label={t('col_birth_year')}
                  type="number"
                  value={passengerForm.birth_year}
                  onChange={(e) => setPassengerForm({ ...passengerForm, birth_year: e.target.value })}
                  inputProps={{ min: 1900, max: new Date().getFullYear() }}
                  InputProps={{
                    readOnly: !!passengerForm.user_id,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>{t('profile_gender')}</InputLabel>
                  <Select
                    value={passengerForm.gender}
                    label={t('profile_gender')}
                    onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                    inputProps={{
                      readOnly: !!passengerForm.user_id,
                    }}
                  >
                    <MenuItem value="male">{t('profile_male')}</MenuItem>
                    <MenuItem value="female">{t('profile_female')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>{t('tour_customer_type')}</InputLabel>
                  <Select
                    value={passengerForm.customer_type}
                    label={t('tour_customer_type')}
                    onChange={(e) => setPassengerForm({ ...passengerForm, customer_type: e.target.value })}
                  >
                    <MenuItem value="adult">{t('tour_adult')}</MenuItem>
                    <MenuItem value="child">{t('tour_child')}</MenuItem>
                    <MenuItem value="elderly">{t('tour_elderly')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Group assignment and role on edit */}
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tour_group_label')}</InputLabel>
              <Select
                value={newGroupSelected ? 'new' : passengerForm.group_id || 'none'}
                label={t('tour_group_label')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'new') {
                    setNewGroupSelected(true);
                  } else {
                    setNewGroupSelected(false);
                    setPassengerForm({ ...passengerForm, group_id: val });
                  }
                }}
              >
                <MenuItem value="none">{t('tour_group_none')}</MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g._id} value={g._id}>
                    {g.name} ({t('tour_representative')}: {g.representative_id?.user_id?.name || g.representative_id?.guest_info?.name || t('profile_unspecified')})
                  </MenuItem>
                ))}
                <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  + {t('tour_group_create_new_rep')}
                </MenuItem>
              </Select>
            </FormControl>

            {newGroupSelected && (
              <TextField
                margin="normal"
                required
                fullWidth
                label={t('tour_group_new_name')}
                placeholder={t('tour_group_new_name_placeholder')}
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
              />
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tour_passenger_role')}</InputLabel>
              <Select
                value={newGroupSelected ? 'group_rep' : passengerForm.role || 'member'}
                label={t('tour_passenger_role')}
                onChange={(e) => setPassengerForm({ ...passengerForm, role: e.target.value })}
                disabled={newGroupSelected}
              >
                <MenuItem value="member">{t('tour_role_member_desc')}</MenuItem>
                <MenuItem value="group_rep">{t('tour_role_group_rep_desc')}</MenuItem>
                <MenuItem value="vehicle_rep">{t('tour_role_vehicle_rep_desc')}</MenuItem>
                <MenuItem value="driver">{t('tour_role_driver_desc')}</MenuItem>
              </Select>
            </FormControl>

            {/* Status */}
            {isCreatorOrAdmin && (
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('col_status')}</InputLabel>
                <Select
                  value={passengerForm.status}
                  label={t('col_status')}
                  onChange={(e) => setPassengerForm({ ...passengerForm, status: e.target.value })}
                >
                  <MenuItem value="pending">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main', flexShrink: 0 }} />
                      {t('tour_status_pending')} (Pending)
                    </Box>
                  </MenuItem>
                  <MenuItem value="approved">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', flexShrink: 0 }} />
                      {t('tour_status_approved')} (Approved)
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
                      {t('tour_status_rejected')} (Rejected)
                    </Box>
                  </MenuItem>
                  <MenuItem value="removed">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled', flexShrink: 0 }} />
                      {t('tour_status_removed')} (Removed)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            )}

            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="isDriverCheckboxEdit"
                checked={passengerForm.is_driver}
                onChange={(e) => setPassengerForm({ ...passengerForm, is_driver: e.target.checked })}
                style={{ marginRight: 8, transform: 'scale(1.2)', cursor: 'pointer' }}
              />
              <Typography variant="body2" component="label" htmlFor="isDriverCheckboxEdit" sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }}>
                {t('tour_is_driver_checkbox')}
              </Typography>
            </Box>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditPassengerOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="editPassengerForm" variant="contained" color="primary" disabled={actionLoading}>
            {actionLoading ? '...' : t('profile_save_btn')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: ADD VEHICLE */}
      {/* ========================================================================= */}
      <Dialog open={addVehicleOpen} onClose={() => !actionLoading && setAddVehicleOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'warning.main' }}>
          {t('modal_add_vehicle_title')}
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
          <form id="addVehicleForm" onSubmit={handleAddVehicleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('license_plate')}
              placeholder="Ví dụ: 29A-12345"
              value={vehicleForm.license_plate}
              onChange={(e) => setVehicleForm({ ...vehicleForm, license_plate: e.target.value })}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('plate_color')}</InputLabel>
              <Select
                value={vehicleForm.plate_color}
                label={t('plate_color')}
                onChange={(e) => setVehicleForm({ ...vehicleForm, plate_color: e.target.value })}
              >
                <MenuItem value="white">{t('tour_plate_white')}</MenuItem>
                <MenuItem value="yellow">{t('tour_plate_yellow')}</MenuItem>
                <MenuItem value="blue">{t('tour_plate_blue')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('seat_count')}
              type="number"
              placeholder="7, 16, 29, 45"
              value={vehicleForm.seat_count}
              onChange={(e) => setVehicleForm({ ...vehicleForm, seat_count: e.target.value })}
              inputProps={{ min: 1 }}
            />

            {/* Chọn tài xế từ danh sách hành khách */}
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tour_select_driver_from_list')}</InputLabel>
              <Select
                value={vehicleForm._selectedDriverId || ''}
                label={t('tour_select_driver_from_list')}
                onChange={(e) => {
                  const memberId = e.target.value;
                  if (!memberId) {
                    setVehicleForm({ ...vehicleForm, _selectedDriverId: '', driver_name: '', driver_phone: '' });
                    return;
                  }
                  const found = memberships.find(m => m._id === memberId);
                  if (found) {
                    const name = found.user_id?.name || found.guest_info?.name || '';
                    const phone = found.user_id?.phone || found.guest_info?.phone || '';
                    setVehicleForm({ ...vehicleForm, _selectedDriverId: memberId, driver_name: name, driver_phone: phone });
                  }
                }}
                displayEmpty
              >
                <MenuItem value=""><em>{t('tour_driver_manual_input')}</em></MenuItem>
                {memberships.map((m) => {
                  const name = m.user_id?.name || m.guest_info?.name || t('profile_unspecified');
                  const phone = m.user_id?.phone || m.guest_info?.phone || '';
                  return (
                    <MenuItem key={m._id} value={m._id}>
                      {name}{phone ? ` - ${phone}` : ''}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              label={t('driver_name')}
              placeholder={t('tour_driver_name_placeholder')}
              value={vehicleForm.driver_name}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driver_name: e.target.value, _selectedDriverId: '' })}
            />

            <TextField
              margin="normal"
              fullWidth
              label={t('driver_phone')}
              placeholder={t('tour_driver_phone_placeholder')}
              value={vehicleForm.driver_phone}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driver_phone: e.target.value, _selectedDriverId: '' })}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddVehicleOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="addVehicleForm" variant="contained" color="warning" disabled={actionLoading}>
            {t('btn_add_vehicle')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT VEHICLE */}
      {/* ========================================================================= */}
      <Dialog open={editVehicleOpen} onClose={() => !actionLoading && setEditVehicleOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'warning.main' }}>
          {t('modal_edit_vehicle_title')}
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
          <form id="editVehicleForm" onSubmit={handleEditVehicleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('license_plate')}
              placeholder="29A-12345"
              value={vehicleForm.license_plate}
              onChange={(e) => setVehicleForm({ ...vehicleForm, license_plate: e.target.value })}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('plate_color')}</InputLabel>
              <Select
                value={vehicleForm.plate_color}
                label={t('plate_color')}
                onChange={(e) => setVehicleForm({ ...vehicleForm, plate_color: e.target.value })}
              >
                <MenuItem value="white">{t('tour_plate_white')}</MenuItem>
                <MenuItem value="yellow">{t('tour_plate_yellow')}</MenuItem>
                <MenuItem value="blue">{t('tour_plate_blue')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('seat_count')}
              type="number"
              placeholder="7, 16, 29, 45"
              value={vehicleForm.seat_count}
              onChange={(e) => setVehicleForm({ ...vehicleForm, seat_count: e.target.value })}
              inputProps={{ min: 1 }}
            />

            {/* Chọn tài xế từ danh sách hành khách */}
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tour_select_driver_from_list')}</InputLabel>
              <Select
                value={vehicleForm._selectedDriverId || ''}
                label={t('tour_select_driver_from_list')}
                onChange={(e) => {
                  const memberId = e.target.value;
                  if (!memberId) {
                    setVehicleForm({ ...vehicleForm, _selectedDriverId: '', driver_name: '', driver_phone: '' });
                    return;
                  }
                  const found = memberships.find(m => m._id === memberId);
                  if (found) {
                    const name = found.user_id?.name || found.guest_info?.name || '';
                    const phone = found.user_id?.phone || found.guest_info?.phone || '';
                    setVehicleForm({ ...vehicleForm, _selectedDriverId: memberId, driver_name: name, driver_phone: phone });
                  }
                }}
                displayEmpty
              >
                <MenuItem value=""><em>{t('tour_driver_manual_input')}</em></MenuItem>
                {memberships.map((m) => {
                  const name = m.user_id?.name || m.guest_info?.name || t('profile_unspecified');
                  const phone = m.user_id?.phone || m.guest_info?.phone || '';
                  return (
                    <MenuItem key={m._id} value={m._id}>
                      {name}{phone ? ` - ${phone}` : ''}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              label={t('driver_name')}
              placeholder={t('tour_driver_name_placeholder')}
              value={vehicleForm.driver_name}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driver_name: e.target.value, _selectedDriverId: '' })}
            />

            <TextField
              margin="normal"
              fullWidth
              label={t('driver_phone')}
              placeholder={t('tour_driver_phone_placeholder')}
              value={vehicleForm.driver_phone}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driver_phone: e.target.value, _selectedDriverId: '' })}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditVehicleOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="editVehicleForm" variant="contained" color="warning" disabled={actionLoading}>
            {actionLoading ? '...' : t('profile_save_btn')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 6: ASSIGN SEAT */}
      {/* ========================================================================= */}
      <Dialog open={assignSeatOpen} onClose={() => !actionLoading && setAssignSeatOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'info.main' }}>
          {t('modal_assign_seat_title')}
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
          <form id="assignSeatForm" onSubmit={handleAssignSeatSubmit}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('select_passenger')}</InputLabel>
              <Select
                value={assignSeatForm.membership_id}
                label={t('select_passenger')}
                onChange={(e) => setAssignSeatForm({ ...assignSeatForm, membership_id: e.target.value })}
              >
                {unassignedMembers.length === 0 ? (
                  <MenuItem disabled>{t('tour_all_passengers_assigned')}</MenuItem>
                ) : (
                  unassignedMembers.map((member) => {
                    const mName = member.user_id?.name || member.guest_info?.name;
                    return (
                      <MenuItem key={member._id} value={member._id}>
                        {mName} ({member.role})
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('select_vehicle')}</InputLabel>
              <Select
                value={assignSeatForm.vehicle_id}
                label={t('select_vehicle')}
                onChange={(e) => setAssignSeatForm({ ...assignSeatForm, vehicle_id: e.target.value })}
              >
                {vehicles.length === 0 ? (
                  <MenuItem disabled>{t('tour_no_vehicles_in_tour')}</MenuItem>
                ) : (
                  vehicles.map((vehicle) => {
                    const assignedCount = memberships.filter(m => m.vehicle_id === vehicle._id && m.status !== 'left').length;
                    const isFull = assignedCount >= vehicle.seat_count;

                    return (
                      <MenuItem key={vehicle._id} value={vehicle._id} disabled={isFull}>
                        {vehicle.license_plate} - {t('tour_vehicle_free_seats_status', { free: vehicle.seat_count - assignedCount, total: vehicle.seat_count })} {isFull ? `(${t('tour_vehicle_status_full')})` : ''}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignSeatOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="assignSeatForm" variant="contained" color="info" disabled={actionLoading || vehicles.length === 0 || unassignedMembers.length === 0}>
            {t('btn_assign_seat')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 7: VIEW PASSENGERS ON VEHICLE */}
      {/* ========================================================================= */}
      <Dialog
        open={viewVehiclePassengersOpen}
        onClose={() => !actionLoading && setViewVehiclePassengersOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 1536, width: '100%' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {t('tour_vehicle_passengers_title')}
              </Typography>
              {activeVehicleForPassengers && renderLicensePlate(activeVehicleForPassengers.license_plate, activeVehicleForPassengers.plate_color)}
            </Stack>
            {activeVehicleForPassengers && (
              <Button
                variant={showAddPassengerPanel ? "contained" : "outlined"}
                color="success"
                size="small"
                startIcon={showAddPassengerPanel ? <RemoveCircleOutlineIcon /> : <AddCircleOutlineIcon />}
                onClick={() => setShowAddPassengerPanel(!showAddPassengerPanel)}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
              >
                {showAddPassengerPanel ? t('tour_close_assign_panel') : t('tour_open_assign_panel')}
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
                bgcolor: alpha(theme.palette.action.hover, 0.5),
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AddCircleOutlineIcon sx={{ fontSize: '1.1rem' }} /> {t('tour_assign_passenger_to_vehicle')}
              </Typography>

              {/* Group quick select */}
              {groups.length > 0 && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>{t('tour_group_quick_select')}</InputLabel>
                  <Select
                    value={selectedGroupIdFilter}
                    label={t('tour_group_quick_select')}
                    onChange={(e) => handleGroupFilterChange(e.target.value)}
                  >
                    <MenuItem value="none">{t('tour_select_manual')}</MenuItem>
                    {groups.map(g => {
                      const unassignedGroupCount = memberships.filter(m => !m.vehicle_id && (m.group_id?._id === g._id || m.group_id === g._id)).length;
                      return (
                        <MenuItem key={g._id} value={g._id} disabled={unassignedGroupCount === 0}>
                          {t('tour_group_unassigned_members', { name: g.name, count: unassignedGroupCount })}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              )}

              {/* Passenger checklist */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                  {t('tour_select_unassigned_passenger')}
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
                        {t('tour_select_all_count', { count: unassignedMembers.length })}
                      </Button>
                    );
                  }
                  return null;
                })()}
              </Stack>
              {unassignedMembers.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2, py: 1 }}>{t('tour_all_passengers_assigned')}</Alert>
              ) : (
                <Box
                  sx={{
                    maxHeight: 280,
                    overflowY: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                    mb: 2.5,
                    bgcolor: 'background.paper'
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
                              borderColor: isChecked ? 'success.main' : 'divider',
                              bgcolor: isChecked
                                ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                                : 'background.paper',
                              cursor: 'pointer',
                              height: '100%',
                              minWidth: 0,
                              width: '100%',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': { bgcolor: 'action.hover', borderColor: isChecked ? 'success.main' : 'divider' }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              style={{ marginRight: 12, transform: 'scale(1.2)', cursor: 'pointer', accentColor: theme.palette.success.main }}
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
                                  {t('tour_group_prefix')}<Typography component="span" variant="caption" color="primary.main" fontWeight="bold">{grp.name}</Typography>
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
                        {t('tour_vehicle_seats_selected_summary', { remaining: remainingSeats, selected: selectedCount })}
                      </Typography>
                      {overCapacity && (
                        <Typography variant="caption" color="error" sx={{ fontWeight: 'bold' }}>
                          {t('tour_vehicle_over_capacity', { count: selectedCount - remainingSeats })}
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
                        {t('btn_cancel')}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={selectedCount === 0 || overCapacity || actionLoading}
                        onClick={handleAssignSeatsBatchSubmit}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {actionLoading ? '...' : t('tour_confirm_assign_seats')}
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
                        {t('tour_vehicle_empty_seats_status')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {isFull ? t('tour_vehicle_status_full') : t('tour_vehicle_free_seats_caps', { free: remaining, total: activeVehicleForPassengers.seat_count })}
                      </Typography>
                    </Stack>
                  </Paper>
                );
              })()}

              {/* Mobile View: Grid of Occupants */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                {memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }}>
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {t('tour_vehicle_empty_occupants')}
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
                      const genderLabel = genderRaw === 'male' ? t('profile_male') : genderRaw === 'female' ? t('profile_female') : t('tour_gender_other');
                      const isRepresentative = activeVehicleForPassengers.representative_id === member._id;

                      return (
                        <Box key={member._id} sx={{ display: 'flex' }}>
                          <Card variant="outlined" sx={{ width: '100%', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', border: isRepresentative ? '2px solid' : '1px solid', borderColor: isRepresentative ? 'primary.main' : 'divider' }}>
                            {isRepresentative && (
                              <Chip
                                label={t('tour_vehicle_leader')}
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
                                    <Chip label="GUEST" size="small" sx={{ fontSize: '0.6rem', height: 18, bgcolor: 'action.selected', color: 'text.secondary', fontWeight: 'bold', mt: 0.5 }} />
                                  )}
                                </Box>
                              </Stack>

                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PhoneIcon fontSize="small" sx={{ opacity: 0.7 }} /> {phone || t('tour_no_phone_provided')}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <PersonAddIcon fontSize="small" sx={{ opacity: 0.7 }} /> {genderLabel} • {birthYear && birthYear !== '-' ? (age ? t('tour_birth_year_with_age', { year: birthYear, age }) : t('tour_birth_year_only', { year: birthYear })) : '-'}
                                </Typography>
                              </Box>

                              {isLeaderOrCreator && (
                                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                  {!isRepresentative && (
                                    <Tooltip title={t('tour_tooltip_assign_vehicle_leader')}>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleAssignVehicleLeader(activeVehicleForPassengers._id, member._id)}
                                        disabled={actionLoading}
                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                      >
                                        {t('tour_btn_assign_vehicle_leader')}
                                      </Button>
                                    </Tooltip>
                                  )}
                                  <Tooltip title={t('tour_tooltip_unassign_seat')}>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveMemberFromVehicle(member._id)}
                                      disabled={actionLoading}
                                      sx={{
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.18) },
                                      }}
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
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_name')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_phone')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_gender')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_birth_year')}</TableCell>
                        {isLeaderOrCreator && <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="center">{t('col_action')}</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isLeaderOrCreator ? 5 : 4} align="center" sx={{ py: 3 }}>
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
                          const genderLabel = genderRaw === 'male' ? t('profile_male') : genderRaw === 'female' ? t('profile_female') : t('tour_gender_other');

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
                                          bgcolor: 'action.selected',
                                          color: 'text.secondary',
                                          fontWeight: 'bold',
                                          mt: 0.25
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </Stack>
                              </TableCell>
                              <TableCell>{phone || t('tour_no_phone_provided')}</TableCell>
                              <TableCell>{genderLabel}</TableCell>
                              <TableCell>{birthYear && birthYear !== '-' ? (age ? t('tour_birth_year_with_age', { year: birthYear, age }) : t('tour_birth_year_only', { year: birthYear })) : '-'}</TableCell>
                              {isLeaderOrCreator && (
                                <TableCell align="center">
                                  <Stack direction="row" spacing={1} justifyContent="center">
                                    {activeVehicleForPassengers.representative_id === member._id ? (
                                      <Chip label={t('tour_vehicle_leader')} color="primary" size="small" sx={{ fontWeight: 'bold', height: 24 }} />
                                    ) : (
                                      <Tooltip title={t('tour_tooltip_assign_vehicle_leader')}>
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
                                    <Tooltip title={t('tour_tooltip_unassign_seat')}>
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
          <Button onClick={() => setViewVehiclePassengersOpen(false)} color="primary" variant="contained" sx={{ borderRadius: 2 }}>
            {t('btn_close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: INVITE LINK */}
      {/* ========================================================================= */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
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
            background: accentGradient(theme),
            px: 3,
            py: 2.5,
            color: 'common.white',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LinkIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">{t('tour_invite_link_title')}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {t('tour_invite_link_tooltip')}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('tour_invite_link_desc', { tourName: tour?.name })}
          </Typography>

          {/* Link display box */}
          {(() => {
            const inviteToken = tour ? btoa(tour._id) : '';
            const inviteLink = `${window.location.origin}/join/${inviteToken}`;
            return (
              <Box>
                <Box
                  sx={{
                    bgcolor: 'action.hover',
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
                      bgcolor: inviteCopied ? 'success.main' : 'primary.main',
                      '&:hover': { bgcolor: inviteCopied ? 'success.dark' : 'primary.dark' },
                      transition: 'background-color 0.3s',
                    }}
                  >
                    {inviteCopied ? t('tour_copied') : t('tour_copy_link')}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<OpenInNewIcon />}
                    onClick={() => window.open(inviteLink, '_blank')}
                    sx={{ borderRadius: 2.5, borderColor: 'primary.main', color: 'primary.main' }}
                  >
                    {t('tour_open_link')}
                  </Button>
                </Stack>

                <Box
                  sx={{
                    mt: 2.5,
                    p: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.35),
                  }}
                >
                  <Typography variant="caption" color="warning.dark">
                    {t('invite_link_expires')}{' '}
                    <strong>
                      {tour ? new Date(tour.start_time).toLocaleString(localeCode, {
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
            onClick={() => setInviteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2.5 }}
          >
            {t('btn_close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: LEAVE TOUR */}
      {/* ========================================================================= */}
      <Dialog open={leaveDialogOpen} onClose={() => !actionLoading && setLeaveDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          {t('tour_leave_title')}
        </DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            {t('tour_leave_confirm')}
          </Typography>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          <TextField
            fullWidth
            label={t('tour_leave_reason_label')}
            variant="outlined"
            multiline
            rows={3}
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            disabled={actionLoading}
            required
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLeaveDialogOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('btn_cancel')}
          </Button>
          <Button onClick={handleLeaveTour} color="error" variant="contained" disabled={actionLoading}>
            {t('tour_leave_confirm_btn')}
          </Button>
        </DialogActions>
      </Dialog>
      <ExcelImportModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        tourId={id}
        onImportSuccess={fetchTourData}
      />
      <ContactFloatButton />
    </Box>
  );
}
