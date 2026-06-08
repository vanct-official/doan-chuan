import React, { useEffect, useState } from 'react';
import { Fab, Tooltip, Zoom } from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { settingService } from '../services/settingService';
import { useTranslation } from 'react-i18next';

export const ContactFloatButton = () => {
  const { t } = useTranslation();
  const [contactLink, setContactLink] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchLink = async () => {
      try {
        const data = await settingService.getSetting('contact_link');
        if (active && data && data.success && data.value) {
          setContactLink(data.value);
          setVisible(true);
        }
      } catch (err) {
        console.error('Failed to load contact link:', err);
      }
    };
    fetchLink();
    return () => {
      active = false;
    };
  }, []);

  const handleClick = () => {
    if (!contactLink) return;
    
    let url = contactLink.trim();
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

  if (!visible || !contactLink) return null;

  return (
    <Zoom in={visible}>
      <Tooltip title={t('contact_support', 'Liên hệ hỗ trợ')} placement="left" arrow>
        <Fab
          color="primary"
          aria-label="contact support"
          onClick={handleClick}
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
          <SupportAgentIcon sx={{ fontSize: '1.8rem' }} />
        </Fab>
      </Tooltip>
    </Zoom>
  );
};
