import { useQuery } from '@/shared/model/query';
import { reatomComponent } from '@reatom/react';

import { groupQuery } from '../../models/groups-model';
import { GroupAvatar } from '../group-avatar/group-avatar';

interface GroupInfoProps {
  groupId: string;
}

export const GroupInfo = reatomComponent(function GroupInfo({
  groupId,
}: GroupInfoProps) {
  const { data } = useQuery(groupQuery, groupId);

  const { name } = data()!;

  return (
    <div className="flex items-center gap-2 py-1">
      <GroupAvatar groupId={groupId} />
      <p className="truncate text-sm font-medium">{name}</p>
    </div>
  );
});
