import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Avatar,
  Chip, Skeleton, IconButton, Stack, Divider, Collapse,
  Card, CardContent, Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GroupsIcon from '@mui/icons-material/Groups';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import { useTranslation } from 'react-i18next';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getMemberName(member) {
  return member.user_id?.name || member.guest_info?.name || '';
}

function getMemberPhone(member) {
  return member.user_id?.phone || member.guest_info?.phone || member.phone || '';
}

function getMemberAge(member) {
  if (member.user_id?.dob) {
    return new Date().getFullYear() - new Date(member.user_id.dob).getFullYear();
  }
  if (member.guest_info?.birth_year) {
    return new Date().getFullYear() - Number(member.guest_info.birth_year);
  }
  return null;
}

function getMemberGender(member) {
  if (member.user_id) {
    return member.user_id.gender === true ? 'male' : member.user_id.gender === false ? 'female' : null;
  }
  return member.guest_info?.gender || null;
}

const CUSTOMER_TYPE_LABELS = {
  adult: { label: 'Người lớn', color: '#3b82f6', bg: '#eff6ff' },
  child: { label: 'Trẻ em', color: '#f59e0b', bg: '#fffbeb' },
  elderly: { label: 'Người cao tuổi', color: '#8b5cf6', bg: '#f5f3ff' },
};

const ROLE_LABELS = {
  leader: { label: '👑 Trưởng đoàn', color: 'error' },
  group_rep: { label: '🏷️ Trưởng nhóm', color: 'primary' },
  vehicle_rep: { label: '🚌 Trưởng xe', color: 'secondary' },
  driver: { label: '🚗 Tài xế', color: 'info' },
  member: null,
};

