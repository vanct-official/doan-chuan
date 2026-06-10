import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Box, Card, CardContent, Grid, Chip, Button,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, LinearProgress, Stack, IconButton,
  Divider, Tooltip, Tabs, Tab, Avatar, AvatarGroup, Checkbox, FormControlLabel,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  accentGradient, attendanceAvatarBorder, attendanceMemberSx, groupHeaderColors,
} from '../customer/tourDetailTheme';
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
import MapIcon from '@mui/icons-material/Map';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslate } from '../../hooks/useTranslate';
import { tourService } from '../../services/tourService';
import { vehicleService } from '../../services/vehicleService';
import { membershipService } from '../../services/membershipService';
import { groupService } from '../../services/groupService';
import { authService } from '../../services/authService';
import { offlineApi } from '../../services/offlineApi';
import ExcelImportModal from '../../components/ExcelImportModal';
import { formatForDateTimeLocal, parseDateTimeLocalToISO } from '../../utils/dateUtils';

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

export default function AdminTourDetailPage() {
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

  // Active Tab: 0: Passengers, 1: Vehicles, 2: Itinerary
  const [activeTab, setActiveTab] = useState(0);

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

  // Filter and Search States
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [users, setUsers] = useState([]);
  const [tourForm, setTourForm] = useState({ name: '', start_time: '', end_time: '', max_capacity: '', leader_id: '' });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await authService.getAllUsers();
        if (res && res.users) {
          setUsers(res.users);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    loadUsers();
  }, []);

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

  // Itinerary & Attendance States
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

  const fetchTourData = async () => {
    try {
      const { data: response, fromCache } = await offlineApi.getTourById(id, statusFilter);
      setIsOfflineData(fromCache);
      if (!response) {
        setError(t('tour.messages.loadError'));
        return null;
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

      // Fetch itineraries & attendances
      try {
        const { data: itinRes } = await offlineApi.getItinerariesByTour(id);
        setItineraries(itinRes || []);

        const { data: attRes } = await offlineApi.getAttendanceByTour(id);
        setTourAttendances(attRes || []);
      } catch (e) {
        console.error('Failed to fetch itineraries', e);
      }
      return response;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || t('tour.messages.loadError'));
      return null;
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
    navigate('/admin/tours');
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

  // 1. EDIT TOUR HANDLERS
  const handleOpenEditTour = () => {
    if (!tour) return;

    setTourForm({
      name: tour.name || '',
      start_time: formatForDateTimeLocal(tour.start_time),
      end_time: formatForDateTimeLocal(tour.end_time),
      max_capacity: tour.max_capacity || '',
      leader_id: tour.leader_id?._id || tour.leader_id || ''
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
        max_capacity: Number(tourForm.max_capacity),
        leader_id: tourForm.leader_id
      });

      if (response.success) {
        setActionSuccess(t('msg_update_success'));
        fetchTourData();
        setTimeout(() => setEditTourOpen(false), 1000);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('tour.messages.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTour = async () => {
    if (!window.confirm(t('confirm_delete_tour'))) return;
    setActionLoading(true);
    try {
      const res = await tourService.deleteTour(id);
      if (res.success) {
        navigate('/admin/tours');
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Lỗi khi xóa tour.');
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
      status: 'approved', // Mặc định duyệt luôn khi admin add
      is_driver: false,
      group_id: 'none'
    });
    setBatchMembers([
      { user_id: '', name: '', phone: '', birth_year: '', gender: 'male', customer_type: 'adult', role: 'member', is_driver: false }
    ]);
    setGroupNameInput('');
    setNewGroupSelected(false);
    setAddPassengerMode('single');
    setActionError('');
    setActionSuccess('');
    setAddPassengerOpen(true);
  };

  const handlePassengerPhoneChange = async (e) => {
    const phone = e.target.value;
    setPassengerForm(prev => ({ ...prev, phone }));

    if (phone.length >= 9) {
      try {
        const res = await authService.checkPhone(phone);
        if (res.success && res.user) {
          setPassengerForm(prev => ({
            ...prev,
            user_id: res.user._id,
            name: res.user.name,
            birth_year: res.user.dob ? new Date(res.user.dob).getFullYear() : '',
            gender: res.user.gender === true ? 'male' : res.user.gender === false ? 'female' : 'male',
          }));
        }
      } catch (err) {
        // Ignore check errors
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

  const handleAddPassengerSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      if (addPassengerMode === 'single') {
        if (!passengerForm.name.trim()) throw new Error(t('err_passenger_name_required'));
        if (!passengerForm.birth_year) throw new Error(t('err_birth_year_required'));
        if (newGroupSelected && !groupNameInput.trim()) throw new Error(t('err_group_name_required'));

        const payload = {
          tour_id: id,
          user_id: passengerForm.user_id || undefined,
          guest_info: passengerForm.user_id ? undefined : {
            name: passengerForm.name.trim(),
            phone: passengerForm.phone.trim(),
            birth_year: Number(passengerForm.birth_year),
            gender: passengerForm.gender
          },
          role: passengerForm.role,
          is_driver: passengerForm.is_driver,
          status: 'approved', // Admin add auto approve
          group_id: newGroupSelected ? undefined : (passengerForm.group_id === 'none' ? undefined : passengerForm.group_id),
          group_name: newGroupSelected ? groupNameInput.trim() : undefined
        };

        const res = await membershipService.addMember(payload);
        if (res.success) {
          setActionSuccess(t('msg_add_success'));
          fetchTourData();
          setTimeout(() => setAddPassengerOpen(false), 1000);
        }
      } else {
        // Batch Mode
        const validBatch = batchMembers.map((m, idx) => {
          if (!m.name.trim()) throw new Error(t('err_passenger_name_at_row', { row: idx + 1 }));
          if (!m.birth_year) throw new Error(t('err_birth_year_at_row', { row: idx + 1 }));

          return {
            user_id: m.user_id || undefined,
            name: m.name.trim(),
            phone: m.phone.trim(),
            birth_year: Number(m.birth_year),
            gender: m.gender,
            customer_type: m.customer_type,
            role: m.role,
            is_driver: m.is_driver,
            status: 'approved'
          };
        });

        const payload = {
          tour_id: id,
          members: validBatch,
          group_name: newGroupSelected && groupNameInput.trim() ? groupNameInput.trim() : undefined
        };

        const res = await membershipService.addMembersBatch(payload);
        if (res.success) {
          setActionSuccess(t('msg_batch_add_passenger_success'));
          fetchTourData();
          setTimeout(() => setAddPassengerOpen(false), 1000);
        }
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('tour.messages.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBatchRow = () => {
    setBatchMembers(prev => [...prev, { user_id: '', name: '', phone: '', birth_year: '', gender: 'male', customer_type: 'adult', role: 'member', is_driver: false }]);
  };

  const handleRemoveBatchRow = (idx) => {
    setBatchMembers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBatchMemberChange = async (idx, field, value) => {
    const updated = [...batchMembers];
    updated[idx][field] = value;
    setBatchMembers(updated);

    if (field === 'phone' && value.length >= 9) {
      try {
        const res = await authService.checkPhone(value);
        if (res.success && res.user) {
          updated[idx].user_id = res.user._id;
          updated[idx].name = res.user.name;
          updated[idx].birth_year = res.user.dob ? new Date(res.user.dob).getFullYear() : '';
          updated[idx].gender = res.user.gender === true ? 'male' : res.user.gender === false ? 'female' : 'male';
          setBatchMembers([...updated]);
        }
      } catch (e) {
        // ignore check error
      }
    } else if (field === 'phone') {
      if (updated[idx].user_id) {
        updated[idx].user_id = '';
        updated[idx].name = '';
        updated[idx].birth_year = '';
        updated[idx].gender = 'male';
        setBatchMembers([...updated]);
      }
    }
  };

  // 3. EDIT PASSENGER HANDLERS
  const handleOpenEditPassenger = (member) => {
    setSelectedPassenger(member);
    const isGuest = !member.user_id;

    setPassengerForm({
      user_id: member.user_id?._id || member.user_id || '',
      name: isGuest ? member.guest_info?.name : member.user_id?.name || '',
      phone: isGuest ? member.guest_info?.phone : member.user_id?.phone || '',
      birth_year: isGuest ? member.guest_info?.birth_year : (member.user_id?.dob ? new Date(member.user_id.dob).getFullYear() : ''),
      gender: isGuest ? member.guest_info?.gender : (member.user_id?.gender === true ? 'male' : member.user_id?.gender === false ? 'female' : 'male'),
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
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const isGuest = !passengerForm.user_id;
      if (!passengerForm.name.trim()) throw new Error(t('err_passenger_name_required'));
      if (!passengerForm.birth_year) throw new Error(t('err_birth_year_required'));
      if (newGroupSelected && !groupNameInput.trim()) throw new Error(t('err_group_name_required'));

      const payload = {
        role: passengerForm.role,
        is_driver: passengerForm.is_driver,
        status: passengerForm.status,
        customer_type: passengerForm.customer_type,
        group_id: newGroupSelected ? undefined : (passengerForm.group_id === 'none' ? null : passengerForm.group_id),
        group_name: newGroupSelected ? groupNameInput.trim() : undefined,
        guest_info: isGuest ? {
          name: passengerForm.name.trim(),
          phone: passengerForm.phone.trim(),
          birth_year: Number(passengerForm.birth_year),
          gender: passengerForm.gender
        } : undefined
      };

      const res = await membershipService.updateMember(selectedPassenger._id, payload);
      if (res.success) {
        setActionSuccess(t('msg_update_passenger_success'));
        fetchTourData();
        setTimeout(() => setEditPassengerOpen(false), 1000);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || t('tour.messages.deleteError'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePassenger = async (memberId) => {
    if (!window.confirm(t('confirm_delete_passenger'))) return;
    setActionLoading(true);
    try {
      const res = await membershipService.deleteMember(memberId);
      if (res.success) {
        fetchTourData();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Lỗi khi xóa hành khách.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveMember = async (memberId) => {
    try {
      const res = await membershipService.bulkApproveMembers([memberId]);
      if (res.success) {
        fetchTourData();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Lỗi khi duyệt.');
    }
  };

  // 4. ADD VEHICLE HANDLERS
  const handleOpenAddVehicle = () => {
    setVehicleForm({
      license_plate: '',
      plate_color: 'white',
      seat_count: '',
      driver_name: '',
      driver_phone: '',
      _selectedDriverId: '' // Dùng để lưu passenger được chọn làm tài xế
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

      const payload = {
        tour_id: id,
        license_plate: vehicleForm.license_plate.trim(),
        plate_color: vehicleForm.plate_color,
        seat_count: Number(vehicleForm.seat_count),
        driver_name: vehicleForm.driver_name.trim(),
        driver_phone: vehicleForm.driver_phone.trim(),
      };

      const res = await vehicleService.createVehicle(payload);
      if (res.success) {
        setActionSuccess(t('msg_add_success'));
        fetchTourData();
        setTimeout(() => setAddVehicleOpen(false), 1000);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi thêm xe.');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. EDIT VEHICLE HANDLERS
  const handleOpenEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      license_plate: vehicle.license_plate || '',
      plate_color: vehicle.plate_color || 'white',
      seat_count: vehicle.seat_count || '',
      driver_name: vehicle.driver_name || '',
      driver_phone: vehicle.driver_phone || '',
      _selectedDriverId: ''
    });
    setActionError('');
    setActionSuccess('');
    setEditVehicleOpen(true);
  };

  const handleEditVehicleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      if (!vehicleForm.license_plate.trim()) throw new Error(t('err_license_plate_required'));
      if (!vehicleForm.seat_count || Number(vehicleForm.seat_count) <= 0) throw new Error(t('err_seats_must_be_positive'));

      const payload = {
        license_plate: vehicleForm.license_plate.trim(),
        plate_color: vehicleForm.plate_color,
        seat_count: Number(vehicleForm.seat_count),
        driver_name: vehicleForm.driver_name.trim(),
        driver_phone: vehicleForm.driver_phone.trim(),
      };

      const res = await vehicleService.updateVehicle(selectedVehicle._id, payload);
      if (res.success) {
        setActionSuccess(t('msg_update_vehicle_success'));
        fetchTourData();
        setTimeout(() => setEditVehicleOpen(false), 1000);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi cập nhật xe.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm(t('confirm_delete_vehicle'))) return;
    setActionLoading(true);
    try {
      const res = await vehicleService.deleteVehicle(vehicleId);
      if (res.success) {
        fetchTourData();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Lỗi khi xóa xe.');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. ASSIGN SEAT HANDLERS
  const handleOpenAssignSeat = (member = null) => {
    setAssignSeatForm({
      membership_id: member ? member._id : '',
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

      const res = await vehicleService.assignSeat(assignSeatForm.membership_id, assignSeatForm.vehicle_id);
      if (res.success) {
        setActionSuccess(t('msg_assign_success'));
        fetchTourData();
        setTimeout(() => setAssignSeatOpen(false), 1000);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi xếp xe.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMemberFromVehicle = async (memberId) => {
    if (!window.confirm(t('confirm_unassign_seat'))) return;
    setActionLoading(true);
    try {
      // API sets vehicle_id to null
      const res = await vehicleService.assignSeat(memberId, null);
      if (res.success) {
        fetchTourData();
        // Update vehicle passenger modal data if it's currently open
        if (activeVehicleForPassengers) {
          const freshVehicle = vehicles.find(v => v._id === activeVehicleForPassengers._id);
          if (freshVehicle) {
            setActiveVehicleForPassengers(freshVehicle);
          } else {
            // If vehicle is deleted, close modal
            setViewVehiclePassengersOpen(false);
          }
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Lỗi khi hủy xếp xe.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignVehicleLeader = async (vehicleId, memberId) => {
    if (!window.confirm(t('confirm_assign_vehicle_rep'))) return;
    setActionLoading(true);
    try {
      const res = await vehicleService.assignVehicleLeader(vehicleId, memberId);
      if (res.success) {
        setActionSuccess(t('msg_assign_vehicle_rep_success'));
        const freshData = await fetchTourData();
        setTimeout(() => setActionSuccess(''), 2000);
        // Refresh active vehicle passengers modal data
        if (freshData && freshData.vehicles) {
          const fresh = freshData.vehicles.find(v => v._id === vehicleId);
          if (fresh) setActiveVehicleForPassengers(fresh);
        }
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi chỉ định Trưởng xe.');
    } finally {
      setActionLoading(false);
    }
  };

  // Batch assign seats directly in vehicle passengers modal
  const handleOpenVehiclePassengers = (vehicle) => {
    setActiveVehicleForPassengers(vehicle);
    setSelectedUnassignedIds([]);
    setSelectedGroupIdFilter('none');
    setShowAddPassengerPanel(false);
    setActionError('');
    setActionSuccess('');
    setViewVehiclePassengersOpen(true);
  };

  const handleCheckboxToggle = (mId) => {
    setSelectedUnassignedIds(prev =>
      prev.includes(mId) ? prev.filter(id => id !== mId) : [...prev, mId]
    );
  };

  const handleGroupFilterChange = (groupId) => {
    setSelectedGroupIdFilter(groupId);
    if (groupId === 'none') {
      setSelectedUnassignedIds([]);
    } else {
      // Auto select all unassigned members belonging to this group
      const groupMembers = memberships.filter(m => !m.vehicle_id && (m.group_id?._id === groupId || m.group_id === groupId));
      setSelectedUnassignedIds(groupMembers.map(m => m._id));
    }
  };

  const handleAssignSeatsBatchSubmit = async () => {
    if (selectedUnassignedIds.length === 0) {
      alert(t('err_select_passenger_to_assign'));
      return;
    }
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await vehicleService.assignSeatsBatch(selectedUnassignedIds, activeVehicleForPassengers._id);
      if (res.success) {
        setActionSuccess(t('msg_batch_assign_seat_success'));
        const freshData = await fetchTourData();
        // Refresh state
        setSelectedUnassignedIds([]);
        setSelectedGroupIdFilter('none');
        setShowAddPassengerPanel(false);
        // Sync vehicle occupants inside view modal
        if (freshData && freshData.vehicles) {
          const fresh = freshData.vehicles.find(v => v._id === activeVehicleForPassengers._id);
          if (fresh) setActiveVehicleForPassengers(fresh);
        }
        setTimeout(() => setActionSuccess(''), 2000);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi xếp xe hàng loạt.');
    } finally {
      setActionLoading(false);
    }
  };

  // 7. ITINERARY & ATTENDANCE HANDLERS
  const handleOpenAddItinerary = () => {
    setItineraryForm({ date: '', location: '', activity: '' });
    setEditItineraryId(null);
    setActionError('');
    setActionSuccess('');
    setItineraryModalOpen(true);
  };

  const handleOpenEditItinerary = (itin) => {
    setItineraryForm({
      date: formatForDateTimeLocal(itin.date),
      location: itin.location || '',
      activity: itin.activity || ''
    });
    setEditItineraryId(itin._id);
    setActionError('');
    setActionSuccess('');
    setItineraryModalOpen(true);
  };

  const handleSaveItinerary = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const payload = {
        tour_id: id,
        date: parseDateTimeLocalToISO(itineraryForm.date),
        location: itineraryForm.location.trim(),
        activity: itineraryForm.activity.trim()
      };

      let res;
      if (editItineraryId) {
        res = await offlineApi.updateItinerary(editItineraryId, payload);
      } else {
        res = await offlineApi.createItinerary(payload);
      }

      if (res) {
        setActionSuccess(res.queued ? 'Đã lưu offline — sẽ đồng bộ khi có mạng!' : t('msg_update_success'));
        fetchTourData();
        setTimeout(() => setItineraryModalOpen(false), 1000);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi lưu lịch trình.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItinerary = async (itinId) => {
    if (!window.confirm(t('confirm_delete_itinerary'))) return;
    setActionLoading(true);
    try {
      const res = await offlineApi.deleteItinerary(itinId);
      if (res) {
        fetchTourData();
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Lỗi khi xóa lịch trình.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAttendanceModal = async (itin) => {
    setSelectedItinerary(itin);
    setActionError('');
    setActionSuccess('');
    setAttendanceModalOpen(true);

    try {
      // Filter the existing tourAttendances locally
      const itinAttendances = tourAttendances.filter(a => {
        const aItinId = a.itinerary_id?._id || a.itinerary_id;
        return aItinId === itin._id;
      });

      // Build initial attendance mapping
      const list = memberships.map(m => {
        const matched = itinAttendances.find(a => {
          const aMemId = a.membership_id?._id || a.membership_id;
          return aMemId === m._id;
        });
        return {
          membership_id: m._id,
          status: matched ? matched.status : 'absent'
        };
      });
      setAttendanceData(list);
    } catch (e) {
      console.error(e);
      setAttendanceData(memberships.map(m => ({ membership_id: m._id, status: 'absent' })));
    }
  };

  const handleToggleAttendance = (memberId) => {
    setAttendanceData(prev => prev.map(a =>
      a.membership_id === memberId ? { ...a, status: a.status === 'present' ? 'absent' : 'present' } : a
    ));
  };

  const handleToggleGroupAttendance = (memberIds, forcePresent) => {
    setAttendanceData(prev => prev.map(a =>
      memberIds.includes(a.membership_id) ? { ...a, status: forcePresent ? 'present' : 'absent' } : a
    ));
  };

  const handleSaveAttendance = async () => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');
    try {
      // Group memberships with vehicle_id
      const byVehicle = new Map();
      memberships.filter(m => m.status !== 'left' && m.vehicle_id).forEach(m => {
        const vId = m.vehicle_id?._id || m.vehicle_id;
        if (!byVehicle.has(vId)) byVehicle.set(vId, []);
        byVehicle.get(vId).push(m);
      });

      // Save for each vehicle
      await Promise.all([...byVehicle.entries()].map(([vehicleId, members]) => {
        const attendances = members.map(m => {
          const ex = attendanceData.find(a => a.membership_id === m._id);
          return { membership_id: m._id, status: ex?.status || 'absent' };
        });
        return offlineApi.markAttendanceBatch({
          itinerary_id: selectedItinerary._id,
          vehicle_id: vehicleId,
          attendances
        });
      }));

      // Update tourAttendances locally
      setTourAttendances(prev => [
        ...prev.filter(a => (a.itinerary_id?._id || a.itinerary_id) !== selectedItinerary._id),
        ...memberships.filter(m => m.status !== 'left' && m.vehicle_id).map(m => {
          const ex = attendanceData.find(a => a.membership_id === m._id);
          return {
            itinerary_id: selectedItinerary._id,
            vehicle_id: m.vehicle_id?._id || m.vehicle_id,
            membership_id: m._id,
            status: ex?.status || 'absent'
          };
        })
      ]);

      setActionSuccess(t('msg_update_success'));
      setTimeout(() => setAttendanceModalOpen(false), 1000);
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi khi lưu điểm danh.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper arrays for filters
  const unassignedMembers = memberships.filter(m => !m.vehicle_id && m.status !== 'left');

  // Filter passengers based on Search bar and Status filters
  const filteredMemberships = memberships.filter(m => {
    const isGuest = !m.user_id;
    const name = (isGuest ? m.guest_info?.name : m.user_id?.name || '').toLowerCase();
    const phone = (isGuest ? m.guest_info?.phone : m.user_id?.phone || '').toLowerCase();
    const searchMatches = name.includes(searchQuery.toLowerCase()) || phone.includes(searchQuery.toLowerCase());

    if (!searchMatches) return false;

    if (statusFilter === 'pending') return m.status === 'pending';
    if (statusFilter === 'approved') return m.status === 'approved';
    if (statusFilter === 'no_vehicle') return !m.vehicle_id && m.status !== 'left';

    return true;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tour) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleBack}>{t('tour_list_back')}</Button>
        }>
          {error || t('tour_no_data')}
        </Alert>
      </Box>
    );
  }

  // Summary Metrics
  const activeMemberships = memberships.filter(m => m.status !== 'left');
  const pendingMemberships = memberships.filter(m => m.status === 'pending');
  const totalAssignedSeats = memberships.filter(m => m.vehicle_id && m.status !== 'left').length;

  return (
    <Box sx={{ p: 2 }}>
      
      {/* ── HEADER NAVIGATION & GENERAL ACTIONS ── */}
      <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton onClick={handleBack} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {tour.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {tour._id} | {t('tour_leader')}: {tour.leader_id?.name || 'Chưa phân công'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={handleOpenEditTour} sx={{ textTransform: 'none', borderRadius: 2 }}>
            {t('btn_edit_tour')}
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeleteTour} sx={{ textTransform: 'none', borderRadius: 2 }}>
            {t('tour_leave_title')}
          </Button>
          <Button variant="outlined" color="success" startIcon={<FormatListBulletedIcon />} onClick={() => setExcelModalOpen(true)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            {t('tour_import_excel')}
          </Button>
          <Button variant="contained" color="primary" startIcon={<LinkIcon />} onClick={() => setInviteDialogOpen(true)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Mời khách
          </Button>
        </Stack>
      </Stack>

      {/* ── TOUR METRICS SUMMARY CARDS ── */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2.5 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 2, width: 48, height: 48 }}>
              <PeopleIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>Hành khách duyệt</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{activeMemberships.filter(m => m.status === 'approved').length} / {tour.max_capacity}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2.5 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mr: 2, width: 48, height: 48 }}>
              <LocalOfferIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>Yêu cầu chờ duyệt</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: pendingMemberships.length > 0 ? 'warning.main' : 'text.primary' }}>{pendingMemberships.length}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2.5 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', mr: 2, width: 48, height: 48 }}>
              <DirectionsCarIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>Tổng ghế xe</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{vehicles.reduce((sum, v) => sum + v.seat_count, 0)} ghế ({vehicles.length} xe)</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ borderRadius: 3, display: 'flex', alignItems: 'center', p: 2.5 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mr: 2, width: 48, height: 48 }}>
              <AirlineSeatReclineNormalIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>Đã xếp xe</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{totalAssignedSeats} / {activeMemberships.length} người</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* ── TAB SELECTOR ── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} aria-label="admin detail tabs">
          <Tab label={`Hành khách (${activeMemberships.length})`} icon={<PeopleIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab label={`Phương tiện (${vehicles.length})`} icon={<DirectionsCarIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab label={`Lịch trình (${itineraries.length})`} icon={<EventIcon />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      {/* ========================================================================= */}
      {/* TAB 1: PASSENGERS TABLE */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Box>
          {/* SEARCH & FILTERS ROW */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" mb={2.5}>
            <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
              <TextField
                size="small"
                placeholder={t('tour_search_passenger_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ maxWidth: 350, width: '100%' }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả trạng thái</MenuItem>
                  <MenuItem value="approved">Đã duyệt (Approved)</MenuItem>
                  <MenuItem value="pending">Chờ duyệt (Pending)</MenuItem>
                  <MenuItem value="no_vehicle">Chưa xếp xe</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ minWidth: 'fit-content' }}>
              <Button variant="outlined" startIcon={<AirlineSeatReclineNormalIcon />} onClick={() => handleOpenAssignSeat(null)} disabled={vehicles.length === 0 || unassignedMembers.length === 0} sx={{ textTransform: 'none', borderRadius: 2 }}>
                Xếp xe
              </Button>
              <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAddPassenger} sx={{ textTransform: 'none', borderRadius: 2 }}>
                + {t('btn_add_passenger')}
              </Button>
            </Stack>
          </Stack>

          {/* PASSENGERS TABLE CONTAINER */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table size="small" aria-label="passengers-table">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Hành khách</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số điện thoại</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Giới tính</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Năm sinh (Tuổi)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nhóm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Xe xếp</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMemberships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary', fontStyle: 'italic' }}>
                      {t('tour_no_passengers_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMemberships.map((m) => {
                    const isGuest = !m.user_id;
                    const name = isGuest ? m.guest_info?.name : m.user_id?.name;
                    const phone = isGuest ? m.guest_info?.phone : m.user_id?.phone;
                    const birthYear = isGuest ? m.guest_info?.birth_year : (m.user_id?.dob ? new Date(m.user_id.dob).getFullYear() : null);
                    const age = birthYear ? new Date().getFullYear() - birthYear : null;
                    const genderRaw = isGuest ? m.guest_info?.gender : (m.user_id?.gender === true ? 'male' : m.user_id?.gender === false ? 'female' : '');
                    const genderLabel = genderRaw === 'male' ? t('profile_male') : genderRaw === 'female' ? t('profile_female') : t('tour_gender_other');

                    // Matching Vehicle Plate
                    const matchedVehicle = vehicles.find(v => v._id === m.vehicle_id);

                    // Group
                    const passGroupId = m.group_id?._id || m.group_id;
                    const matchedGroup = groups.find(g => g._id === passGroupId);
                    const groupName = matchedGroup?.name || m.group_id?.name || (m.group_id ? t('tour_group_suffix', { id: passGroupId }) : t('tour_no_group'));

                    return (
                      <TableRow key={m._id} hover>
                        <TableCell sx={{ py: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar {...stringAvatar(name || 'Unknown')} sx={{ ...stringAvatar(name || 'Unknown').sx, width: 32, height: 32, fontSize: '0.82rem' }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {name} {m.is_driver ? `(${t('tour_role_driver')})` : ''}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {m.role === 'leader' ? t('tour_role_leader') : m.role === 'group_rep' ? t('tour_role_group_rep') : m.role === 'vehicle_rep' ? t('tour_role_vehicle_rep') : t('tour_member_prefix')}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>{phone || t('tour_no_phone_provided')}</TableCell>
                        <TableCell>{genderLabel}</TableCell>
                        <TableCell>
                          {birthYear ? (age ? t('tour_birth_year_with_age', { year: birthYear, age }) : t('tour_birth_year_only', { year: birthYear })) : '-'}
                        </TableCell>
                        <TableCell>{groupName}</TableCell>
                        <TableCell>
                          {matchedVehicle ? (
                            renderLicensePlate(matchedVehicle.license_plate, matchedVehicle.plate_color)
                          ) : (
                            <Chip label={t('seat_unassigned')} size="small" variant="outlined" color="default" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={m.status === 'approved' ? 'Đã duyệt' : m.status === 'pending' ? 'Chờ duyệt' : 'Đã rời'}
                            color={m.status === 'approved' ? 'success' : m.status === 'pending' ? 'warning' : 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {m.status === 'pending' && (
                              <Tooltip title="Duyệt tham gia">
                                <IconButton size="small" color="success" onClick={() => handleApproveMember(m._id)}>
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {!m.vehicle_id && m.status !== 'left' && (
                              <Tooltip title="Xếp xe">
                                <IconButton size="small" color="primary" onClick={() => handleOpenAssignSeat(m)}>
                                  <DirectionsCarIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {m.vehicle_id && (
                              <Tooltip title="Hủy xếp xe">
                                <IconButton size="small" color="warning" onClick={() => handleRemoveMemberFromVehicle(m._id)}>
                                  <RemoveCircleOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Chỉnh sửa">
                              <IconButton size="small" color="info" onClick={() => handleOpenEditPassenger(m)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa khách khỏi tour">
                              <IconButton size="small" color="error" onClick={() => handleRemovePassenger(m._id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VEHICLES TABLE */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
            <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAddVehicle} sx={{ textTransform: 'none', borderRadius: 2 }}>
              + {t('btn_add_vehicle')}
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table size="small" aria-label="vehicles-table">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Biển kiểm soát</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Số lượng ghế</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên tài xế</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>SĐT tài xế</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trưởng xe</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tình trạng lấp đầy</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary', fontStyle: 'italic' }}>
                      {t('tour_no_vehicles_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((v) => {
                    const occupiedCount = memberships.filter(m => m.vehicle_id === v._id && m.status !== 'left').length;
                    const rate = Math.round((occupiedCount / v.seat_count) * 100);

                    // Leader/Rep Name
                    const leaderName = v.representative_id?.user_id?.name || v.representative_id?.guest_info?.name || 'Chưa phân công';

                    return (
                      <TableRow key={v._id} hover>
                        <TableCell sx={{ py: 1.2 }}>
                          {renderLicensePlate(v.license_plate, v.plate_color)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{v.seat_count} ghế</TableCell>
                        <TableCell>{v.driver_name || '-'}</TableCell>
                        <TableCell>{v.driver_phone || '-'}</TableCell>
                        <TableCell>
                          {v.representative_id ? (
                            <Chip label={leaderName} color="primary" size="small" variant="outlined" />
                          ) : (
                            <Typography variant="caption" color="text.secondary">Chưa chỉ định</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ width: '80px' }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(100, rate)}
                                color={rate >= 100 ? 'error' : 'success'}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                              {occupiedCount} / {v.seat_count} ({rate}%)
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Xem hành khách & Xếp xe">
                              <Button size="small" variant="outlined" color="success" onClick={() => handleOpenVehiclePassengers(v)} sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}>
                                Hành khách
                              </Button>
                            </Tooltip>
                            <IconButton size="small" color="info" onClick={() => handleOpenEditVehicle(v)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteVehicle(v._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ITINERARY & ATTENDANCE TABLE */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
            <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAddItinerary} sx={{ textTransform: 'none', borderRadius: 2 }}>
              + Thêm mốc lịch trình
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table size="small" aria-label="itinerary-table">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5, width: '220px' }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '280px' }}>Địa điểm</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Hoạt động</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: '220px' }}>Tình trạng điểm danh</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '180px' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itineraries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary', fontStyle: 'italic' }}>
                      Chưa có mốc lịch trình nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  itineraries.map((itin) => {
                    // Calculate attendance count
                    const itinAttendance = tourAttendances.filter(a => a.itinerary_id === itin._id);
                    const presentCount = itinAttendance.filter(a => a.status === 'present').length;
                    const totalActive = activeMemberships.length;

                    return (
                      <TableRow key={itin._id} hover>
                        <TableCell sx={{ py: 1.2, fontWeight: 500 }}>
                          {new Date(itin.date).toLocaleString(localeCode, { dateStyle: 'short', timeStyle: 'short' })}
                        </TableCell>
                        <TableCell>{itin.location || '-'}</TableCell>
                        <TableCell>{itin.activity || '-'}</TableCell>
                        <TableCell>
                          {itinAttendance.length > 0 ? (
                            <Chip
                              label={`Có mặt: ${presentCount} / ${totalActive}`}
                              color={presentCount === totalActive ? 'success' : 'warning'}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 'bold' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">Chưa điểm danh</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Điểm danh hành khách">
                              <Button size="small" variant="contained" color="secondary" onClick={() => handleOpenAttendanceModal(itin)} sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}>
                                Điểm danh
                              </Button>
                            </Tooltip>
                            <IconButton size="small" color="info" onClick={() => handleOpenEditItinerary(itin)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteItinerary(itin._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT TOUR DETAILS */}
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
              disabled={actionLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_start_time')}
              type="datetime-local"
              value={tourForm.start_time}
              onChange={(e) => setTourForm({ ...tourForm, start_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={actionLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_end_time')}
              type="datetime-local"
              value={tourForm.end_time}
              onChange={(e) => setTourForm({ ...tourForm, end_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={actionLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_capacity')}
              type="number"
              value={tourForm.max_capacity}
              onChange={(e) => setTourForm({ ...tourForm, max_capacity: e.target.value })}
              disabled={actionLoading}
            />
            <FormControl fullWidth margin="normal" required disabled={actionLoading}>
              <InputLabel id="edit-tour-leader-label">Trưởng đoàn (Tour Leader)</InputLabel>
              <Select
                labelId="edit-tour-leader-label"
                value={tourForm.leader_id || ''}
                label="Trưởng đoàn (Tour Leader)"
                onChange={(e) => setTourForm({ ...tourForm, leader_id: e.target.value })}
              >
                {users.length === 0 && tour?.leader_id && (
                  <MenuItem value={tour.leader_id?._id || tour.leader_id}>
                    {tour.leader_id?.name || 'Trưởng đoàn hiện tại'}
                  </MenuItem>
                )}
                {users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.name} ({u.phone || 'Chưa có SĐT'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
      {/* MODAL 2: ADD PASSENGER (SINGLE & BATCH FORM) */}
      {/* ========================================================================= */}
      <Dialog open={addPassengerOpen} onClose={() => !actionLoading && setAddPassengerOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 800, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main', pb: 1 }}>
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

                    <Grid container spacing={1.5}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label={t('profile_phone')}
                          placeholder={t('phone_placeholder_short')}
                          value={member.phone}
                          onChange={(e) => handleBatchMemberChange(index, 'phone', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label={t('profile_name')}
                          placeholder={t('tour_driver_name_placeholder')}
                          value={member.name}
                          onChange={(e) => handleBatchMemberChange(index, 'name', e.target.value)}
                          InputProps={{ readOnly: !!member.user_id }}
                          helperText={member.user_id ? t('tour_linked_account_helper_short') : ""}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          required
                          fullWidth
                          size="small"
                          label={t('col_birth_year')}
                          type="number"
                          placeholder={t('birth_year_placeholder_short')}
                          value={member.birth_year}
                          onChange={(e) => handleBatchMemberChange(index, 'birth_year', e.target.value)}
                          inputProps={{ min: 1900, max: new Date().getFullYear() }}
                          InputProps={{ readOnly: !!member.user_id }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t('profile_gender')}</InputLabel>
                          <Select
                            value={member.gender}
                            label={t('profile_gender')}
                            onChange={(e) => handleBatchMemberChange(index, 'gender', e.target.value)}
                            inputProps={{ readOnly: !!member.user_id }}
                          >
                            <MenuItem value="male">{t('profile_male')}</MenuItem>
                            <MenuItem value="female">{t('profile_female')}</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                        <FormControl fullWidth size="small">
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
              required
              fullWidth
              label={t('profile_name')}
              value={passengerForm.name}
              onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })}
              InputProps={{ readOnly: !!passengerForm.user_id }}
              disabled={actionLoading}
              helperText={passengerForm.user_id ? t('tour_linked_account_helper') : ""}
            />

            <TextField
              margin="normal"
              fullWidth
              label={t('profile_phone')}
              value={passengerForm.phone}
              onChange={(e) => setPassengerForm({ ...passengerForm, phone: e.target.value })}
              InputProps={{ readOnly: !!passengerForm.user_id }}
              disabled={actionLoading}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label={t('col_birth_year')}
                  type="number"
                  value={passengerForm.birth_year}
                  onChange={(e) => setPassengerForm({ ...passengerForm, birth_year: e.target.value })}
                  inputProps={{ min: 1900, max: new Date().getFullYear() }}
                  InputProps={{ readOnly: !!passengerForm.user_id }}
                  disabled={actionLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>{t('profile_gender')}</InputLabel>
                  <Select
                    value={passengerForm.gender}
                    label={t('profile_gender')}
                    onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                    inputProps={{ readOnly: !!passengerForm.user_id }}
                    disabled={actionLoading}
                  >
                    <MenuItem value="male">{t('profile_male')}</MenuItem>
                    <MenuItem value="female">{t('profile_female')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('tour_customer_type')}</InputLabel>
              <Select
                value={passengerForm.customer_type}
                label={t('tour_customer_type')}
                onChange={(e) => setPassengerForm({ ...passengerForm, customer_type: e.target.value })}
                disabled={actionLoading}
              >
                <MenuItem value="adult">{t('tour_adult')}</MenuItem>
                <MenuItem value="child">{t('tour_child')}</MenuItem>
                <MenuItem value="elderly">{t('tour_elderly')}</MenuItem>
              </Select>
            </FormControl>

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
                disabled={actionLoading}
              >
                <MenuItem value="none">{t('tour_group_none')}</MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g._id} value={g._id}>
                    {g.name}
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
                disabled={actionLoading}
              />
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tour_passenger_role')}</InputLabel>
              <Select
                value={newGroupSelected ? 'group_rep' : passengerForm.role || 'member'}
                label={t('tour_passenger_role')}
                onChange={(e) => setPassengerForm({ ...passengerForm, role: e.target.value })}
                disabled={newGroupSelected || actionLoading}
              >
                <MenuItem value="member">{t('tour_role_member_desc')}</MenuItem>
                <MenuItem value="group_rep">{t('tour_role_group_rep_desc')}</MenuItem>
                <MenuItem value="vehicle_rep">{t('tour_role_vehicle_rep_desc')}</MenuItem>
                <MenuItem value="driver">{t('tour_role_driver_desc')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Trạng thái duyệt</InputLabel>
              <Select
                value={passengerForm.status}
                label="Trạng thái duyệt"
                onChange={(e) => setPassengerForm({ ...passengerForm, status: e.target.value })}
                disabled={actionLoading}
              >
                <MenuItem value="approved">Đã duyệt (Approved)</MenuItem>
                <MenuItem value="pending">Chờ duyệt (Pending)</MenuItem>
                <MenuItem value="rejected">Từ chối (Rejected)</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="isDriverCheckboxEdit"
                checked={passengerForm.is_driver}
                onChange={(e) => setPassengerForm({ ...passengerForm, is_driver: e.target.checked })}
                style={{ marginRight: 8, transform: 'scale(1.2)', cursor: 'pointer' }}
                disabled={actionLoading}
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
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
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
              placeholder="Ví dụ: 29A-123.45"
              value={vehicleForm.license_plate}
              onChange={(e) => setVehicleForm({ ...vehicleForm, license_plate: e.target.value })}
            />

            <FormControl fullWidth margin="normal" required>
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
              placeholder="Ví dụ: 45"
              value={vehicleForm.seat_count}
              onChange={(e) => setVehicleForm({ ...vehicleForm, seat_count: e.target.value })}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tour_select_driver_from_list')}</InputLabel>
              <Select
                value={vehicleForm._selectedDriverId || 'none'}
                label={t('tour_select_driver_from_list')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'none') {
                    setVehicleForm(prev => ({ ...prev, _selectedDriverId: '', driver_name: '', driver_phone: '' }));
                  } else {
                    const pass = memberships.find(m => m._id === val);
                    const name = pass.user_id?.name || pass.guest_info?.name || '';
                    const phone = pass.user_id?.phone || pass.guest_info?.phone || '';
                    setVehicleForm(prev => ({ ...prev, _selectedDriverId: val, driver_name: name, driver_phone: phone }));
                  }
                }}
              >
                <MenuItem value="none">{t('tour_driver_manual_input')}</MenuItem>
                {memberships.filter(m => m.status !== 'left').map((m) => {
                  const name = m.user_id?.name || m.guest_info?.name;
                  const phone = m.user_id?.phone || m.guest_info?.phone;
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
          <Button type="submit" form="addVehicleForm" variant="contained" color="success" disabled={actionLoading}>
            {actionLoading ? '...' : t('btn_add_vehicle')}
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
              placeholder="Ví dụ: 29A-123.45"
              value={vehicleForm.license_plate}
              onChange={(e) => setVehicleForm({ ...vehicleForm, license_plate: e.target.value })}
            />

            <FormControl fullWidth margin="normal" required>
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
              placeholder="Ví dụ: 45"
              value={vehicleForm.seat_count}
              onChange={(e) => setVehicleForm({ ...vehicleForm, seat_count: e.target.value })}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>{t('tour_select_driver_from_list')}</InputLabel>
              <Select
                value={vehicleForm._selectedDriverId || 'none'}
                label={t('tour_select_driver_from_list')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'none') {
                    setVehicleForm(prev => ({ ...prev, _selectedDriverId: '', driver_name: '', driver_phone: '' }));
                  } else {
                    const pass = memberships.find(m => m._id === val);
                    const name = pass.user_id?.name || pass.guest_info?.name || '';
                    const phone = pass.user_id?.phone || pass.guest_info?.phone || '';
                    setVehicleForm(prev => ({ ...prev, _selectedDriverId: val, driver_name: name, driver_phone: phone }));
                  }
                }}
              >
                <MenuItem value="none">{t('tour_driver_manual_input')}</MenuItem>
                {memberships.filter(m => m.status !== 'left').map((m) => {
                  const name = m.user_id?.name || m.guest_info?.name;
                  const phone = m.user_id?.phone || m.guest_info?.phone;
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

              {/* Grid / Table of Occupants */}
              <Box>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_name')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_phone')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_gender')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>{t('col_birth_year')}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }} align="center">{t('col_action')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {memberships.filter(m => m.vehicle_id === activeVehicleForPassengers._id && m.status !== 'left').length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
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
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 520, width: '100%', overflow: 'hidden' } }}>
        <Box sx={{ background: accentGradient(theme), px: 3, py: 2.5, color: 'common.white' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <LinkIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">{t('tour_invite_link_title')}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>{t('tour_invite_link_tooltip')}</Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('tour_invite_link_desc', { tourName: tour.name })}
          </Typography>

          {(() => {
            const inviteToken = btoa(tour._id);
            const inviteLink = `${window.location.origin}/join/${inviteToken}`;
            return (
              <Box>
                <Box sx={{ bgcolor: 'action.hover', border: '1.5px solid', borderColor: inviteCopied ? 'success.main' : 'divider', borderRadius: 2.5, p: 2, mb: 2, wordBreak: 'break-all', transition: 'border-color 0.3s' }}>
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
                  <Button variant="outlined" fullWidth startIcon={<OpenInNewIcon />} onClick={() => window.open(inviteLink, '_blank')} sx={{ borderRadius: 2.5 }}>
                    {t('tour_open_link')}
                  </Button>
                </Stack>

                <Box sx={{ mt: 2.5, p: 1.5, bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.08), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.warning.main, 0.35) }}>
                  <Typography variant="caption" color="warning.dark">
                    {t('invite_link_expires')}{' '}
                    <strong>
                      {new Date(tour.start_time).toLocaleString(localeCode, { dateStyle: 'full', timeStyle: 'short' })}
                    </strong>
                  </Typography>
                </Box>
              </Box>
            );
          })()}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setInviteDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2.5 }}>
            {t('btn_close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ITINERARY CHECKPOINT */}
      {/* ========================================================================= */}
      <Dialog open={itineraryModalOpen} onClose={() => !actionLoading && setItineraryModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 500, width: '100%' } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {editItineraryId ? t('tour_itinerary_edit_title') : t('tour_itinerary_add_title')}
        </DialogTitle>
        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}
          <form id="itineraryForm" onSubmit={handleSaveItinerary}>
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_time')}
              type="datetime-local"
              value={itineraryForm.date}
              onChange={(e) => setItineraryForm({ ...itineraryForm, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              disabled={actionLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_location')}
              placeholder={t('tour_location_placeholder')}
              value={itineraryForm.location}
              onChange={(e) => setItineraryForm({ ...itineraryForm, location: e.target.value })}
              disabled={actionLoading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label={t('tour_activity')}
              placeholder={t('tour_activity_placeholder')}
              value={itineraryForm.activity}
              onChange={(e) => setItineraryForm({ ...itineraryForm, activity: e.target.value })}
              multiline
              rows={3}
              disabled={actionLoading}
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
      {/* MODAL: CHECK ATTENDANCE */}
      {/* ========================================================================= */}
      <Dialog
        open={attendanceModalOpen}
        onClose={() => !actionLoading && setAttendanceModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 2, maxWidth: 800, width: '100%' } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {t('tour_attendance_title')}
              </Typography>
              {selectedItinerary && (
                <Typography variant="caption" color="text.secondary">
                  {t('tour_checkpoint_label')}
                  <strong>
                    {selectedItinerary.location} ({new Date(selectedItinerary.date).toLocaleTimeString(localeCode, { timeStyle: 'short' })})
                  </strong>
                </Typography>
              )}
            </Box>
            <Chip
              label={t('tour_attendance_checked', {
                present: attendanceData.filter(a => a.status === 'present').length,
                total: attendanceData.length
              })}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {actionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{actionSuccess}</Alert>}

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, overflowY: 'auto', mt: 1, borderRadius: 3 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Hành khách</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Số điện thoại</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Phân nhóm/Nhóm</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>Có mặt (Present)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {t('tour_attendance_empty')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  memberships.filter(m => m.status !== 'left').map((m) => {
                    const isGuest = !m.user_id;
                    const name = isGuest ? m.guest_info?.name : m.user_id?.name;
                    const phone = isGuest ? m.guest_info?.phone : m.user_id?.phone;
                    const record = attendanceData.find(a => a.membership_id === m._id) || { status: 'absent' };
                    const isPresent = record.status === 'present';

                    // Group name
                    const passGroupId = m.group_id?._id || m.group_id;
                    const grp = groups.find(g => g._id === passGroupId);

                    // Group sibling IDs for bulk check
                    const groupMemberIds = grp
                      ? memberships.filter(sib => sib.group_id?._id === grp._id || sib.group_id === grp._id).map(sib => sib._id)
                      : [];

                    return (
                      <TableRow key={m._id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar {...stringAvatar(name || 'Unknown')} sx={{ ...stringAvatar(name || 'Unknown').sx, width: 28, height: 28, fontSize: '0.75rem' }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{name}</Typography>
                              <Typography variant="caption" color="text.secondary">({m.role})</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>{phone || t('tour_no_phone_provided')}</TableCell>
                        <TableCell>
                          {grp ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label={grp.name} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                              <Button
                                size="small"
                                variant="text"
                                color="success"
                                onClick={() => handleToggleGroupAttendance(groupMemberIds, true)}
                                sx={{ py: 0, px: 0.5, minWidth: 0, fontSize: '0.65rem', textTransform: 'none' }}
                              >
                                {t('tour_select_group')}
                              </Button>
                              <Button
                                size="small"
                                variant="text"
                                color="error"
                                onClick={() => handleToggleGroupAttendance(groupMemberIds, false)}
                                sx={{ py: 0, px: 0.5, minWidth: 0, fontSize: '0.65rem', textTransform: 'none' }}
                              >
                                {t('tour_deselect_group')}
                              </Button>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">{t('tour_group_individual')}</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={isPresent}
                            onChange={() => handleToggleAttendance(m._id)}
                            color="success"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setAttendanceModalOpen(false)} color="inherit" variant="outlined" disabled={actionLoading}>
            {t('cancel')}
          </Button>
          <Button
            variant="outlined"
            color="success"
            onClick={() => {
              const scopeIds = memberships.filter(m => m.status !== 'left').map(m => m._id);
              handleToggleGroupAttendance(scopeIds, true);
            }}
          >
            {t('tour_attendance_present_all')}
          </Button>
          <Button onClick={handleSaveAttendance} variant="contained" color="secondary" disabled={actionLoading} sx={{ minWidth: 130 }}>
            {actionLoading ? '...' : t('tour_save_attendance')}
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
