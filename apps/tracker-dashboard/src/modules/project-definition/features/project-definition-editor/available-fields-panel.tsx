import { useTranslation } from '@/shared/utils/i18n';
import { PlusIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';

import {
  AVAILABLE_FIELD_TYPES_BY_TYPE,
  PROJECT_FIELD_TYPES,
  addProjectFieldAction,
  fieldTypeLabelKeys,
} from '../../models';

export const AvailableFieldsPanel = reatomComponent(
  function AvailableFieldsPanel() {
    const { t } = useTranslation();

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('projectDefinition.available.title')}</CardTitle>
          <CardDescription>
            {t('projectDefinition.available.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-2">
          {PROJECT_FIELD_TYPES.map((type) => {
            const meta = AVAILABLE_FIELD_TYPES_BY_TYPE[type];
            const Icon = meta.icon;

            return (
              <Button
                key={type}
                type="button"
                variant="outline"
                className="justify-start gap-2"
                onClick={() => addProjectFieldAction(type)}
              >
                <Icon className="size-4 text-muted-foreground" />
                {t(fieldTypeLabelKeys[type])}
                <PlusIcon className="ml-auto size-4 text-muted-foreground" />
              </Button>
            );
          })}
        </CardContent>
      </Card>
    );
  },
  'AvailableFieldsPanel',
);
