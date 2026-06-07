import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

export const useTranslate = (namespaces = ['common']) => {
  const namespaceList = Array.isArray(namespaces) ? namespaces : [namespaces];
  const translation = useTranslation(namespaceList);
  const { t: translate, i18n, ready } = translation;

  const language = useMemo(
    () => SUPPORTED_LANGUAGES.find((item) => item.code === i18n.resolvedLanguage) || SUPPORTED_LANGUAGES[0],
    [i18n.resolvedLanguage]
  );

  const t = useCallback(
    (key, options) => translate(key, options),
    [translate]
  );

  return {
    ...translation,
    t,
    ready,
    language,
    currentLanguage: language.code,
    languages: SUPPORTED_LANGUAGES,
    changeLanguage: i18n.changeLanguage.bind(i18n),
  };
};
