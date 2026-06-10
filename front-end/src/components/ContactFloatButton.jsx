import React, { useEffect, useState } from 'react';
import { Fab, Tooltip, Zoom, SpeedDial, SpeedDialIcon, SpeedDialAction, Avatar } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import ChatIcon from '@mui/icons-material/Chat';
import MapIcon from '@mui/icons-material/Map';
import { settingService } from '../services/settingService';
import { useTranslation } from 'react-i18next';

export const ContactFloatButton = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchContacts = async () => {
      try {
        // Try fetching plural links
        const resPlural = await settingService.getSetting('contact_links');
        if (active && resPlural && resPlural.success && resPlural.value) {
          try {
            const parsed = JSON.parse(resPlural.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const sanitized = parsed.map(c => ({
                label: c.label || '',
                value: c.value || '',
                icon: c.icon || 'support',
                imageUrl: c.imageUrl || ''
              }));
              setContacts(sanitized);
              setVisible(true);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse contact_links, trying singular fallback', e);
          }
        }

        // Fallback: singular link
        const resSingular = await settingService.getSetting('contact_link');
        if (active && resSingular && resSingular.success && resSingular.value) {
          setContacts([{ label: t('contact_support', 'Liên hệ hỗ trợ'), value: resSingular.value, icon: 'support', imageUrl: '' }]);
          setVisible(true);
        }
      } catch (err) {
        console.error('Failed to load contacts settings:', err);
      }
    };

    fetchContacts();
    return () => {
      active = false;
    };
  }, [t]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenUrl = (val) => {
    if (!val) return;
    let url = val.trim();
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('tel:') || url.startsWith('mailto:')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      if (/^[0-9+\s().-]+$/.test(url)) {
        window.open(`tel:${url}`, '_blank');
      } else {
        window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const getIconForValue = (val) => {
    if (!val) return <SupportAgentIcon />;
    const url = val.toLowerCase();
    if (url.includes('zalo.me') || url.includes('messenger.com') || url.includes('m.me') || url.includes('facebook.com')) {
      return <ChatIcon />;
    }
    if (url.startsWith('tel:') || /^[0-9+\s().-]+$/.test(val.trim())) {
      return <PhoneIcon />;
    }
    if (url.startsWith('mailto:')) {
      return <EmailIcon />;
    }
    return <LanguageIcon />;
  };

  const getIconForContact = (contact, isFab = false) => {
    if (contact.icon === 'image' && contact.imageUrl) {
      return (
        <Avatar
          src={contact.imageUrl}
          alt={contact.label}
          sx={{
            width: isFab ? 32 : 24,
            height: isFab ? 32 : 24,
            bgcolor: 'transparent'
          }}
        />
      );
    }

    switch (contact.icon) {
      case 'support':
        return <SupportAgentIcon />;
      case 'chat':
        return <ChatIcon />;
      case 'phone':
        return <PhoneIcon />;
      case 'email':
        return <EmailIcon />;
      case 'link':
        return <LanguageIcon />;
      case 'map':
        return <MapIcon />;
      default:
        return getIconForValue(contact.value);
    }
  };

  if (!visible || contacts.length === 0) return null;

  // Render simple FAB if only 1 contact
  if (contacts.length === 1) {
    return (
      <Zoom in={visible}>
        <Tooltip title={contacts[0].label || t('contact_support', 'Liên hệ hỗ trợ')} placement="left" arrow>
          <Fab
            color="primary"
            aria-label="contact support"
            onClick={() => handleOpenUrl(contacts[0].value)}
            sx={{
              position: 'fixed',
              bottom: { xs: 16, sm: 24 },
              right: { xs: 16, sm: 24 },
              zIndex: 1200,
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
                background: 'linear-gradient(135deg, #4338ca 0%, #2563eb 100%)',
                boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.5)',
              },
            }}
          >
            {getIconForContact(contacts[0], true)}
          </Fab>
        </Tooltip>
      </Zoom>
    );
  }

  // Render SpeedDial if multiple contacts
  return (
    <Zoom in={visible}>
      <SpeedDial
        ariaLabel="Support Contacts SpeedDial"
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1200,
          '& .MuiSpeedDial-fab': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4338ca 0%, #2563eb 100%)',
              boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.5)',
            }
          }
        }}
        icon={<SpeedDialIcon icon={<SupportAgentIcon />} />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {contacts.map((c, index) => (
          <SpeedDialAction
            key={index}
            icon={getIconForContact(c, false)}
            tooltipTitle={c.label}
            tooltipOpen
            onClick={() => {
              handleOpenUrl(c.value);
              handleClose();
            }}
            sx={{
              whiteSpace: 'nowrap',
              '& .MuiSpeedDialAction-staticTooltipLabel': {
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                px: 1.5,
                py: 0.5
              }
            }}
          />
        ))}
      </SpeedDial>
    </Zoom>
  );
};
