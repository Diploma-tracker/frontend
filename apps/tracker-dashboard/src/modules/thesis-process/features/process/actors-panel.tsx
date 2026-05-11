import { UserInfo } from '@/modules/user';
import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import {
  type Actor,
  fetchBachalorThesisProcess,
} from '../../models/bachelor-thesis-process';
import { ProjectSection } from './general';

const ROLE_LABELS: Record<string, string> = {
  student: 'Студент',
  supervisor: 'Науковий керівник',
  plagiarism_supervisor: 'Перевіряючий антиплагіату',
  internship_supervisor: 'Керівник практики',
  commission_member: 'Член комісії',
  reviewer: 'Рецензент',
};

const ActorRow = reatomComponent(function ActorRow({
  actor,
}: {
  actor: Actor;
}) {
  const { t } = useTranslation();
  if (!(actor.role in ROLE_LABELS)) return null;

  const label = t(ROLE_LABELS[actor.role] || actor.role);

  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <UserInfo userId={actor.userId} />
    </div>
  );
});

export const ActorsPanel = reatomComponent(function ActorsPanel() {
  const data = fetchBachalorThesisProcess.data();
  const status = fetchBachalorThesisProcess.status();

  return (
    <ProjectSection title="Actors" isLoading={status.isPending}>
      {data?.actors.map((actor) => (
        <ActorRow key={actor.role} actor={actor} />
      ))}
    </ProjectSection>
  );
});
