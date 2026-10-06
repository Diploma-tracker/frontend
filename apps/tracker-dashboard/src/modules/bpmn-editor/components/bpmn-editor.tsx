import { reatomComponent } from '@reatom/react';

import {
  Alert,
  AlertDescription,
} from '@repo/ui-kit/components/common/floating/alert';
import { cn } from '@repo/ui-kit/lib/utils';

import { PageLayout } from '../../../layouts/page-layout/page-layout';
import { isPropertiesOpenAtom, lastErrorAtom } from '../model/editor-model';
import { BpmnCanvas } from './bpmn-canvas';
import { BpmnProperties, BpmnPropertiesPill } from './bpmn-properties';
import { BpmnToolRail } from './bpmn-tool-rail';
import { BpmnTopbar } from './bpmn-topbar';

export const BpmnEditor = reatomComponent(function BpmnEditor() {
  const error = lastErrorAtom();
  const isPropertiesOpen = isPropertiesOpenAtom();

  return (
    <PageLayout height="screen" bleed>
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute inset-0">
          <BpmnCanvas />
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto absolute top-3 right-30 left-30">
            <BpmnTopbar />
          </div>

          <div className="pointer-events-auto absolute top-1/2 left-3 h-8/12 w-16 -translate-y-1/2">
            <BpmnToolRail />
          </div>

          {/* Stays mounted while closed so it can slide out; `invisible` drops it
              from the tab order and the accessibility tree once the exit
              transition finishes. */}
          <div
            aria-hidden={!isPropertiesOpen}
            className={cn(
              'absolute top-20 right-3 bottom-14 flex w-72 flex-col transition-[translate,opacity,visibility] transition-discrete duration-200 ease-out',
              isPropertiesOpen
                ? 'pointer-events-auto translate-x-0 opacity-100'
                : 'pointer-events-none invisible translate-x-full opacity-0',
            )}
          >
            <BpmnProperties />
          </div>

          {/* The pill positions itself against the overlay, which is
              `pointer-events-none` — so it opts back in on its own button. */}
          <BpmnPropertiesPill
            className={cn(
              'pointer-events-auto absolute top-1/2 right-3 z-40 size-9 -translate-y-1/2 transition-[translate,opacity] duration-200 ease-out',
              isPropertiesOpen
                ? 'pointer-events-none translate-x-2 opacity-0'
                : 'translate-x-0 opacity-100',
            )}
          />
        </div>

        {error && (
          <Alert
            className="absolute right-4 bottom-4 left-4 z-50"
            variant="destructive"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </PageLayout>
  );
});
