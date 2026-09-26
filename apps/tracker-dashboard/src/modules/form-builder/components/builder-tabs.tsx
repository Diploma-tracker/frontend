import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { cn } from '@repo/ui-kit/lib/utils';

import {
  type BuilderTab,
  activeTabAtom,
  setActiveTab,
} from '../model/form-builder-model';

const tabs: BuilderTab[] = ['build', 'preview'];

export const BuilderTabs = reatomComponent(function BuilderTabs() {
  const { t } = useTranslation();
  const activeTab = activeTabAtom();

  return (
    <div className="flex w-fit items-center gap-1 rounded-lg border bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            activeTab === tab
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab === 'build'
            ? t('formBuilder.tabs.build')
            : t('formBuilder.tabs.preview')}
        </button>
      ))}
    </div>
  );
});