const STATUS_CONFIG = {
  approved: { label: 'Đã duyệt', color: 'success' },
  pending: { label: 'Chờ duyệt', color: 'warning' },
  rejected: { label: 'Từ chối', color: 'error' },
  removed: { label: 'Đã xóa', color: 'error' },
  left: { label: 'Đã rời', color: 'default' },
};

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({ member, vehicles, canEditItinerary, currentUserId, onEdit, onDelete, onAssignVehicle, onLeave }) {
  const name = getMemberName(member);
  const phone = getMemberPhone(member);
  const age = getMemberAge(member);
  const gender = getMemberGender(member);
  const vehicle = vehicles.find(v => v._id === (member.vehicle_id?._id || member.vehicle_id));
  const isLeft = member.status === 'left';
  const isOwn = (member.user_id?._id || member.user_id) === currentUserId;

  const roleInfo = ROLE_LABELS[member.role];
  const ctInfo = CUSTOMER_TYPE_LABELS[member.customer_type] || CUSTOMER_TYPE_LABELS.adult;
  const statusInfo = STATUS_CONFIG[member.status] || STATUS_CONFIG.pending;

  // Avatar color based on name
  const avatarBg = isLeft ? '#9ca3af' : member.role === 'leader' ? '#dc2626' : member.role === 'group_rep' ? '#2563eb' : '#6366f1';

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: isLeft ? '#e5e7eb' : member.status === 'pending' ? '#fcd34d' : '#e2e8f0',
        bgcolor: isLeft ? '#f9fafb' : 'white',
        opacity: isLeft ? 0.75 : 1,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: isLeft ? 'none' : '0 4px 12px rgba(0,0,0,0.08)' },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Row 1: Avatar + Name + Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 44, height: 44,
              bgcolor: avatarBg,
              fontSize: '1rem', fontWeight: 800,
              flexShrink: 0,
              border: '2px solid',
              borderColor: isLeft ? '#e5e7eb' : `${avatarBg}40`,
            }}
          >
            {getInitials(name)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Name + Role */}
            <Stack direction="row" alignItems="center" spacing={0.5} flexWrap="wrap">
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  lineHeight: 1.3,
                  color: isLeft ? 'text.disabled' : 'text.primary',
                }}
              >
                {name || '(Chưa có tên)'}
              </Typography>
              {roleInfo && (
                <Chip
                  label={roleInfo.label}
                  size="small"
                  color={roleInfo.color}
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                />
              )}
            </Stack>

            {/* Phone */}
            {phone && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                📞 {phone}
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={0} flexShrink={0}>
            {canEditItinerary && onAssignVehicle && !isLeft && (
              <Tooltip title="Xếp xe">
                <IconButton size="small" onClick={() => onAssignVehicle(member)} sx={{ color: '#10b981' }}>
                  <DirectionsCarFilledIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Chỉnh sửa">
                <IconButton size="small" onClick={() => onEdit(member)} sx={{ color: '#f59e0b' }}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {isOwn && !isLeft && onLeave && (
              <Tooltip title="Rời tour">
                <IconButton size="small" onClick={() => onLeave(member)} sx={{ color: '#6366f1' }}>
                  <ExitToAppIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {canEditItinerary && onDelete && (
              <Tooltip title="Xóa khỏi tour">
                <IconButton size="small" onClick={() => onDelete(member._id)} sx={{ color: '#ef4444' }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Row 2: Info Chips */}
        <Box sx={{ display: 'flex', gap: 0.75, mt: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Age + Gender */}
          {(age !== null || gender) && (
            <Chip
              icon={gender === 'male' ? <ManIcon style={{ fontSize: 12 }} /> : gender === 'female' ? <WomanIcon style={{ fontSize: 12 }} /> : <PersonIcon style={{ fontSize: 12 }} />}
              label={[gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : null, age ? `${age} tuổi` : null].filter(Boolean).join(' · ')}
              size="small"
              sx={{ height: 22, fontSize: '0.72rem', bgcolor: '#f8fafc', color: '#475569', fontWeight: 500 }}
            />
          )}

          {/* Customer type */}
          <Chip
            label={ctInfo.label}
            size="small"
            sx={{ height: 22, fontSize: '0.72rem', bgcolor: ctInfo.bg, color: ctInfo.color, fontWeight: 600 }}
          />

          {/* Status */}
          <Chip
            label={statusInfo.label}
            size="small"
            color={statusInfo.color}
            variant={member.status === 'approved' ? 'filled' : 'outlined'}
            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600 }}
          />

          {/* Vehicle */}
          {vehicle ? (
            <Chip
              icon={<DirectionsCarIcon style={{ fontSize: 12 }} />}
              label={vehicle.license_plate}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.72rem' }}
            />
          ) : !isLeft && (
            <Chip
              label="Chưa có xe"
              size="small"
              sx={{ height: 22, fontSize: '0.72rem', bgcolor: '#fef9c3', color: '#92400e', fontWeight: 500 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Group Section ─────────────────────────────────────────────────────────────

function GroupSection({ groupName, groupColor, members, vehicles, canEditItinerary, currentUserId, onEdit, onDelete, onAssignVehicle, onLeave }) {
  const [open, setOpen] = useState(true);
  const activeCount = members.filter(m => m.status !== 'left').length;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Group Header */}
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 1,
          bgcolor: groupColor || '#f1f5f9',
          borderRadius: 2,
          cursor: 'pointer',
          mb: 1,
          userSelect: 'none',
        }}
      >
        <GroupsIcon sx={{ fontSize: 18, color: '#475569' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', flex: 1 }}>
          {groupName}
        </Typography>
        <Chip
          label={`${activeCount} người`}
          size="small"
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: 'white', color: '#475569' }}
        />
        {open ? <ExpandLessIcon sx={{ fontSize: 18, color: '#94a3b8' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: '#94a3b8' }} />}
      </Box>

      <Collapse in={open}>
        <Box sx={{ pl: 0.5 }}>
          {members.map(member => (
            <MemberCard
              key={member._id}
              member={member}
              vehicles={vehicles}
              canEditItinerary={canEditItinerary}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssignVehicle={onAssignVehicle}
              onLeave={onLeave}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PeopleTab({
  memberships,
  vehicles,
  groups,
  loading,
  canEditItinerary,
  currentUserId,
  onEditPassenger,
  onAssignVehicle,
  onDeletePassenger,
  onLeavePassenger,
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'pending', 'all', 'no_vehicle'

  // Filter members
  const filteredMembers = useMemo(() => {
    return memberships.filter(m => {
      const name = getMemberName(m);
      const phone = getMemberPhone(m);
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        phone.includes(search);

      let matchesFilter = true;
      if (filterStatus === 'active') matchesFilter = m.status === 'approved' || m.status === 'pending';
      else if (filterStatus === 'pending') matchesFilter = m.status === 'pending';
      else if (filterStatus === 'no_vehicle') matchesFilter = !m.vehicle_id && m.status !== 'left';
      // 'all' = show everything

      return matchesSearch && matchesFilter;
    });
  }, [memberships, search, filterStatus]);

  // Group members by group_id
  const grouped = useMemo(() => {
    const groupMap = new Map();

    // Nhóm có group_id
    filteredMembers.forEach(m => {
      const gId = m.group_id?._id || m.group_id;
      if (gId) {
        const key = gId.toString();
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key).push(m);
      }
    });

    // Không có nhóm
    const noGroup = filteredMembers.filter(m => !m.group_id);

    const result = [];

    // Build from groups metadata
    groups.forEach(g => {
      const members = groupMap.get(g._id.toString());
      if (members && members.length > 0) {
        result.push({ key: g._id.toString(), name: g.name, color: '#e0f2fe', members });
      }
    });

    // Fallback: members with group_id but group not in groups list
    groupMap.forEach((members, key) => {
      const alreadyAdded = result.some(r => r.key === key);
      if (!alreadyAdded) {
        result.push({ key, name: `Nhóm (${key.slice(-4)})`, color: '#f0fdf4', members });
      }
    });

    // Ungrouped
    if (noGroup.length > 0) {
      result.push({ key: '__none__', name: 'Chưa có nhóm', color: '#fafafa', members: noGroup });
    }

    return result;
  }, [filteredMembers, groups]);

  const totalActive = memberships.filter(m => m.status !== 'left').length;
  const totalPending = memberships.filter(m => m.status === 'pending').length;
  const totalNoVehicle = memberships.filter(m => !m.vehicle_id && m.status !== 'left').length;

  return (
    <Box sx={{ pb: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky header */}
      <Box sx={{ p: 2, position: 'sticky', top: 0, bgcolor: '#f8fafc', zIndex: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm tên, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" sx={{ fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 3, bgcolor: 'white' }
          }}
          sx={{ mb: 1.5 }}
        />

        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
          {[
            { key: 'active', label: `Đang tham gia (${totalActive})` },
            { key: 'pending', label: `Chờ duyệt (${totalPending})`, color: 'warning' },
            { key: 'no_vehicle', label: `Chưa có xe (${totalNoVehicle})`, color: 'error' },
            { key: 'all', label: 'Tất cả' },
          ].map(f => (
            <Chip
              key={f.key}
              label={f.label}
              onClick={() => setFilterStatus(f.key)}
              color={filterStatus === f.key ? (f.color || 'primary') : 'default'}
              variant={filterStatus === f.key ? 'filled' : 'outlined'}
              size="small"
              sx={{ fontWeight: filterStatus === f.key ? 700 : 400, flexShrink: 0, fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 2, pt: 1.5, flex: 1, overflowY: 'auto' }}>
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={44} height={44} sx={{ mr: 1.5, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" height={20} />
                <Skeleton variant="text" width="35%" height={16} />
                <Skeleton variant="text" width="70%" height={16} />
              </Box>
            </Box>
          ))
        ) : filteredMembers.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography fontSize="2.5rem">🔍</Typography>
            <Typography color="text.secondary" mt={1}>Không tìm thấy hành khách nào.</Typography>
          </Box>
        ) : (
          grouped.map(group => (
            <GroupSection
              key={group.key}
              groupName={group.name}
              groupColor={group.color}
              members={group.members}
              vehicles={vehicles}
              canEditItinerary={canEditItinerary}
              currentUserId={currentUserId}
              onEdit={onEditPassenger}
              onDelete={onDeletePassenger}
              onAssignVehicle={onAssignVehicle}
              onLeave={onLeavePassenger}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
