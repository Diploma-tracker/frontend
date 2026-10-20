import { useEffect, useState } from 'react';

import { createPaletteAnchorModifier } from '@/shared/components/dnd/palette-anchor-modifier';
import { createPaletteCollisionDetection } from '@/shared/components/dnd/palette-collision';
import { useTranslation } from '@/shared/utils/i18n';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CircleNotchIcon, FloppyDiskIcon } from '@phosphor-icons/react';
import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import { FieldLabel } from '@repo/ui-kit/components/common/form/field';
import { Input } from '@repo/ui-kit/components/common/form/input';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@repo/ui-kit/components/common/states/empty';
import { Skeleton } from '@repo/ui-kit/components/common/states/skeleton';

import {
  PROJECT_FIELDS_DROPPABLE_ID,
  addProjectFieldAction,
  beginProjectFieldDragAction,
  endProjectFieldDragAction,
  hasDuplicateRoleNamesAtom,
  loadProjectDefinitionAction,
  projectDefinitionNameAtom,
  projectFieldDragSessionAtom,
  projectFieldsAtom,
  projectRolesAtom,
  reorderProjectFieldsAction,
  saveProjectDefinitionAction,
} from '../../models';
import {
  AvailableFieldsPanel,
  FieldPropertiesPanel,
  ProjectFieldsDragOverlay,
  ProjectFieldsPanel,
} from '../fields';
import { RoleDefinitionsPanel } from '../roles';

const isPaletteDrag = (data: unknown) =>
  (data as { source?: string } | undefined)?.source === 'palette';

const collisionDetection = createPaletteCollisionDetection(
  isPaletteDrag,
  PROJECT_FIELDS_DROPPABLE_ID,
);

const paletteAnchorModifier = createPaletteAnchorModifier(isPaletteDrag);

export const ProjectDefinitionEditor = reatomComponent(
  function ProjectDefinitionEditor() {
    const { t } = useTranslation();

    const loadStatus = loadProjectDefinitionAction.status();
    const saveStatus = saveProjectDefinitionAction.status();
    const fields = projectFieldsAtom();
    const roles = projectRolesAtom();
    const name = projectDefinitionNameAtom();
    const [isNameTouched, setIsNameTouched] = useState(false);

    const hasUnnamedFieldsOrRoles =
      fields.some((field) => !field.name.trim()) ||
      roles.some((role) => !role.name.trim());
    const hasInvalidNames = !name.trim() || hasUnnamedFieldsOrRoles;
    const isNameInvalid = isNameTouched && !name.trim();
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

    const sensors = useSensors(
      useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    const handleDragStart = (event: DragStartEvent) => {
      const { active } = event;
      const data = active.data.current;

      if (data?.source === 'palette') {
        beginProjectFieldDragAction({ source: 'palette', type: data.type });
        return;
      }

      if (data?.source === 'fields') {
        beginProjectFieldDragAction({
          source: 'fields',
          id: String(active.id),
        });
      }
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      const session = projectFieldDragSessionAtom();

      if (!session || !over) {
        endProjectFieldDragAction(null);
        return;
      }

      if (session.source === 'palette') {
        if (over.id === PROJECT_FIELDS_DROPPABLE_ID) {
          const field = addProjectFieldAction(session.type);
          endProjectFieldDragAction(field.id);
          return;
        }

        const index = fields.findIndex((field) => field.id === over.id);

        if (index === -1) {
          endProjectFieldDragAction(null);
          return;
        }

        const field = addProjectFieldAction(session.type, index);
        endProjectFieldDragAction(field.id);
        return;
      }

      if (active.id === over.id) {
        endProjectFieldDragAction(null);
        return;
      }

      reorderProjectFieldsAction(String(active.id), String(over.id));
      endProjectFieldDragAction(null);
    };

    const handleDragCancel = () => {
      endProjectFieldDragAction(null);
    };

    return (
      <div className="flex flex-col gap-6">
        <h1 className="sr-only">{t('projectDefinition.title')}</h1>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid w-full max-w-xl gap-1.5">
            <FieldLabel htmlFor="project-definition-name">
              {t('projectDefinition.name.label')}
              <span aria-hidden className="text-destructive">
                *
              </span>
            </FieldLabel>

            {isLoading ? (
              <Skeleton className="h-11 w-full" />
            ) : (
              <Input
                id="project-definition-name"
                value={name}
                placeholder={t('projectDefinition.name.placeholder')}
                autoComplete="off"
                maxLength={120}
                className="h-11 text-lg font-semibold"
                aria-invalid={isNameInvalid || undefined}
                aria-describedby={
                  isNameInvalid ? 'project-definition-name-error' : undefined
                }
                onChange={(event) =>
                  projectDefinitionNameAtom.set(event.target.value)
                }
                onBlur={() => setIsNameTouched(true)}
              />
            )}

            {isNameInvalid && (
              <p
                id="project-definition-name-error"
                className="text-sm text-destructive"
              >
                {t('projectDefinition.name.required')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasUnnamedFieldsOrRoles && (
              <p className="text-sm text-destructive">
                {t('projectDefinition.actions.saveDisabledHint')}
              </p>
            )}

            {!hasUnnamedFieldsOrRoles && hasDuplicateRoleNames && (
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
          <div className="grid grid-cols-[320px_minmax(0,1fr)_340px] gap-6">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />

            <Skeleton className="col-start-2 row-start-2 h-72 w-full" />
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
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            modifiers={[paletteAnchorModifier]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="grid grid-cols-[320px_minmax(0,1fr)_340px] items-start gap-6">
              <AvailableFieldsPanel />
              <ProjectFieldsPanel />
              <FieldPropertiesPanel />

              <div className="col-start-2 row-start-2">
                <RoleDefinitionsPanel />
              </div>
            </div>

            <ProjectFieldsDragOverlay />
          </DndContext>
        )}
      </div>
    );
  },
  'ProjectDefinitionEditor',
);
