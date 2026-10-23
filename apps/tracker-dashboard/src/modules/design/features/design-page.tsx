import { useEffect } from 'react';

import { BpmnEditorInner, isActiveAtom } from '@/modules/bpmn-editor';
import { ProjectDefinitionEditor } from '@/modules/project-definition';
import { reatomComponent } from '@reatom/react';

import { cn } from '@repo/ui-kit/lib/utils';

import { activeTabPathAtom } from '../models/design-model';
import { DesignActions } from './design-actions';
import { DesignForms } from './design-forms';
import { DesignTabs } from './design-tabs';
import { DesignToolbar } from './design-toolbar';

export const DesignPage = reatomComponent(function DesignPage() {
  const path = activeTabPathAtom();
  const activeTopTab = path[0];

  useEffect(() => {
    isActiveAtom.set(activeTopTab === 'bpmn');
    return () => {
      isActiveAtom.set(false);
    };
  }, [activeTopTab]);

  return (
    <div className="relative isolate flex h-full w-full flex-col overflow-hidden">
      {activeTopTab !== 'bpmn' && (
        <div className="z-20 flex shrink-0 justify-center p-4">
          <DesignToolbar />
        </div>
      )}
      <div className="min-h-0 w-full flex-1 overflow-auto">
        {activeTopTab === 'project-definition' && (
          <div className="px-4 py-2 md:px-6">
            <ProjectDefinitionEditor />
          </div>
        )}
        {activeTopTab === 'forms' && (
          <div className="h-full min-h-0 px-4 py-2 md:px-6">
            <DesignForms path={path.slice(1)} />
          </div>
        )}
      </div>
      <div
        className={cn(
          'absolute inset-0 z-[1]',
          activeTopTab !== 'bpmn' &&
            'pointer-events-none invisible z-[-1] opacity-0',
        )}
      >
        <BpmnEditorInner
          actionBarCenter={<DesignTabs embedded />}
          actionBarRight={<DesignActions />}
        />
      </div>
    </div>
  );
});
