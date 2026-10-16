import { useEffect } from 'react';

import { useTranslation } from '@/shared/utils/i18n';
import { CircleNotchIcon, FloppyDiskIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';
import { Skeleton } from '@repo/ui-kit/components/common/states/skeleton';

import {
  hasDuplicateRoleNamesAtom,
  loadProjectDefinitionAction,
  projectFieldsAtom,
  projectRolesAtom,
  saveProjectDefinitionAction,
} from '../../models';
import { AvailableFieldsPanel } from './available-fields-panel';
import { FieldPropertiesPanel } from './field-properties-panel';
import { ProjectFieldsPanel } from './project-fields-panel';
import { RoleDefinitionsPanel } from './role-definitions-panel';

export const ProjectDefinitionEditor = reatomComponent(
  function ProjectDefinitionEditor() {
    const { t } = useTranslation();

    const loadStatus = loadProjectDefinitionAction.status();
    const saveStatus = saveProjectDefinitionAction.status();
    const fields = projectFieldsAtom();
    const roles = projectRolesAtom();

    const hasInvalidNames =
      fields.some((field) => !field.name.trim()) ||
      roles.some((role) => !role.name.trim());
    const hasDuplicateRoleNames = hasDuplicateRoleNamesAtom();
    const isLoading = loadStatus.isPending || !loadStatus.isEverPending;

    useEffect(() => {
      if (!loadProjectDefinitionAction.status().isEverPending) {
        wrap(loadProjectDefinitionAction());
      }
    }, []);

    const handleRetry = () => {
      loadProjectDefinitionAction.status.reset();
      wrap(loadProjectDefinitionAction());
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {t('projectDefinition.title')}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t('projectDefinition.description')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasInvalidNames && (
              <p className="text-sm text-destructive">
                {t('projectDefinition.actions.saveDisabledHint')}
              </p>
            )}

            {!hasInvalidNames && hasDuplicateRoleNames && (
              <p className="text-sm text-destructive">
                {t('projectDefinition.roles.duplicateName')}
              </p>
            )}

            <Button
              type="button"
              disabled={
                saveStatus.isPending ||
                !loadStatus.isFulfilled ||
                hasInvalidNames ||
                hasDuplicateRoleNames
              }
              onClick={() => wrap(saveProjectDefinitionAction())}
            >
              {saveStatus.isPending ? (
                <CircleNotchIcon className="animate-spin" />
              ) : (
                <FloppyDiskIcon />
              )}
              {t('projectDefinition.actions.save')}
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        )}

        {loadStatus.isRejected && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t('projectDefinition.load.errorTitle')}</EmptyTitle>
              <EmptyDescription>
                {t('projectDefinition.load.errorDescription')}
              </EmptyDescription>
            </EmptyHeader>
            <Button type="button" variant="outline" onClick={handleRetry}>
              {t('projectDefinition.load.retry')}
            </Button>
          </Empty>
        )}

        {loadStatus.isFulfilled && (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <AvailableFieldsPanel />
              <ProjectFieldsPanel />
              <FieldPropertiesPanel />
            </div>

            <RoleDefinitionsPanel />
          </>
        )}
      </div>
    );
  },
  'ProjectDefinitionEditor',
);
