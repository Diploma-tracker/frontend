import { ThesisProcessPage } from '@/pages/thesis-process';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/thesis-process/$processId')({
  component: function DefenseRoundRoute() {
    const { processId } = Route.useParams();
    return <ThesisProcessPage processId={processId} />;
  },
});
