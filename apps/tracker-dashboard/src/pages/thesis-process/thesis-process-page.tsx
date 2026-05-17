import react from 'react';

import { PageLayout } from '@/layouts';
import {
  ActorsPanel,
  StageDetailPanel,
  StagesPanel,
  ThesisProcessHeader,
  bachalorThesisProcessId,
} from '@/modules/thesis-process';

export const ThesisProcessPage = ({ processId }: { processId: string }) => {
  react.useEffect(() => {
    bachalorThesisProcessId.set(processId);
  }, []);

  return (
    <PageLayout>
      <div className="flex flex-col gap-5">
        <ThesisProcessHeader />

        <div className="grid grid-cols-[300px_1fr_280px] items-start gap-5">
          <StagesPanel />

          <StageDetailPanel />

          <ActorsPanel />
        </div>
      </div>
    </PageLayout>
  );
};
