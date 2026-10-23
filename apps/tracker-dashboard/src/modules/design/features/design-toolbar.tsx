import { reatomComponent } from '@reatom/react';

import { DesignActions } from './design-actions';
import { DesignTabs } from './design-tabs';

/** Shared design navigation and diagram actions outside the BPMN canvas. */
export const DesignToolbar = reatomComponent(function DesignToolbar() {
  return (
    <div className="grid h-12 w-full max-w-200 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 rounded-xl border bg-background/95 px-2 py-1 shadow-sm backdrop-blur">
      <div aria-hidden="true" />
      <DesignTabs embedded />
      <div className="justify-self-end">
        <DesignActions />
      </div>
    </div>
  );
});
