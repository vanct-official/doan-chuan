import { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useTheme } from '@mui/material/styles';
import { useTranslate } from '../../hooks/useTranslate';

export const LanguageSwitcher = ({ color = 'inherit', edge }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t, i18n, currentLanguage, languages } = useTranslate('common');
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState(null);

  const open = Boolean(anchorEl) || drawerOpen;

  const handleOpen = (event) => {
    if (isMobile) {
      setDrawerOpen(true);
      return;
    }

    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setDrawerOpen(false);
  };

  const handleChangeLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) {
      handleClose();
      return;
    }

    setSwitchingTo(languageCode);
    try {
      await i18n.changeLanguage(languageCode);
    } finally {
      setSwitchingTo(null);
      handleClose();
    }
  };

  const renderLanguageLabel = (language) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box component="span" aria-hidden="true" sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
        {language.flag}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.15 }} noWrap>
          {language.nativeName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {language.shortName}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <IconButton
        color={color}
        edge={edge}
        onClick={handleOpen}
        aria-label={t('common.language.open')}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
        sx={{ width: 44, height: 44 }}
      >
        {switchingTo ? <CircularProgress size={22} color="inherit" /> : <TranslateIcon />}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={!isMobile && Boolean(anchorEl)}
        onClose={handleClose}
        keepMounted
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            selected={language.code === currentLanguage}
            onClick={() => handleChangeLanguage(language.code)}
            sx={{ minHeight: 48, minWidth: 180, gap: 1.5 }}
          >
            <Box sx={{ flex: 1 }}>{renderLanguageLabel(language)}</Box>
            {language.code === currentLanguage && <CheckIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>

      <Drawer
        anchor="bottom"
        open={isMobile && drawerOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            pb: 'env(safe-area-inset-bottom)',
          },
        }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Box sx={{ width: 42, height: 4, borderRadius: 999, bgcolor: 'divider', mx: 'auto', mb: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            {t('common.language.title')}
          </Typography>
          <List disablePadding>
            {languages.map((language) => (
              <ListItemButton
                key={language.code}
                selected={language.code === currentLanguage}
                onClick={() => handleChangeLanguage(language.code)}
                sx={{ minHeight: 56, borderRadius: 2, mb: 0.5 }}
              >
                <Box sx={{ flex: 1 }}>{renderLanguageLabel(language)}</Box>
                {language.code === currentLanguage && <CheckIcon color="primary" />}
              </ListItemButton>
            ))}
          </List>
        </Box>
        <BottomNavigation
          showLabels
          value={currentLanguage}
          onChange={(_, value) => handleChangeLanguage(value)}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        >
          {languages.map((language) => (
            <BottomNavigationAction
              key={language.code}
              value={language.code}
              label={language.shortName}
              icon={<Box component="span" sx={{ fontSize: '1.2rem' }}>{language.flag}</Box>}
              sx={{ minWidth: 64 }}
            />
          ))}
        </BottomNavigation>
      </Drawer>
    </>
  );
};
