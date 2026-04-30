import { useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';

import { allocationRoundListAtom } from '../../models';

const STATUS_VALUES = ['ALL', 'DRAFT', 'OPEN', 'CLOSED'] as const;

type StatusValue = (typeof STATUS_VALUES)[number];

const STATUS_LABEL_KEYS: Record<StatusValue, string> = {
  ALL: 'projectEnrollment.allocationRound.status.all',
  DRAFT: 'projectEnrollment.allocationRound.status.draft',
  OPEN: 'projectEnrollment.allocationRound.status.open',
  CLOSED: 'projectEnrollment.allocationRound.status.closed',
};

export const AllocationRoundsFilters = reatomComponent(function AllocationRoundsFilters() {
  const { t } = useTranslation();
  const filter = allocationRoundListAtom.filter();
  const setFilter = allocationRoundListAtom.setFilter;

  const handleStatusChange = (value: string) => {
    setFilter({ statusFilter: value as typeof filter.statusFilter });
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={filter.statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder={t('projectEnrollment.allocationRound.filters.statusPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_VALUES.map((value) => (
            <SelectItem key={value} value={value}>
              {t(STATUS_LABEL_KEYS[value])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
