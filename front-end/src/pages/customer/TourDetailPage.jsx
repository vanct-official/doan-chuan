import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Card, CardContent, Grid, Chip, Button,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, LinearProgress, Stack, IconButton,
  Divider, Tooltip, Tabs, Tab, Avatar, AvatarGroup, Checkbox, FormControlLabel
} from '@mui/material';
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
import { useTranslation } from 'react-i18next';
import { tourService } from '../../services/tourService';
import { vehicleService } from '../../services/vehicleService';
import { membershipService } from '../../services/membershipService';
import { groupService } from '../../services/groupService';
import { authService } from '../../services/authService';
import { itineraryService } from '../../services/itineraryService';
import { attendanceService } from '../../services/attendanceService';
import ExcelImportModal from '../../components/ExcelImportModal';

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
  const { t } = useTranslation();

  const [tour, setTour] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await tourService.getTourById(id, statusFilter);
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
        setError(t('tour_not_found') || 'Không tìm thấy tour');
      }

      // Fetch groups associated with this tour
      const groupRes = await groupService.getGroupsByTour(id);
      if (groupRes.success) {
        setGroups(groupRes.groups || []);
      }
      
      // Fetch itineraries & attendances
      try {
        const itinRes = await itineraryService.getItinerariesByTour(id);
        setItineraries(itinRes || []);
        
        const attRes = await attendanceService.getAttendanceByTour(id);
        setTourAttendances(attRes || []);
      } catch (e) {
        console.error('Failed to fetch itineraries', e);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Lỗi khi tải thông tin chi tiết tour');
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
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const pad = (num) => String(num).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setTourForm({
      name: tour.name || '',
      start_time: formatDate(tour.start_time),
      end_time: formatDate(tour.end_time),
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
        start_time: tourForm.start_time,
        end_time: tourForm.end_time,
        max_capacity: Number(tourForm.max_capacity)
      });
      if (response.success) {
        setActionSuccess(t('msg_update_success'));
        fetchTourData();
        setTimeout(() => setEditTourOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi cập nhật tour');
    } finally {
      setActionLoading(false);
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
        if (!passengerForm.name.trim()) throw new Error('Vui lòng nhập họ tên hành khách!');
        if (!passengerForm.birth_year) throw new Error('Vui lòng nhập năm sinh!');

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
          throw new Error('Vui lòng nhập tên nhóm du lịch mới!');
        }

        // Validate all batch members have complete names and birth years
        batchMembers.forEach((member, i) => {
          if (!member.name.trim()) throw new Error(`Vui lòng nhập họ tên ở dòng số ${i + 1}!`);
          if (!member.birth_year) throw new Error(`Vui lòng nhập năm sinh ở dòng số ${i + 1}!`);
        });

        const batchPayload = {
          tour_id: id,
          members: batchMembers,
          group_name: newGroupSelected ? groupNameInput.trim() : undefined
        };

        const response = await membershipService.addMembersBatch(batchPayload);
        if (response.success) {
          setActionSuccess('Thêm nhóm hành khách thành công!');
          fetchTourData();
          setTimeout(() => setAddPassengerOpen(false), 1200);
        }
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi thêm hành khách');
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
        setActionSuccess('Cập nhật thông tin hành khách thành công!');
        fetchTourData();
        setTimeout(() => setEditPassengerOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi cập nhật hành khách');
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
      setActionError('Vui lòng nhập lý do rời tour');
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
        setActionError(res.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setActionError(err.response?.data?.error || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. DELETE PASSENGER HANDLER
  const handleDeletePassenger = async (memberId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hành khách này khỏi Tour?')) {
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      await membershipService.deleteMember(memberId);
      setActionSuccess('Xóa hành khách thành công!');
      fetchTourData();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi xóa hành khách');
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
      if (!vehicleForm.license_plate.trim()) throw new Error('Vui lòng nhập biển số xe!');
      if (!vehicleForm.seat_count || Number(vehicleForm.seat_count) <= 0) throw new Error('Số ghế phải lớn hơn 0!');

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
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi thêm phương tiện');
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
      if (!vehicleForm.license_plate.trim()) throw new Error('Vui lòng nhập biển số xe!');
      if (!vehicleForm.seat_count || Number(vehicleForm.seat_count) <= 0) throw new Error('Số ghế phải lớn hơn 0!');

      const response = await vehicleService.updateVehicle(selectedVehicle._id, {
        license_plate: vehicleForm.license_plate.trim().toUpperCase(),
        plate_color: vehicleForm.plate_color,
        seat_count: Number(vehicleForm.seat_count),
        driver_name: vehicleForm.driver_name.trim(),
        driver_phone: vehicleForm.driver_phone.trim()
      });

      if (response.vehicle) {
        setActionSuccess('Cập nhật thông tin xe thành công!');
        fetchTourData();
        setTimeout(() => setEditVehicleOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi cập nhật phương tiện');
    } finally {
      setActionLoading(false);
    }
  };

  // 7. DELETE VEHICLE HANDLER
  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phương tiện này? Toàn bộ hành khách đã xếp vào xe này sẽ được đưa về trạng thái Chưa xếp xe.')) {
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      await vehicleService.deleteVehicle(vehicleId);
      setActionSuccess('Xóa phương tiện thành công!');
      fetchTourData();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi xóa phương tiện');
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
      setActionError('Vui lòng chọn ít nhất một hành khách để xếp xe!');
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
      if (response) {
        setActionSuccess('Xếp xe cho nhóm hành khách thành công!');
        setSelectedUnassignedIds([]);
        setSelectedGroupIdFilter('none');
        setShowAddPassengerPanel(false);
        fetchTourData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi xếp xe hàng loạt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMemberFromVehicle = async (memberId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy xếp ghế xe cho hành khách này?')) {
      return;
    }
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const response = await membershipService.updateMember(memberId, { vehicle_id: null });
      if (response.success) {
        setActionSuccess('Hủy xếp xe cho hành khách thành công!');
        fetchTourData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi hủy xếp xe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignVehicleLeader = async (vehicleId, membershipId) => {
    if (!window.confirm('Bạn có chắc chắn muốn chỉ định khách này làm Trưởng xe?')) return;
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const response = await vehicleService.assignVehicleLeader(vehicleId, membershipId);
      if (response.success || response.message) {
        setActionSuccess('Chỉ định Trưởng xe thành công!');
        fetchTourData();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi chỉ định Trưởng xe');
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
      if (!assignSeatForm.membership_id) throw new Error('Vui lòng chọn hành khách!');
      if (!assignSeatForm.vehicle_id) throw new Error('Vui lòng chọn xe!');

      const response = await vehicleService.assignSeat(
        assignSeatForm.membership_id,
        assignSeatForm.vehicle_id
      );

      if (response.membership) {
        setActionSuccess(t('msg_assign_success'));
        fetchTourData();
        setTimeout(() => setAssignSeatOpen(false), 1200);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi xếp ghế xe');
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
          label="Đã rời"
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
      if (editItineraryId) {
        const res = await itineraryService.updateItinerary(editItineraryId, itineraryForm);
        setItineraries(itineraries.map(i => i._id === editItineraryId ? res.itinerary : i));
        setActionSuccess('Đã cập nhật lịch trình!');
      } else {
        const res = await itineraryService.createItinerary({ ...itineraryForm, tour_id: id });
        setItineraries([...itineraries, res.itinerary].sort((a, b) => new Date(a.date) - new Date(b.date)));
        setActionSuccess('Đã thêm lịch trình mới!');
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
    if (!window.confirm('Bạn có chắc chắn muốn xóa mốc lịch trình này? Các dữ liệu điểm danh liên quan có thể bị mất.')) return;
    try {
      await itineraryService.deleteItinerary(itineraryId);
      setItineraries(itineraries.filter(i => i._id !== itineraryId));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  // ─── ATTENDANCE HANDLERS ─────────────────────────────────────────────
  const handleOpenAttendance = async (itinerary) => {
    setSelectedItinerary(itinerary);
    
    // Find the current user's vehicle
    const myMembership = memberships.find(m => {
      const mUserId = m.user_id?._id || m.user_id;
      return mUserId === currentUserId && m.status !== 'left';
    });
    
    if (!myMembership || !myMembership.vehicle_id) {
      alert("Bạn chưa được xếp xe nên không thể điểm danh.");
      return;
    }
    
    setAttendanceModalOpen(true);
    
    try {
      const res = await attendanceService.getAttendance(itinerary._id, myMembership.vehicle_id);
      // Map API data to state format
      setAttendanceData(res.map(a => ({ membership_id: a.membership_id, status: a.status })));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải dữ liệu điểm danh cũ.");
    }
  };

  const handleToggleAttendance = (membershipId) => {
    const existing = attendanceData.find(a => a.membership_id === membershipId);
    let newStatus = 'present';
    if (existing) {
      newStatus = existing.status === 'present' ? 'absent' : 'present';
      setAttendanceData(attendanceData.map(a => a.membership_id === membershipId ? { ...a, status: newStatus } : a));
    } else {
      setAttendanceData([...attendanceData, { membership_id: membershipId, status: 'present' }]);
    }
  };

  const handleSaveAttendance = async () => {
    const myMembership = memberships.find(m => {
      const mUserId = m.user_id?._id || m.user_id;
      return mUserId === currentUserId && m.status !== 'left';
    });
    
    if (!myMembership || !myMembership.vehicle_id) return;
    
    // Fill in default 'present' for anyone not in attendanceData but on the vehicle
    const vehicleMembers = memberships.filter(m => m.vehicle_id === myMembership.vehicle_id && m.status !== 'left');
    const finalAttendance = vehicleMembers.map(m => {
      const existing = attendanceData.find(a => a.membership_id === m._id);
      return {
        membership_id: m._id,
        status: existing ? existing.status : 'absent' // default to absent if not marked
      };
    });

    setActionLoading(true);
    try {
      await attendanceService.markAttendanceBatch({
        itinerary_id: selectedItinerary._id,
        vehicle_id: myMembership.vehicle_id,
        attendances: finalAttendance
      });
      
      // Update local tourAttendances state
      const updatedTourAtts = tourAttendances.filter(a => !(a.itinerary_id === selectedItinerary._id && a.vehicle_id === myMembership.vehicle_id));
      const newAtts = finalAttendance.map(f => ({
        itinerary_id: selectedItinerary._id,
        vehicle_id: myMembership.vehicle_id,
        membership_id: f.membership_id,
        status: f.status
      }));
      setTourAttendances([...updatedTourAtts, ...newAtts]);

      setAttendanceModalOpen(false);
      alert("Đã lưu điểm danh thành công!");
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
            Quay lại
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!tour) return null;

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
              Bạn không có trong danh sách
            </Typography>
            <Typography color="text.secondary" mb={1}>
              Số điện thoại <strong>{currentUserPhone || '(chưa có)'}</strong> không có trong danh sách hành khách của tour này.
            </Typography>
            <Typography color="text.secondary" variant="body2" mb={3}>
              Liên hệ người tổ chức để được thêm vào danh sách, hoặc sử dụng link mời để đăng ký.
            </Typography>
            <Button
              variant="contained"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 3, fontWeight: 'bold', px: 3 }}
            >
              Quay lại danh sách Tour
            </Button>
          </Box>
        </Box>
      );
    }
  }

  return (
    <Box sx={{ py: 3, px: { xs: 1, md: 3 } }}>
      {/* Back navigation & Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={handleBack} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalOfferIcon fontSize="inherit" /> ID: {tour._id}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {t('tour_detail_title')}
          </Typography>
        </Box>
      </Stack>

      {/* Main Tour Banner Info Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 5,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          mb: 4,
          boxShadow: '0 20px 40px -14px rgba(0,0,0,0.25)',
        }}
      >
        <CardContent sx={{ p: { xs: 4, md: 5 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={tour.status === 'draft' ? t('status_draft') : t('status_published')}
                    color={tour.status === 'confirmed' ? 'success' : tour.status === 'draft' ? 'warning' : 'default'}
                    sx={{ fontWeight: 'bold', textTransform: 'uppercase', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
                  />
                  <Typography variant="body2" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EventIcon fontSize="inherit" />
                    {new Date(tour.start_time).toLocaleString()} - {new Date(tour.end_time).toLocaleString()}
                  </Typography>
                </Stack>

                <Typography variant="h3" sx={{ fontWeight: '800', lineHeight: 1.2 }}>
                  {tour.name}
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                        Người tạo Tour (Creator)
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {tour.created_by?.name || 'Hệ thống'}
                      </Typography>
                      {tour.created_by?.phone && (
                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="inherit" /> {tour.created_by.phone}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                        Trưởng Đoàn (Leader)
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {tour.leader_id?.name || 'Chưa phân công'}
                      </Typography>
                      {tour.leader_id?.phone && (
                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PhoneIcon fontSize="inherit" /> {tour.leader_id.phone}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Grid>

            {/* Sức chứa & Tiến độ */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 3, borderRadius: 3, backdropFilter: 'blur(10px)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon /> Sức chứa Tour
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {activeMembersCount} / {tour.max_capacity}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={tourOccupancyPercent}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#10b981',
                      borderRadius: 5
                    }
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8, textAlign: 'right' }}>
                  Đã sử dụng {tourOccupancyPercent}% sức chứa
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Action Row */}
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.15)' }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ flexWrap: 'wrap', gap: 2, '& > *': { ml: '0 !important', mb: '0 !important' } }}>
            {(() => {
              if (!currentUserId || isAdminPath) return null;
              const myMembership = memberships.find(m => {
                const mUserId = m.user_id?._id || m.user_id;
                return mUserId === currentUserId && m.status !== 'left';
              });
              if (!myMembership || !myMembership.vehicle_id) return null;
              const myVehicle = vehicles.find(v => v._id === myMembership.vehicle_id);
              if (!myVehicle) return null;
              
              return (
                <Button
                  variant="contained"
                  onClick={() => handleOpenViewVehiclePassengers(myVehicle)}
                  startIcon={<DirectionsCarIcon />}
                  sx={{
                    bgcolor: '#ef4444',
                    color: '#fff',
                    '&:hover': { bgcolor: '#dc2626' },
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    borderRadius: 4,
                    boxShadow: '0 4px 14px 0 rgba(239,68,68,0.39)'
                  }}
                >
                  Xem xe của tôi
                </Button>
              );
            })()}

            {isLeaderOrCreator && (
              <>
                <Button
                  variant="contained"
                  onClick={handleOpenEditTour}
                  startIcon={<EditIcon />}
                  sx={{
                    bgcolor: '#ffffff',
                    color: '#764ba2',
                    '&:hover': { bgcolor: '#f8f9fa' },
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    borderRadius: 4,
                    boxShadow: '0 4px 14px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  {t('btn_edit_tour')}
                </Button>

                <Button
                  variant="contained"
                  onClick={() => { setInviteCopied(false); setInviteDialogOpen(true); }}
                  startIcon={<LinkIcon />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    borderRadius: 4,
                    boxShadow: 'none'
                  }}
                >
                  Tạo link mời
                </Button>
              </>
            )}

            {!isAdminPath && (
              <>
                <Button
                  variant="contained"
                  onClick={handleOpenAddPassenger}
                  startIcon={<PersonAddIcon />}
                  sx={{
                    bgcolor: '#10b981',
                    color: '#fff',
                    '&:hover': { bgcolor: '#059669' },
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    borderRadius: 4,
                    boxShadow: '0 4px 14px 0 rgba(16,185,129,0.39)'
                  }}
                >
                  {t('btn_add_passenger')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setExcelModalOpen(true)}
                  startIcon={<FormatListBulletedIcon />}
                  sx={{
                    bgcolor: '#8b5cf6',
                    color: '#fff',
                    '&:hover': { bgcolor: '#7c3aed' },
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    borderRadius: 4,
                    boxShadow: '0 4px 14px 0 rgba(139,92,246,0.39)'
                  }}
                >
                  Thêm bằng Excel
                </Button>
              </>
            )}

            {isLeaderOrCreator && (
              <>
                <Button
                  variant="contained"
                  onClick={handleOpenAddVehicle}
                  startIcon={<DirectionsCarIcon />}
                  sx={{
                    bgcolor: '#f59e0b',
                    color: '#fff',
                    '&:hover': { bgcolor: '#d97706' },
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    borderRadius: 4,
                    boxShadow: '0 4px 14px 0 rgba(245,158,11,0.39)'
                  }}
                >
                  {t('btn_add_vehicle')}
                </Button>

                <Button
                  variant="contained"
                  onClick={handleOpenAssignSeat}
                  disabled={unassignedMembers.length === 0 || vehicles.length === 0}
                  startIcon={<AirlineSeatReclineNormalIcon />}
                  sx={{
                    bgcolor: '#0ea5e9',
                    color: '#fff',
                    '&:hover': { bgcolor: '#0284c7' },
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.2,
                    borderRadius: 4,
                    boxShadow: '0 4px 14px 0 rgba(14,165,233,0.39)'
                  }}
                >
                  {t('btn_assign_seat')}
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Main Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem', textTransform: 'none', py: 2 },
            '& .Mui-selected': { color: 'primary.main' }
          }}
        >
          <Tab icon={<PeopleIcon />} iconPosition="start" label="Hành khách & Phương tiện" />
          <Tab icon={<MapIcon />} iconPosition="start" label="Lịch trình & Điểm danh" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
      <Grid container spacing={4}>
        {/* Left column: Passengers List */}
        <Grid item xs={12} lg={7}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="primary" /> {t('passengers_list')}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                placeholder="Tìm tên, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: 1 }}
              />
              <Select
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{ height: 32, fontSize: '0.875rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.875rem' }}>Đang tham gia</MenuItem>
                <MenuItem value="left" sx={{ fontSize: '0.875rem' }}>Đã rời</MenuItem>
                <MenuItem value="all" sx={{ fontSize: '0.875rem' }}>Tất cả</MenuItem>
              </Select>
              <Chip label={`${memberships.length} người`} color="primary" size="small" variant="outlined" />
            </Stack>
          </Box>

          {/* Desktop/Tablet Table View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('col_name')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('col_phone')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Giới tính</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Năm sinh</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Loại khách</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('col_role')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('col_status')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Xe xếp</TableCell>
                    {showActionColumn && <TableCell sx={{ fontWeight: 'bold' }} align="center">{t('col_action')}</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    const filteredMemberships = memberships.filter(m => {
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase().trim();
                      const isGuest = !m.user_id;
                      const name = (isGuest ? m.guest_info?.name : m.user_id?.name) || '';
                      const phone = (isGuest ? m.guest_info?.phone : m.user_id?.phone) || '';
                      return name.toLowerCase().includes(query) || phone.toLowerCase().includes(query);
                    });

                    if (filteredMemberships.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={showActionColumn ? 9 : 8} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">{t('no_passengers')}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return filteredMemberships.map((member) => {
                      const isGuest = !member.user_id;
                      const name = isGuest ? member.guest_info?.name : member.user_id?.name;
                      const phone = isGuest ? member.guest_info?.phone : member.user_id?.phone;
                      const birthYear = isGuest ? member.guest_info?.birth_year : (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : '-');
                      const genderRaw = isGuest ? member.guest_info?.gender : (member.user_id?.gender === true ? 'true' : member.user_id?.gender === false ? 'false' : '');
                      const genderLabel = (genderRaw === 'male' || String(genderRaw) === 'true') ? 'Nam' : (genderRaw === 'female' || String(genderRaw) === 'false') ? 'Nữ' : 'Khác';
                      const assignedVehicle = vehicles.find(v => v._id === member.vehicle_id);

                      const passengerGroupId = member.group_id?._id || member.group_id;
                      const groupObj = groups.find(g => g._id === passengerGroupId);

                      return (
                        <TableRow key={member._id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Avatar {...stringAvatar(name || 'Unknown')} sx={{ ...stringAvatar(name || 'Unknown').sx, width: 32, height: 32, fontSize: '0.875rem' }} />
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                                    {name}
                                  </Typography>
                                  {isGuest && (
                                    <Chip
                                      label="GUEST"
                                      size="small"
                                      sx={{
                                        fontSize: '0.6rem',
                                        height: 16,
                                        bgcolor: '#eceff1',
                                        color: '#37474f',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>{phone || 'Chưa cung cấp SĐT'}</TableCell>
                          <TableCell>{genderLabel}</TableCell>
                          <TableCell>{birthYear || '-'}</TableCell>
                          <TableCell>{member.customer_type === 'child' ? 'Trẻ em' : member.customer_type === 'elderly' ? 'Người già' : 'Người lớn'}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {getRoleChip(member.role)}
                              {member.is_driver && (
                                <Chip
                                  label="TÀI XẾ"
                                  color="info"
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 22, fontWeight: 'bold' }}
                                />
                              )}
                              {assignedVehicle && String(assignedVehicle.representative_id?._id || assignedVehicle.representative_id) === String(member._id) && (
                                <Chip
                                  label="TRƯỞNG XE"
                                  color="secondary"
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 22, fontWeight: 'bold' }}
                                />
                              )}
                              {groupObj && (
                                <Chip
                                  icon={<GroupsIcon sx={{ fontSize: '0.8rem !important' }} />}
                                  label={groupObj.name}
                                  color="primary"
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 22 }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{getStatusChip(member.status)}</TableCell>
                          <TableCell>
                            {assignedVehicle ? renderLicensePlate(assignedVehicle.license_plate, assignedVehicle.plate_color) : (
                              <Chip
                                label={t('seat_unassigned')}
                                color="default"
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          {showActionColumn && (
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                {isLeaderOrCreator && (
                                  <>
                                    <Tooltip title="Sửa thông tin">
                                      <IconButton size="small" color="primary" onClick={() => handleOpenEditPassenger(member)}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xóa khách khỏi tour">
                                      <IconButton size="small" color="error" onClick={() => handleDeletePassenger(member._id)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                                {canLeave(member) && (
                                  <Tooltip title="Rời tour">
                                    <IconButton size="small" color="warning" onClick={() => handleOpenLeaveDialog(member)}>
                                      <ExitToAppIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    });
                  })()}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile Card View */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2}>
              {(() => {
                const filteredMemberships = memberships.filter(m => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase().trim();
                  const isGuest = !m.user_id;
                  const name = (isGuest ? m.guest_info?.name : m.user_id?.name) || '';
                  const phone = (isGuest ? m.guest_info?.phone : m.user_id?.phone) || '';
                  return name.toLowerCase().includes(query) || phone.toLowerCase().includes(query);
                });

                if (filteredMemberships.length === 0) {
                  return (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                      <Typography color="text.secondary">{t('no_passengers')}</Typography>
                    </Paper>
                  );
                }

                return filteredMemberships.map((member) => {
                  const isGuest = !member.user_id;
                  const name = isGuest ? member.guest_info?.name : member.user_id?.name;
                  const phone = isGuest ? member.guest_info?.phone : member.user_id?.phone;
                  const birthYear = isGuest ? member.guest_info?.birth_year : (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : '-');
                  const genderRaw = isGuest ? member.guest_info?.gender : (member.user_id?.gender === true ? 'true' : member.user_id?.gender === false ? 'false' : '');
                  const genderLabel = (genderRaw === 'male' || String(genderRaw) === 'true') ? 'Nam' : (genderRaw === 'female' || String(genderRaw) === 'false') ? 'Nữ' : 'Khác';
                  const assignedVehicle = vehicles.find(v => v._id === member.vehicle_id);

                  const passengerGroupId = member.group_id?._id || member.group_id;
                  const groupObj = groups.find(g => g._id === passengerGroupId);

                  return (
                    <Card key={member._id} variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', mb: 2 }}>
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar {...stringAvatar(name || 'Unknown')} sx={{ ...stringAvatar(name || 'Unknown').sx, width: 46, height: 46, fontSize: '1.2rem', fontWeight: 'medium' }} />
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={1} mb={0.25}>
                                <Typography sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'text.primary' }}>
                                  {name}
                                </Typography>
                                {isGuest && (
                                  <Chip
                                    label="GUEST"
                                    size="small"
                                    sx={{ fontSize: '0.6rem', height: 18, bgcolor: '#eceff1', color: '#37474f', fontWeight: 'bold' }}
                                  />
                                )}
                              </Stack>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <PhoneIcon sx={{ fontSize: '0.85rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {phone || 'Chưa cung cấp SĐT'}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                          <Box sx={{ mt: 0.5 }}>
                            {getStatusChip(member.status)}
                          </Box>
                        </Stack>

                        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

                        <Grid container spacing={1.5} mb={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500 }}>
                              Giới tính / Năm sinh
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                              {genderLabel} • {birthYear || '-'} • {member.customer_type === 'child' ? 'Trẻ em' : member.customer_type === 'elderly' ? 'Người già' : 'Người lớn'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500 }}>
                              Vai trò & Vai vế
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {getRoleChip(member.role)}
                              {member.is_driver && (
                                <Chip
                                  label="TÀI XẾ" color="info" size="small" variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20, fontWeight: 'bold' }}
                                />
                              )}
                              {assignedVehicle && String(assignedVehicle.representative_id?._id || assignedVehicle.representative_id) === String(member._id) && (
                                <Chip
                                  label="TRƯỞNG XE" color="secondary" size="small" variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20, fontWeight: 'bold' }}
                                />
                              )}
                              {groupObj && (
                                <Chip
                                  icon={<GroupsIcon sx={{ fontSize: '0.7rem !important' }} />}
                                  label={groupObj.name} color="primary" size="small" variant="outlined"
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              )}
                            </Stack>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 500 }}>
                              Xe đã xếp
                            </Typography>
                            {assignedVehicle ? (
                              <Box>
                                {renderLicensePlate(assignedVehicle.license_plate, assignedVehicle.plate_color)}
                              </Box>
                            ) : (
                              <Chip label={t('seat_unassigned')} color="default" size="small" variant="outlined" sx={{ height: 24, fontSize: '0.75rem' }} />
                            )}
                          </Grid>
                        </Grid>

                        {showActionColumn && (
                          <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {isLeaderOrCreator && (
                              <>
                                <Button
                                  size="small" variant="outlined" color="primary"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleOpenEditPassenger(member)}
                                >
                                  Sửa
                                </Button>
                                <Button
                                  size="small" variant="outlined" color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleDeletePassenger(member._id)}
                                >
                                  Xóa
                                </Button>
                              </>
                            )}
                            {canLeave(member) && (
                              <Button
                                size="small" variant="contained" color="warning"
                                startIcon={<ExitToAppIcon />}
                                onClick={() => handleOpenLeaveDialog(member)}
                              >
                                Rời tour
                              </Button>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                });
              })()}
            </Stack>
          </Box>
        </Grid>

        {/* Right column: Vehicles List */}
        <Grid item xs={12} lg={5}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCarIcon color="warning" /> {t('vehicles_list')}
            </Typography>
            <Chip label={`${vehicles.length} xe`} color="warning" size="small" variant="outlined" />
          </Box>

          <Stack spacing={2.5}>
            {(() => {
              const myMembership = currentUserId ? memberships.find(m => {
                const mUserId = m.user_id?._id || m.user_id;
                return mUserId === currentUserId && m.status !== 'left';
              }) : null;
              const myVehicleId = myMembership?.vehicle_id;
              
              const visibleVehicles = isLeaderOrCreator || isAdminPath
                ? vehicles
                : vehicles.filter(v => v._id === myVehicleId);

              if (visibleVehicles.length === 0) {
                return (
                  <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                    <Typography color="text.secondary">
                      {isLeaderOrCreator || isAdminPath ? t('no_vehicles') : 'Bạn chưa được phân công vào xe nào.'}
                    </Typography>
                  </Paper>
                );
              }

              return visibleVehicles.map((vehicle) => {
                const assignedCount = memberships.filter(m => m.vehicle_id === vehicle._id && m.status !== 'left').length;
                const vehicleOccupancyPercent = Math.min(100, Math.round((assignedCount / vehicle.seat_count) * 100));

                return (
                  <Card key={vehicle._id} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', '&:hover': { boxShadow: 3 } }}>
                    {/* Full Width Prominent License Plate */}
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', display: 'flex', justifyContent: 'center' }}>
                      {renderLicensePlate(vehicle.license_plate, vehicle.plate_color, true)}
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            Tài xế: {vehicle.driver_name || 'Không rõ'}
                          </Typography>
                          {vehicle.driver_phone && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              SĐT: {vehicle.driver_phone}
                            </Typography>
                          )}
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {assignedCount} / {vehicle.seat_count} {t('capacity_seats')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Còn {vehicle.seat_count - assignedCount} chỗ trống
                          </Typography>

                          {/* Action Buttons for Edit & Delete Vehicle — leader/creator only */}
                          {isLeaderOrCreator && (
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ mt: 1 }}>
                              <Tooltip title="Sửa thông tin xe">
                                <IconButton size="small" color="primary" onClick={() => handleOpenEditVehicle(vehicle)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa phương tiện">
                                <IconButton size="small" color="error" onClick={() => handleDeleteVehicle(vehicle._id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )}
                        </Box>
                      </Stack>

                      <LinearProgress
                        variant="determinate"
                        value={vehicleOccupancyPercent}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: vehicleOccupancyPercent >= 90 ? 'error.main' : vehicleOccupancyPercent >= 50 ? 'warning.main' : 'success.main'
                          }
                        }}
                      />

                      {/* View passengers on vehicle action */}
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<PeopleIcon />}
                        onClick={() => handleOpenViewVehiclePassengers(vehicle)}
                        sx={{ mt: 2.5, borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Xem hành khách trên xe
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            })()}
          </Stack>
        </Grid>
      </Grid>
      )}

      {activeTab === 1 && (
        <Box sx={{ minHeight: '50vh' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon color="primary" /> Quản lý Lịch trình
            </Typography>
            {isLeaderOrCreator && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => {
                  setEditItineraryId(null);
                  setItineraryForm({ date: '', location: '', activity: '' });
                  setItineraryModalOpen(true);
                }}
                sx={{ borderRadius: 3, fontWeight: 'bold' }}
              >
                Thêm mốc lịch trình
              </Button>
            )}
          </Box>
          
          {itineraries.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'rgba(255,255,255,0.5)' }} elevation={0}>
              <MapIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary">Chưa có mốc lịch trình nào</Typography>
              <Typography variant="body2" color="text.secondary">Tour này hiện chưa có thông tin lịch trình để điểm danh.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {itineraries.map((itinerary, index) => (
                <Grid item xs={12} md={6} lg={4} key={itinerary._id}>
                  <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: 6, height: '100%', bgcolor: 'primary.main', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }} />
                    <CardContent sx={{ p: 3, pl: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="overline" color="primary" sx={{ fontWeight: 'bold' }}>Mốc {index + 1}</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{new Date(itinerary.date).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}</Typography>
                      <Typography variant="body1" sx={{ mb: 1, display: 'flex', gap: 1 }}><strong style={{ minWidth: 80 }}>Địa điểm:</strong> {itinerary.location}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2, display: 'flex', gap: 1 }}><strong style={{ minWidth: 80, color: '#333' }}>Hoạt động:</strong> {itinerary.activity}</Typography>
                      
                      {vehicles.length > 0 && (
                        <Box sx={{ mt: 1, mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>Tiến độ điểm danh:</Typography>
                          <Stack spacing={0.5}>
                            {vehicles.map(vehicle => {
                              const vehicleMembersCount = memberships.filter(m => m.vehicle_id === vehicle._id && m.status !== 'left').length;
                              if (vehicleMembersCount === 0) return null;
                              
                              const presentCount = tourAttendances.filter(a => a.itinerary_id === itinerary._id && a.vehicle_id === vehicle._id && a.status === 'present').length;
                              const isComplete = presentCount === vehicleMembersCount;
                              
                              return (
                                <Box key={vehicle._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isComplete ? 'rgba(76, 175, 80, 0.1)' : 'grey.100', px: 1.5, py: 0.5, borderRadius: 1.5, border: '1px solid', borderColor: isComplete ? 'success.light' : 'transparent' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 'medium', color: isComplete ? 'success.dark' : 'text.primary' }}>
                                    <DirectionsCarIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5, mb: 0.2 }} />
                                    {vehicle.license_plate}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: isComplete ? 'success.main' : 'text.secondary' }}>
                                    {presentCount}/{vehicleMembersCount}
                                  </Typography>
                                </Box>
                              )
                            })}
                          </Stack>
                        </Box>
                      )}

                      <Divider sx={{ my: 2 }} />
                      
                      <Stack direction="row" spacing={1} justifyContent="space-between">
                        <Button 
                          variant="contained" 
                          size="small" 
                          color="secondary" 
                          onClick={() => handleOpenAttendance(itinerary)}
                          sx={{ borderRadius: 2, fontWeight: 'bold' }}
                        >
                          Điểm danh
                        </Button>
                        
                        {isLeaderOrCreator && (
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" color="primary" onClick={() => {
                              setEditItineraryId(itinerary._id);
                              // format for datetime-local input
                              const dt = new Date(itinerary.date);
                              dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
                              setItineraryForm({
                                date: dt.toISOString().slice(0, 16),
                                location: itinerary.location,
                                activity: itinerary.activity
                              });
                              setItineraryModalOpen(true);
                            }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteItinerary(itinerary._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* ========================================================================= */}
      {/* MODAL 0A: EDIT/ADD ITINERARY */}
      {/* ========================================================================= */}
      <Dialog open={itineraryModalOpen} onClose={() => !actionLoading && setItineraryModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {editItineraryId ? 'Cập nhật mốc lịch trình' : 'Thêm mốc lịch trình mới'}
        </DialogTitle>
        <DialogContent>
          <form id="itineraryForm" onSubmit={handleSaveItinerary}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Thời gian"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={itineraryForm.date}
              onChange={(e) => setItineraryForm({ ...itineraryForm, date: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Địa điểm"
              placeholder="VD: Cổng Công viên Thống Nhất"
              value={itineraryForm.location}
              onChange={(e) => setItineraryForm({ ...itineraryForm, location: e.target.value })}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              rows={3}
              label="Hoạt động"
              placeholder="VD: Tập trung lên xe, ăn sáng..."
              value={itineraryForm.activity}
              onChange={(e) => setItineraryForm({ ...itineraryForm, activity: e.target.value })}
            />
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setItineraryModalOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            Hủy
          </Button>
          <Button type="submit" form="itineraryForm" variant="contained" color="primary" disabled={actionLoading}>
            {actionLoading ? '...' : 'Lưu lại'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 0B: ATTENDANCE */}
      {/* ========================================================================= */}
      <Dialog open={attendanceModalOpen} onClose={() => !actionLoading && setAttendanceModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 600, width: '100%' } }}>
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
            const myMembership = memberships.find(m => {
              const mUserId = m.user_id?._id || m.user_id;
              return mUserId === currentUserId && m.status !== 'left';
            });
            if (!myMembership || !myMembership.vehicle_id) return <Typography>Không tìm thấy xe của bạn.</Typography>;
            
            const vehicleMembers = memberships.filter(m => m.vehicle_id === myMembership.vehicle_id && m.status !== 'left');
            if (vehicleMembers.length === 0) return <Typography>Không có hành khách nào trên xe này.</Typography>;
            
            return (
              <Stack spacing={2}>
                {vehicleMembers.map(member => {
                  const name = member.user_id?.name || member.guest_info?.name || 'Không rõ';
                  const phone = member.user_id?.phone || member.guest_info?.phone || '';
                  const attendanceRec = attendanceData.find(a => a.membership_id === member._id);
                  const isPresent = attendanceRec ? attendanceRec.status === 'present' : false;
                  
                  return (
                    <Paper key={member._id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2, borderColor: isPresent ? 'success.light' : 'error.light', bgcolor: isPresent ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)' }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar {...stringAvatar(name)} sx={{ ...stringAvatar(name).sx, width: 40, height: 40 }} />
                        <Box>
                          <Typography variant="body1" fontWeight="bold">{name}</Typography>
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
                            size="large"
                          />
                        }
                        label={isPresent ? "Có mặt" : "Vắng"}
                        labelPlacement="start"
                        sx={{ m: 0, '& .MuiFormControlLabel-label': { fontWeight: 'bold', color: isPresent ? 'success.main' : 'error.main', mr: 1 } }}
                      />
                    </Paper>
                  );
                })}
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAttendanceModalOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            Đóng
          </Button>
          <Button onClick={handleSaveAttendance} variant="contained" color="secondary" disabled={actionLoading}>
            {actionLoading ? 'Đang lưu...' : 'Lưu Điểm danh'}
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
            <Tab label="Thêm một người" value="single" sx={{ fontWeight: 'bold' }} />
            <Tab label="Thêm cả nhóm (Nhiều người)" value="batch" sx={{ fontWeight: 'bold' }} />
          </Tabs>

          <form id="addPassengerForm" onSubmit={handleAddPassengerSubmit}>
            {addPassengerMode === 'single' ? (
              <>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Số điện thoại"
                  placeholder="Ví dụ: 0987654321"
                  value={passengerForm.phone}
                  onChange={handlePassengerPhoneChange}
                  autoFocus
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Họ tên hành khách"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={passengerForm.name}
                  onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })}
                  InputProps={{
                    readOnly: !!passengerForm.user_id,
                  }}
                  helperText={passengerForm.user_id ? "Tài khoản liên kết từ hệ thống" : ""}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      label="Năm sinh"
                      type="number"
                      placeholder="Ví dụ: 1995"
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
                      <InputLabel>Giới tính</InputLabel>
                      <Select
                        value={passengerForm.gender}
                        label="Giới tính"
                        onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                        inputProps={{
                          readOnly: !!passengerForm.user_id,
                        }}
                      >
                        <MenuItem value="male">Nam</MenuItem>
                        <MenuItem value="female">Nữ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin="normal" required>
                      <InputLabel>Loại khách</InputLabel>
                      <Select
                        value={passengerForm.customer_type}
                        label="Loại khách"
                        onChange={(e) => setPassengerForm({ ...passengerForm, customer_type: e.target.value })}
                      >
                        <MenuItem value="adult">Người lớn</MenuItem>
                        <MenuItem value="child">Trẻ em</MenuItem>
                        <MenuItem value="elderly">Người già</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Nhóm du lịch (Đại diện đoàn)</InputLabel>
                  <Select
                    value={newGroupSelected ? 'new' : passengerForm.group_id || 'none'}
                    label="Nhóm du lịch (Đại diện đoàn)"
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
                    <MenuItem value="none">Không thuộc nhóm (Thành viên độc lập)</MenuItem>
                    {groups.map((g) => (
                      <MenuItem key={g._id} value={g._id}>
                        {g.name} (Đại diện: {g.representative_id?.user_id?.name || g.representative_id?.guest_info?.name || 'Chưa phân'})
                      </MenuItem>
                    ))}
                    <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      + Tạo nhóm mới & làm đại diện đoàn
                    </MenuItem>
                  </Select>
                </FormControl>

                {newGroupSelected && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Tên nhóm mới"
                    placeholder="Ví dụ: Nhóm gia đình A"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                  />
                )}

                <FormControl fullWidth margin="normal">
                  <InputLabel>Vai trò hành khách</InputLabel>
                  <Select
                    value={newGroupSelected ? 'group_rep' : passengerForm.role || 'member'}
                    label="Vai trò hành khách"
                    onChange={(e) => setPassengerForm({ ...passengerForm, role: e.target.value })}
                    disabled={newGroupSelected}
                  >
                    <MenuItem value="member">Thành viên thường (Member)</MenuItem>
                    <MenuItem value="group_rep">Đại diện đoàn (Group Rep)</MenuItem>
                    <MenuItem value="vehicle_rep">Đại diện xe (Vehicle Rep)</MenuItem>
                    <MenuItem value="driver">Tài xế (Driver)</MenuItem>
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
                    Đồng thời là Tài xế (Driver) của đoàn
                  </Typography>
                </Box>
              </>
            ) : (
              // BATCH MODE: Add many passengers at once
              <Box>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Chọn phân nhóm</InputLabel>
                  <Select
                    value={newGroupSelected ? 'new' : 'none'}
                    label="Chọn phân nhóm"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'new') {
                        setNewGroupSelected(true);
                      } else {
                        setNewGroupSelected(false);
                      }
                    }}
                  >
                    <MenuItem value="none">Không lập nhóm mới (Các thành viên riêng lẻ)</MenuItem>
                    <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      + Tạo một Nhóm mới chung cho tất cả thành viên này
                    </MenuItem>
                  </Select>
                </FormControl>

                {newGroupSelected && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Tên nhóm mới"
                    placeholder="Ví dụ: Đoàn du lịch Hà Nội"
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    helperText="Người đầu tiên trong danh sách dưới đây sẽ tự động làm Đại diện đoàn (Group Representative)"
                  />
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Danh sách thành viên đăng ký:
                </Typography>

                {batchMembers.map((member, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 3, position: 'relative' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Thành viên #{index + 1} {index === 0 && newGroupSelected ? "(Đại diện đoàn)" : ""}
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
                            Là tài xế
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
                          label="Số điện thoại"
                          placeholder="Ví dụ: 098..."
                          value={member.phone}
                          onChange={(e) => handlePassengerPhoneChangeBatch(index, e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label="Họ và Tên"
                          placeholder="Nguyễn Văn A"
                          value={member.name}
                          onChange={(e) => {
                            const updated = [...batchMembers];
                            updated[index].name = e.target.value;
                            setBatchMembers(updated);
                          }}
                          InputProps={{
                            readOnly: !!member.user_id,
                          }}
                          helperText={member.user_id ? "Đã liên kết" : ""}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4} md={2}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label="Năm sinh"
                          type="number"
                          placeholder="1990"
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
                          <InputLabel>Giới tính</InputLabel>
                          <Select
                            value={member.gender}
                            label="Giới tính"
                            onChange={(e) => {
                              const updated = [...batchMembers];
                              updated[index].gender = e.target.value;
                              setBatchMembers(updated);
                            }}
                            inputProps={{
                              readOnly: !!member.user_id,
                            }}
                          >
                            <MenuItem value="male">Nam</MenuItem>
                            <MenuItem value="female">Nữ</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth size="small" required>
                          <InputLabel>Loại khách</InputLabel>
                          <Select
                            value={member.customer_type}
                            label="Loại khách"
                            onChange={(e) => {
                              const updated = [...batchMembers];
                              updated[index].customer_type = e.target.value;
                              setBatchMembers(updated);
                            }}
                          >
                            <MenuItem value="adult">Người lớn</MenuItem>
                            <MenuItem value="child">Trẻ em</MenuItem>
                            <MenuItem value="elderly">Người già</MenuItem>
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
                  Thêm thành viên khác
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
          Chỉnh sửa thông tin hành khách
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
          <form id="editPassengerForm" onSubmit={handleEditPassengerSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label="Số điện thoại"
              value={passengerForm.phone}
              disabled
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Họ tên hành khách"
              value={passengerForm.name}
              onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })}
              InputProps={{
                readOnly: !!passengerForm.user_id,
              }}
              helperText={passengerForm.user_id ? "Tài khoản liên kết từ hệ thống" : ""}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Năm sinh"
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
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    value={passengerForm.gender}
                    label="Giới tính"
                    onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                    inputProps={{
                      readOnly: !!passengerForm.user_id,
                    }}
                  >
                    <MenuItem value="male">Nam</MenuItem>
                    <MenuItem value="female">Nữ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Loại khách</InputLabel>
                  <Select
                    value={passengerForm.customer_type}
                    label="Loại khách"
                    onChange={(e) => setPassengerForm({ ...passengerForm, customer_type: e.target.value })}
                  >
                    <MenuItem value="adult">Người lớn</MenuItem>
                    <MenuItem value="child">Trẻ em</MenuItem>
                    <MenuItem value="elderly">Người già</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Group assignment and role on edit */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Nhóm du lịch (Đại diện đoàn)</InputLabel>
              <Select
                value={newGroupSelected ? 'new' : passengerForm.group_id || 'none'}
                label="Nhóm du lịch (Đại diện đoàn)"
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
                <MenuItem value="none">Không thuộc nhóm (Thành viên độc lập)</MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g._id} value={g._id}>
                    {g.name} (Đại diện: {g.representative_id?.user_id?.name || g.representative_id?.guest_info?.name || 'Chưa phân'})
                  </MenuItem>
                ))}
                <MenuItem value="new" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  + Tạo nhóm mới & làm đại diện đoàn
                </MenuItem>
              </Select>
            </FormControl>

            {newGroupSelected && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Tên nhóm mới"
                placeholder="Ví dụ: Nhóm gia đình A"
                value={groupNameInput}
                onChange={(e) => setGroupNameInput(e.target.value)}
              />
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Vai trò hành khách</InputLabel>
              <Select
                value={newGroupSelected ? 'group_rep' : passengerForm.role || 'member'}
                label="Vai trò hành khách"
                onChange={(e) => setPassengerForm({ ...passengerForm, role: e.target.value })}
                disabled={newGroupSelected}
              >
                <MenuItem value="member">Thành viên thường (Member)</MenuItem>
                <MenuItem value="group_rep">Đại diện đoàn (Group Rep)</MenuItem>
                <MenuItem value="vehicle_rep">Đại diện xe (Vehicle Rep)</MenuItem>
                <MenuItem value="driver">Tài xế (Driver)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="isDriverCheckboxEdit"
                checked={passengerForm.is_driver}
                onChange={(e) => setPassengerForm({ ...passengerForm, is_driver: e.target.checked })}
                style={{ marginRight: 8, transform: 'scale(1.2)', cursor: 'pointer' }}
              />
              <Typography variant="body2" component="label" htmlFor="isDriverCheckboxEdit" sx={{ cursor: 'pointer', fontWeight: 'bold', color: 'primary.main' }}>
                Đồng thời là Tài xế (Driver) của đoàn
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
                <MenuItem value="white">Trắng (Xe cá nhân/doanh nghiệp)</MenuItem>
                <MenuItem value="yellow">Vàng (Xe kinh doanh vận tải)</MenuItem>
                <MenuItem value="blue">Xanh (Xe công vụ)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('seat_count')}
              type="number"
              placeholder="Ví dụ: 7, 16, 29, 45"
              value={vehicleForm.seat_count}
              onChange={(e) => setVehicleForm({ ...vehicleForm, seat_count: e.target.value })}
              inputProps={{ min: 1 }}
            />

            {/* Chọn tài xế từ danh sách hành khách */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Chọn tài xế từ danh sách hành khách</InputLabel>
              <Select
                value={vehicleForm._selectedDriverId || ''}
                label="Chọn tài xế từ danh sách hành khách"
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
                <MenuItem value=""><em>-- Nhập tay bên dưới --</em></MenuItem>
                {memberships.map((m) => {
                  const name = m.user_id?.name || m.guest_info?.name || 'Không rõ';
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
              placeholder="Ví dụ: Nguyễn Văn B"
              value={vehicleForm.driver_name}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driver_name: e.target.value, _selectedDriverId: '' })}
            />

            <TextField
              margin="normal"
              fullWidth
              label={t('driver_phone')}
              placeholder="Ví dụ: 0912345678"
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
          Cập nhật thông tin phương tiện
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
                <MenuItem value="white">Trắng (Xe cá nhân/doanh nghiệp)</MenuItem>
                <MenuItem value="yellow">Vàng (Xe kinh doanh vận tải)</MenuItem>
                <MenuItem value="blue">Xanh (Xe công vụ)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              label={t('seat_count')}
              type="number"
              placeholder="Ví dụ: 7, 16, 29, 45"
              value={vehicleForm.seat_count}
              onChange={(e) => setVehicleForm({ ...vehicleForm, seat_count: e.target.value })}
              inputProps={{ min: 1 }}
            />

            {/* Chọn tài xế từ danh sách hành khách */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Chọn tài xế từ danh sách hành khách</InputLabel>
              <Select
                value={vehicleForm._selectedDriverId || ''}
                label="Chọn tài xế từ danh sách hành khách"
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
                <MenuItem value=""><em>-- Nhập tay bên dưới --</em></MenuItem>
                {memberships.map((m) => {
                  const name = m.user_id?.name || m.guest_info?.name || 'Không rõ';
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
              placeholder="Ví dụ: Nguyễn Văn B"
              value={vehicleForm.driver_name}
              onChange={(e) => setVehicleForm({ ...vehicleForm, driver_name: e.target.value, _selectedDriverId: '' })}
            />

            <TextField
              margin="normal"
              fullWidth
              label={t('driver_phone')}
              placeholder="Ví dụ: 0912345678"
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
                  <MenuItem disabled>Tất cả hành khách đã được xếp xe!</MenuItem>
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
                  <MenuItem disabled>Chưa có phương tiện nào trong Tour!</MenuItem>
                ) : (
                  vehicles.map((vehicle) => {
                    const assignedCount = memberships.filter(m => m.vehicle_id === vehicle._id && m.status !== 'left').length;
                    const isFull = assignedCount >= vehicle.seat_count;

                    return (
                      <MenuItem key={vehicle._id} value={vehicle._id} disabled={isFull}>
                        {vehicle.license_plate} - Trống {vehicle.seat_count - assignedCount}/{vehicle.seat_count} chỗ {isFull ? '(ĐÃ ĐẦY)' : ''}
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
                Hành khách trên xe:
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
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                Chọn hành khách chưa xếp xe:
              </Typography>
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
                                  <PersonAddIcon fontSize="small" sx={{ opacity: 0.7 }} /> {genderLabel} • Sinh năm: {birthYear}
                                </Typography>
                              </Box>

                              {isLeaderOrCreator && (
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
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Họ tên</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Số điện thoại</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Giới tính</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Năm sinh</TableCell>
                        {isLeaderOrCreator && <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="center">Thao tác</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isLeaderOrCreator ? 5 : 4} align="center" sx={{ py: 3 }}>
                            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Chưa có hành khách nào được xếp lên xe này.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').map((member) => {
                          const isGuest = !member.user_id;
                          const name = isGuest ? member.guest_info?.name : member.user_id?.name;
                          const phone = isGuest ? member.guest_info?.phone : member.user_id?.phone;
                          const birthYear = isGuest ? member.guest_info?.birth_year : (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : '-');
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
                              <TableCell>{birthYear}</TableCell>
                              {isLeaderOrCreator && (
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
          <Button onClick={() => setViewVehiclePassengersOpen(false)} color="primary" variant="contained" sx={{ borderRadius: 2 }}>
            Đóng
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
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            px: 3,
            py: 2.5,
            color: '#fff',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LinkIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">Link mời tham gia Tour</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Chỉ bạn và trưởng đoàn mới thấy nút này
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Chia sẻ link bên dưới để mời mọi người tham gia tour{' '}
            <strong>{tour?.name}</strong>. Link có hiệu lực đến trước thời điểm tour bắt đầu.
          </Typography>

          {/* Link display box */}
          {(() => {
            const inviteToken = tour ? btoa(tour._id) : '';
            const inviteLink = `${window.location.origin}/join/${inviteToken}`;
            return (
              <Box>
                <Box
                  sx={{
                    bgcolor: 'grey.50',
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
                      bgcolor: inviteCopied ? 'success.main' : '#7c3aed',
                      '&:hover': { bgcolor: inviteCopied ? 'success.dark' : '#6d28d9' },
                      transition: 'background-color 0.3s',
                    }}
                  >
                    {inviteCopied ? '✅ Đã sao chép!' : 'Sao chép link'}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<OpenInNewIcon />}
                    onClick={() => window.open(inviteLink, '_blank')}
                    sx={{ borderRadius: 2.5, borderColor: '#7c3aed', color: '#7c3aed' }}
                  >
                    Mở thử link
                  </Button>
                </Stack>

                <Box
                  sx={{
                    mt: 2.5,
                    p: 1.5,
                    bgcolor: 'warning.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'warning.light',
                  }}
                >
                  <Typography variant="caption" color="warning.dark">
                    ⏰ Link hết hạn lúc:{' '}
                    <strong>
                      {tour ? new Date(tour.start_time).toLocaleString('vi-VN', {
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
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: LEAVE TOUR */}
      {/* ========================================================================= */}
      <Dialog open={leaveDialogOpen} onClose={() => !actionLoading && setLeaveDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'error.main' }}>
          Rời tour
        </DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Bạn có chắc chắn muốn rời khỏi tour này không? Việc này là không thể hoàn tác.
          </Typography>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          <TextField
            fullWidth
            label="Lý do rời tour"
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
            Xác nhận rời tour
          </Button>
        </DialogActions>
      </Dialog>
      <ExcelImportModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        tourId={id}
        onImportSuccess={fetchTourData}
      />
    </Box>
  );
}
