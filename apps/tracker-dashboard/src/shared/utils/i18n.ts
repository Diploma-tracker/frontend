import { useTranslation as useTranslationRaw } from 'react-i18next';
import type { UseTranslationResponse } from 'react-i18next';

import i18n from '@/app/config/i18n';

interface TProps {
  k: string;
}

export const T = ({ k }: TProps): string => {
  const { t } = useTranslation();
  return t(k);
};

export const t = (key: string): string => i18n.t(key);

export const k = (key: string): string => key;

export const useTranslation = useTranslationRaw as () => UseTranslationResponse<'translation', undefined>;
