import React, { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Avatar,
  Chip, Skeleton, IconButton, Stack, Divider, Collapse,
  Card, CardContent, Tooltip, useTheme, alpha,
} from '@mui/material';
import { customerTypeChip, groupPalette, memberCardSx } from '../tourDetailTheme';
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
import { useTranslate } from '../../../hooks/useTranslate';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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

function getMemberBirthYear(member) {
  if (member.user_id?.dob) {
    return new Date(member.user_id.dob).getFullYear();
  }
  if (member.guest_info?.birth_year) {
    return Number(member.guest_info.birth_year);
  }
  return null;
}

function getMemberAge(member) {
  const birthYear = getMemberBirthYear(member);
  if (birthYear) {
    return new Date().getFullYear() - birthYear;
  }
  return null;
}

function getMemberGender(member) {
  if (member.user_id) {
    return member.user_id.gender === true ? 'male' : member.user_id.gender === false ? 'female' : null;
  }
  return member.guest_info?.gender || null;
}

// ─── Member Card ──────────────────────────────────────────────────────────────

function MemberCard({ member, vehicles, canEditItinerary, currentUserId, onEdit, onDelete, onAssignVehicle, onLeave }) {
  const theme = useTheme();
  const { t } = useTranslate(['common', 'tour']);
  const name = getMemberName(member);
  const phone = getMemberPhone(member);
  const age = getMemberAge(member);
  const birthYear = getMemberBirthYear(member);
  const gender = getMemberGender(member);
  const vehicle = vehicles.find(v => v._id === (member.vehicle_id?._id || member.vehicle_id));
  const isLeft = member.status === 'left';
  const isOwn = (member.user_id?._id || member.user_id) === currentUserId;

  const roleInfo = member.role && member.role !== 'member' ? {
    label: member.role === 'leader' ? t('tour_role_leader') :
           member.role === 'group_rep' ? t('tour_role_group_rep') :
           member.role === 'vehicle_rep' ? t('tour_role_vehicle_rep') :
           member.role === 'driver' ? t('tour_role_driver') : '',
    color: member.role === 'leader' ? 'error' :
           member.role === 'group_rep' ? 'primary' :
           member.role === 'vehicle_rep' ? 'secondary' : 'info'
  } : null;

  const statusInfo = {
    label: member.status === 'approved' ? t('tour_status_approved') :
           member.status === 'pending' ? t('tour_status_pending') :
           member.status === 'rejected' ? t('tour_status_rejected') :
           member.status === 'removed' ? t('tour_status_removed') :
           member.status === 'left' ? t('tour_status_left') : t('tour_status_pending'),
    color: member.status === 'approved' ? 'success' :
           member.status === 'pending' ? 'warning' :
           member.status === 'rejected' ? 'error' :
           member.status === 'removed' ? 'error' : 'default'
  };

  const ctInfo = customerTypeChip(theme, member.customer_type);

  // Avatar color based on name
  const avatarBg = isLeft ? '#9ca3af' : member.role === 'leader' ? '#dc2626' : member.role === 'group_rep' ? '#2563eb' : '#6366f1';

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5,
        borderRadius: 3,
        border: '1px solid',
        transition: 'box-shadow 0.2s',
        ...memberCardSx(theme, member),
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
              borderColor: isLeft ? 'divider' : alpha(avatarBg, 0.4),
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
                {name || t('tour_unnamed')}
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
              <Tooltip title={t('btn_assign_seat')}>
                <IconButton size="small" onClick={() => onAssignVehicle(member)} sx={{ color: 'success.main' }}>
                  <DirectionsCarFilledIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title={t('common.edit')}>
                <IconButton size="small" onClick={() => onEdit(member)} sx={{ color: 'warning.main' }}>
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {isOwn && !isLeft && onLeave && (
              <Tooltip title={t('tour_status_left')}>
                <IconButton size="small" onClick={() => onLeave(member)} sx={{ color: 'primary.main' }}>
                  <ExitToAppIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {canEditItinerary && onDelete && (
              <Tooltip title={t('tour_status_removed')}>
                <IconButton size="small" onClick={() => onDelete(member._id)} sx={{ color: 'error.main' }}>
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Row 2: Info Chips */}
        <Box sx={{ display: 'flex', gap: 0.75, mt: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Age + Gender */}
          {(birthYear !== null || gender) && (
            <Chip
              icon={gender === 'male' ? <ManIcon style={{ fontSize: 12 }} /> : gender === 'female' ? <WomanIcon style={{ fontSize: 12 }} /> : <PersonIcon style={{ fontSize: 12 }} />}
              label={[
                gender === 'male' ? t('profile_male') : gender === 'female' ? t('profile_female') : null,
                birthYear && age ? t('tour_birth_year_with_age', { year: birthYear, age }) : birthYear ? t('tour_birth_year_only', { year: birthYear }) : null
              ].filter(Boolean).join(' · ')}
              size="small"
              sx={{ height: 22, fontSize: '0.72rem', bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 500 }}
            />
          )}

          {/* Customer type */}
          <Chip
            label={ctInfo.label}
            size="small"
            sx={{ height: 22, fontSize: '0.72rem', bgcolor: ctInfo.bgcolor, color: ctInfo.color, fontWeight: 600 }}
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
              label={t('seat_unassigned')}
              size="small"
              sx={{
                height: 22, fontSize: '0.72rem', fontWeight: 500,
                bgcolor: alpha(theme.palette.warning.main, 0.15),
                color: 'warning.dark',
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Group Section ─────────────────────────────────────────────────────────────

function GroupSection({ groupName, groupColor, members, vehicles, canEditItinerary, currentUserId, onEdit, onDelete, onAssignVehicle, onLeave }) {
  const theme = useTheme();
  const { t } = useTranslate(['common', 'tour']);
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
          bgcolor: groupColor || alpha(theme.palette.action.hover, 0.6),
          borderRadius: 2,
          cursor: 'pointer',
          mb: 1,
          userSelect: 'none',
        }}
      >
        <GroupsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
          {groupName}
        </Typography>
        <Chip
          label={t('tour_people_count', { count: activeCount })}
          size="small"
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: 'background.paper', color: 'text.secondary' }}
        />
        {open ? <ExpandLessIcon sx={{ fontSize: 18, color: 'text.disabled' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.disabled' }} />}
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
  onExportExcel,
}) {
  const { t } = useTranslate(['common', 'tour']);
  const theme = useTheme();
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
    const groupColors = groupPalette(theme);
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
        result.push({ key: g._id.toString(), name: g.name, color: groupColors.primary, members });
      }
    });

    // Fallback: members with group_id but group not in groups list
    groupMap.forEach((members, key) => {
      const alreadyAdded = result.some(r => r.key === key);
      if (!alreadyAdded) {
        const fallbackName = members.find(m => m.group_id?.name)?.group_id?.name || t('tour_group_suffix', { id: key.slice(-4) });
        result.push({ key, name: fallbackName, color: groupColors.success, members });
      }
    });

    // Ungrouped
    if (noGroup.length > 0) {
      result.push({ key: '__none__', name: t('tour_no_group'), color: groupColors.neutral, members: noGroup });
    }

    return result;
  }, [filteredMembers, groups, theme.palette.mode, t]);

  const totalActive = memberships.filter(m => m.status !== 'left').length;
  const totalPending = memberships.filter(m => m.status === 'pending').length;
  const totalNoVehicle = memberships.filter(m => !m.vehicle_id && m.status !== 'left').length;

  return (
    <Box sx={{ pb: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky header */}
      <Box sx={{
        p: 2, position: 'sticky', top: 0, zIndex: 10,
        bgcolor: 'background.default',
        boxShadow: theme.palette.mode === 'dark' ? 1 : '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('tour_search_passenger_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" sx={{ fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 3, bgcolor: 'background.paper' }
          }}
          sx={{ mb: 1.5 }}
        />

        {/* Filter Chips and Export Button Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' }, flex: 1 }}>
            {[
              { key: 'active', label: t('tour_filter_active', { count: totalActive }) },
              { key: 'pending', label: t('tour_filter_pending', { count: totalPending }), color: 'warning' },
              { key: 'no_vehicle', label: t('tour_filter_no_vehicle', { count: totalNoVehicle }), color: 'error' },
              { key: 'all', label: t('tour_filter_all') },
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
          {canEditItinerary && onExportExcel && (
            <Tooltip title={t('tour_export_excel')}>
              <IconButton
                size="small"
                color="primary"
                onClick={onExportExcel}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                  borderRadius: 2,
                  p: 0.75,
                  flexShrink: 0,
                }}
              >
                <FileDownloadIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
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
            <Typography color="text.secondary" mt={1}>{t('tour_no_passengers_found')}</Typography>
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
