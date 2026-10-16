import { useTranslation } from '@/shared/utils/i18n';
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';
import { cn } from '@repo/ui-kit/lib/utils';

import {
  AVAILABLE_FIELD_TYPES_BY_TYPE,
  fieldTypeLabelKeys,
  moveProjectFieldAction,
  projectFieldsAtom,
  removeProjectFieldAction,
  selectProjectFieldAction,
  selectedFieldIdAtom,
} from '../../models';

export const ProjectFieldsPanel = reatomComponent(
  function ProjectFieldsPanel() {
    const { t } = useTranslation();

    const fields = projectFieldsAtom();
    const selectedFieldId = selectedFieldIdAtom();

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('projectDefinition.fields.title')}</CardTitle>
          <CardAction>
            <Badge variant="outline">{fields.length}</Badge>
          </CardAction>
        </CardHeader>

        <CardContent>
          {fields.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {t('projectDefinition.fields.emptyTitle')}
                </EmptyTitle>
                <EmptyDescription>
                  {t('projectDefinition.fields.emptyDescription')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="flex flex-col gap-2">
              {fields.map((field, index) => {
                const meta = AVAILABLE_FIELD_TYPES_BY_TYPE[field.type];
                const Icon = meta.icon;
                const isSelected = field.id === selectedFieldId;

                return (
                  <li key={field.id}>
                    <div
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-accent/50',
                      )}
                      onClick={() => selectProjectFieldAction(field.id)}
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {field.name.trim() ||
                            t('projectDefinition.fields.untitled')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t(fieldTypeLabelKeys[field.type])}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t(
                          'projectDefinition.fields.actions.moveUp',
                        )}
                        disabled={index === 0}
                        onClick={(event) => {
                          event.stopPropagation();
                          moveProjectFieldAction(field.id, 'up');
                        }}
                      >
                        <ArrowUpIcon />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t(
                          'projectDefinition.fields.actions.moveDown',
                        )}
                        disabled={index === fields.length - 1}
                        onClick={(event) => {
                          event.stopPropagation();
                          moveProjectFieldAction(field.id, 'down');
                        }}
                      >
                        <ArrowDownIcon />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        intent="destructive"
                        aria-label={t(
                          'projectDefinition.fields.actions.remove',
                        )}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeProjectFieldAction(field.id);
                        }}
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    );
  },
  'ProjectFieldsPanel',
);
