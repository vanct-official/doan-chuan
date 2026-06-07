import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/ja';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTranslate } from '../../hooks/useTranslate';

const localeText = {
  en: {
    okButtonLabel: 'OK',
    cancelButtonLabel: 'Cancel',
    todayButtonLabel: 'Today',
    clearButtonLabel: 'Clear',
  },
  vi: {
    okButtonLabel: 'Đồng ý',
    cancelButtonLabel: 'Hủy',
    todayButtonLabel: 'Hôm nay',
    clearButtonLabel: 'Xóa',
  },
  ja: {
    okButtonLabel: '確定',
    cancelButtonLabel: 'キャンセル',
    todayButtonLabel: '今日',
    clearButtonLabel: 'クリア',
  },
};

export const AppLocalizationProvider = ({ children }) => {
  const { language } = useTranslate('common');

  useEffect(() => {
    dayjs.locale(language.dayjsLocale);
  }, [language.dayjsLocale]);

  const pickerLocaleText = useMemo(
    () => localeText[language.code] || localeText.en,
    [language.code]
  );

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={language.dayjsLocale}
      localeText={pickerLocaleText}
    >
      {children}
    </LocalizationProvider>
  );
};
