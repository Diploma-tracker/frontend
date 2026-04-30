import { useTranslation as useTranslationRaw } from 'react-i18next';
import type { UseTranslationResponse } from 'react-i18next';

import i18n from '@/app/config/i18n';

interface TProps {
  k: string;
}

/**
 * Standalone translation component for use in non-reactive render contexts —
 * e.g. as a column header renderer in a table definition, where you need a
 * React element but cannot call hooks at the call site.
 *
 * @example
 * // Table column header
 * header: () => <T k="projectEnrollment.allocationRound.table.columns.status" />,
 */
export const T = ({ k }: TProps): string => {
  const { t } = useTranslation();
  return t(k);
};

/**
 * Eager, non-reactive translation call backed by the global i18n instance.
 * Use this for **lazy** string resolution that happens outside the React
 * render cycle — for example, building Zod validation schemas or any other
 * place where a translated message is needed but hooks are not available.
 *
 * @example
 * // Zod schema validation message
 * z.string().min(1, t('form.validation.nameRequired'))
 */
export const t = (key: string): string => i18n.t(key);

/**
 * Identity function that marks a string literal as an i18n key without
 * resolving it. Use this to declare constant key maps so the i18n checker
 * can statically detect which keys are in use while deferring the actual
 * translation to a later `t()` / `useTranslation` call.
 *
 * @example
 * const STATUS_LABEL_KEY: Record<Status, string> = {
 *   DRAFT: k('projectEnrollment.allocationRound.status.draft'),
 *   OPEN:  k('projectEnrollment.allocationRound.status.open'),
 * };
 * // Later, inside a component:
 * t(STATUS_LABEL_KEY[status])
 */
export const k = <T>(key: T): T => key;

/**
 * Typed wrapper around `react-i18next`'s `useTranslation` hook, narrowed to
 * the default `'translation'` namespace. Use this in regular React components
 * that need reactive translations (re-renders on locale change).
 *
 * @example
 * const MyComponent = () => {
 *   const { t } = useTranslation();
 *   return <p>{t('common.save')}</p>;
 * };
 */
export const useTranslation = useTranslationRaw as () => UseTranslationResponse<'translation', undefined>;
