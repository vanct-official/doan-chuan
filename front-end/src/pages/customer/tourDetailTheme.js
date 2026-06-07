import { alpha } from '@mui/material/styles';

/** Gradient hero card (Overview, modal header) */
export function heroGradient(theme) {
  return theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)'
    : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)';
}

export function accentGradient(theme) {
  return theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #5b21b6 0%, #4f46e5 100%)'
    : 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)';
}

/** Attendance member row */
export function attendanceMemberSx(theme, isPresent) {
  const palette = isPresent ? theme.palette.success : theme.palette.error;
  const opacity = theme.palette.mode === 'dark' ? 0.18 : 0.08;
  return {
    borderColor: alpha(palette.main, 0.5),
    bgcolor: alpha(palette.main, opacity),
    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.12)}`,
    },
  };
}

export function attendanceAvatarBorder(theme, isPresent) {
  const main = isPresent ? theme.palette.success.main : theme.palette.error.main;
  return alpha(main, 0.5);
}

/** Attendance group header */
export function groupHeaderColors(theme, isNone) {
  if (isNone) {
    return {
      bgcolor: alpha(theme.palette.action.hover, theme.palette.mode === 'dark' ? 0.4 : 0.8),
      borderColor: 'divider',
      titleColor: 'text.secondary',
    };
  }
  return {
    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
    borderColor: alpha(theme.palette.primary.main, 0.35),
    titleColor: 'primary.main',
  };
}

/** PeopleTab member card */
export function memberCardSx(theme, member) {
  const isLeft = member.status === 'left';
  return {
    borderColor: isLeft
      ? 'divider'
      : member.status === 'pending'
        ? alpha(theme.palette.warning.main, 0.45)
        : 'divider',
    bgcolor: isLeft
      ? (theme.palette.mode === 'dark' ? 'action.hover' : alpha(theme.palette.action.disabledBackground, 0.5))
      : 'background.paper',
    opacity: isLeft ? 0.75 : 1,
    '&:hover': {
      boxShadow: isLeft ? 'none' : `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
    },
  };
}

/** Customer type chip */
export function customerTypeChip(theme, type) {
  const types = {
    adult: { label: 'Người lớn', main: theme.palette.info.main },
    child: { label: 'Trẻ em', main: theme.palette.warning.main },
    elderly: { label: 'Người cao tuổi', main: theme.palette.secondary.main },
  };
  const t = types[type] || types.adult;
  return {
    label: t.label,
    bgcolor: alpha(t.main, theme.palette.mode === 'dark' ? 0.22 : 0.1),
    color: t.main,
  };
}

/** Group section header background palette */
export function groupPalette(theme) {
  return {
    primary: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
    success: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
    neutral: alpha(theme.palette.action.hover, theme.palette.mode === 'dark' ? 0.35 : 0.7),
  };
}
