import { RoundDefenseSchedulePage } from '@/pages/defense';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/_app/defense/$roundId')({
  component: function DefenseRoundRoute() {
    const { roundId } = Route.useParams();
    return <RoundDefenseSchedulePage roundId={roundId} />;
  },
});
