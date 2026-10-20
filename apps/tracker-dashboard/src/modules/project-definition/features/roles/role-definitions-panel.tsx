import { useTranslation } from '@/shared/utils/i18n';
import { AsteriskSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui-kit/components/common/floating/tooltip';
import { Input } from '@repo/ui-kit/components/common/form/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui-kit/components/common/layout/card';

import {
  addProjectRoleAction,
  duplicateRoleNamesAtom,
  projectRolesAtom,
  removeProjectRoleAction,
  updateProjectRoleAction,
} from '../../models';

export const RoleDefinitionsPanel = reatomComponent(
  function RoleDefinitionsPanel() {
    const { t } = useTranslation();
    const roles = projectRolesAtom();
    const duplicateNames = duplicateRoleNamesAtom();

    const isDuplicateName = (role: (typeof roles)[number]) => {
      const key = role.name.trim().toLowerCase();

      return key.length > 0 && duplicateNames.has(key);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('projectDefinition.roles.title')}</CardTitle>
          <CardDescription>
            {t('projectDefinition.roles.description')}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {roles.map((role) => {
            const isDuplicate = isDuplicateName(role);

            return (
              <div
                key={role.id}
                className="flex flex-wrap items-center gap-3 rounded-md border p-3"
              >
                <Input
                  className="min-w-40 flex-1"
                  value={role.name}
                  disabled={role.isCore}
                  autoComplete="off"
                  aria-invalid={isDuplicate}
                  placeholder={t('projectDefinition.roles.namePlaceholder')}
                  onChange={(event) =>
                    updateProjectRoleAction(role.id, {
                      name: event.target.value,
                    })
                  }
                />

                <div className="flex items-center gap-2">
                  <span className="text-sm whitespace-nowrap text-muted-foreground">
                    {t('projectDefinition.roles.slotsLabel')}
                  </span>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    className="w-20"
                    value={role.slots}
                    onChange={(event) =>
                      updateProjectRoleAction(role.id, {
                        slots: Number(event.target.value),
                      })
                    }
                  />
                </div>

                {role.isCore ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        aria-label={t('projectDefinition.roles.coreTooltip')}
                        className="inline-flex size-9 shrink-0 cursor-default items-center justify-center text-destructive"
                      >
                        <AsteriskSimpleIcon weight="bold" className="size-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('projectDefinition.roles.coreTooltip')}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('projectDefinition.roles.remove')}
                    onClick={() => removeProjectRoleAction(role.id)}
                  >
                    <TrashIcon />
                  </Button>
                )}

                {isDuplicate && (
                  <p className="w-full text-sm text-destructive">
                    {t('projectDefinition.roles.duplicateName')}
                  </p>
                )}
              </div>
            );
          })}

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => addProjectRoleAction()}
            >
              <PlusIcon />
              {t('projectDefinition.roles.add')}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  },
  'RoleDefinitionsPanel',
);
