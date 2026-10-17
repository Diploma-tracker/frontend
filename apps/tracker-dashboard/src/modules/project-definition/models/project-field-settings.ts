import { t } from '@/shared/utils/i18n';
import type { JsonSchema } from '@jsonforms/core';

import type { ProjectFieldType } from './types';

/**
 * JSON Schema of the (optional) per-type field settings. The editor feeds this
 * straight to JSON Forms without a UI schema, so both the controls and their
 * labels come from here. Types that take no settings return `null` and get no
 * settings section at all.
 */
export const projectFieldSettingsSchema = (
  type: ProjectFieldType,
): JsonSchema | null => {
  switch (type) {
    case 'string':
      return {
        type: 'object',
        properties: {
          minLength: {
            type: 'integer',
            minimum: 0,
            title: t('projectDefinition.properties.settings.minLength'),
          },
          maxLength: {
            type: 'integer',
            minimum: 0,
            title: t('projectDefinition.properties.settings.maxLength'),
          },
        },
      };
    case 'number':
      return {
        type: 'object',
        properties: {
          minimum: {
            type: 'number',
            title: t('projectDefinition.properties.settings.minimum'),
          },
          maximum: {
            type: 'number',
            title: t('projectDefinition.properties.settings.maximum'),
          },
        },
      };
    case 'bool':
    case 'grade':
    case 'date':
      return null;
  }
};
