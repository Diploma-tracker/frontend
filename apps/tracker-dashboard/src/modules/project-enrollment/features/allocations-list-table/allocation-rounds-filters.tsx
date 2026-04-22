import { reatomComponent } from '@reatom/react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';

import { allocationRoundListAtom } from '../../models';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
] as const;

export const AllocationRoundsFilters = reatomComponent(function AllocationRoundsFilters() {
  const filter = allocationRoundListAtom.filter();
  const setFilter = allocationRoundListAtom.setFilter;

  return (
    <div className="flex items-center gap-3">
      <Select
        value={filter.statusFilter}
        onValueChange={(value) => setFilter({ statusFilter: value as typeof filter.statusFilter })}
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
