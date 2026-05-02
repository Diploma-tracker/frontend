import { type ReactNode } from 'react';
import { usePrevious } from 'react-use';

import { useTranslation } from '@/shared/utils/i18n';
import { XIcon } from '@phosphor-icons/react';

import { Badge } from '@repo/ui-kit/components/common/data-display/badge';
import { Button, type ButtonProps } from '@repo/ui-kit/components/common/data-display/button';
import { Card } from '@repo/ui-kit/components/common/layout/card';
import { cn } from '@repo/ui-kit/lib/utils';

export type BulkAction = {
  key: string;
  children: ReactNode;
  onClick: () => void | Promise<void>;
  variant?: ButtonProps['variant'];
  intent?: ButtonProps['intent'];
};

type Props = {
  visible: boolean;
  count: number;
  actions: BulkAction[];
  entityLabel?: ReactNode | ((count: number) => ReactNode);
  onClear?: () => void;
};

export function BulkActionsIsland({ visible, count, actions, entityLabel, onClear }: Props) {
  const { t } = useTranslation();
  const lastCount = usePrevious(count) ?? 0;

  const displayCount = count > 0 ? count : lastCount;
  const resolvedEntityLabel = typeof entityLabel === 'function' ? entityLabel(displayCount) : entityLabel;

  const label = (
    <>
      {displayCount} {resolvedEntityLabel} {t('common.bulkActions.selected')}
    </>
  );

  const animation = visible
    ? 'pointer-events-auto translate-y-0 opacity-100'
    : 'pointer-events-none translate-y-6 opacity-0';

  return (
    <div
      className={cn('fixed bottom-4 left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 px-4 transition-all', animation)}
    >
      <Card className="flex-row flex-wrap items-center justify-between gap-4 px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Badge>
            {label}

            {onClear && (
              <Button
                variant="ghost"
                size="icon-xss"
                className="hover:bg-transparent"
                onClick={onClear}
                aria-label="Clear selection"
              >
                <XIcon />
              </Button>
            )}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant ?? 'ghost'}
              intent={action.intent}
              size="sm"
              onClick={action.onClick}
            >
              {action.children}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
