import { useTranslation } from 'react-i18next';

interface TProps {
  k: string;
}

export const T = ({ k }: TProps) => {
  const { t } = useTranslation();
  return t(k);
};
