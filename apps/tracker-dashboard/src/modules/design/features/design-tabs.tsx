import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { Button } from '@repo/ui-kit/components/common/data-display/button';

import {
  activeTabPathAtom,
  designTabs,
  setActiveTab,
} from '../models/design-model';

interface DesignTabsProps {
  embedded?: boolean;
  allowInline?: boolean;
}

/** Top-level design navigation, optionally embedded in the BPMN action bar. */
export const DesignTabs = reatomComponent(function DesignTabs({
  embedded = false,
  allowInline = false,
}: DesignTabsProps) {
  const path = activeTabPathAtom();
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('sidebar.nav.design')}
      className={
        embedded
          ? 'flex shrink-0 items-center gap-1'
          : 'flex items-center gap-1 rounded-xl border bg-background/95 p-1 shadow-sm backdrop-blur'
      }
    >
      {designTabs.map(({ id, name, icon: Icon }) => {
        const isActive = path[0] === id;

        return (
          <Button
            key={id}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            aria-pressed={isActive}
            aria-label={t(name)}
            onClick={() => setActiveTab(id)}
          >
            {Icon && <Icon aria-hidden="true" />}
            <span
              className={
                embedded && allowInline ? 'hidden lg:inline' : undefined
              }
            >
              {t(name)}
            </span>
          </Button>
        );
      })}
    </nav>
  );
});
