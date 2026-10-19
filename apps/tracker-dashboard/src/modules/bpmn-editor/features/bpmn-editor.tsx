import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import {
  Alert,
  AlertDescription,
} from '@repo/ui-kit/components/common/floating/alert';
import { cn } from '@repo/ui-kit/lib/utils';

import { PageLayout } from '../../../layouts/page-layout/page-layout';
import { isPropertiesOpenAtom, lastErrorAtom } from '../models/editor-model';
import { BpmnActionBar } from './bpmn-action-bar';
import { BpmnCanvas } from './bpmn-canvas';
import { BpmnCommandPalette } from './bpmn-command-palette';
import { BpmnKeyboard } from './bpmn-keyboard';
import { BpmnProperties, BpmnPropertiesPill } from './bpmn-properties';
import { BpmnToolBar } from './bpmn-tool-bar';

const INNER_PADDING = '1rem';

export const BpmnEditor = reatomComponent(function BpmnEditor() {
  const { t } = useTranslation();
  const error = lastErrorAtom();
  const isPropertiesOpen = isPropertiesOpenAtom();

  return (
    <PageLayout height="screen" bleed>
      <div className="relative h-full w-full overflow-hidden">
        <BpmnKeyboard />

        <div className="absolute inset-0">
          <BpmnCanvas />
        </div>

        <div
          className="pointer-events-none absolute"
          style={{
            margin: INNER_PADDING,
            height: `calc(100% - ${INNER_PADDING} * 2)`,
            width: `calc(100% - ${INNER_PADDING} * 2)`,
          }}
        >
          <div className="pointer-events-auto absolute left-1/2 w-full max-w-200 -translate-x-1/2">
            <BpmnActionBar />
          </div>

          <div className="pointer-events-auto absolute top-1/2 max-h-8/12 w-16 -translate-y-1/2">
            <BpmnToolBar />
          </div>

          <div
            aria-hidden={!isPropertiesOpen}
            className={cn(
              'absolute top-20 right-0 bottom-14 flex w-80 flex-col transition-[translate,opacity,visibility] transition-discrete duration-200 ease-out',
              isPropertiesOpen
                ? 'pointer-events-auto translate-x-0 opacity-100'
                : 'pointer-events-none invisible translate-x-full opacity-0',
            )}
          >
            <BpmnProperties />
          </div>

          <BpmnPropertiesPill
            className={cn(
              'pointer-events-auto absolute top-1/2 right-0 z-40 size-9 -translate-y-1/2 transition-[translate,opacity] duration-200 ease-out',
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
            <AlertDescription>{t(error)}</AlertDescription>
          </Alert>
        )}

        <BpmnCommandPalette />
      </div>
    </PageLayout>
  );
});
