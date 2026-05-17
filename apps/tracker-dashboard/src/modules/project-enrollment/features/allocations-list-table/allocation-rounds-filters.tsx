import {
  SelectEnum,
  enumToOptions,
} from '@/shared/components/form/select-enum';
import { k, useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { ListAllocationRoundsStatusFilter as StatusValue } from '@repo/api/model';

import { allocationRoundListAtom } from '../../models';

const STATUS_LABEL_KEYS: Record<StatusValue, string> = {
  ALL: k('projectEnrollment.allocationRound.status.all'),
  DRAFT: k('projectEnrollment.allocationRound.status.draft'),
  OPEN: k('projectEnrollment.allocationRound.status.open'),
  CLOSED: k('projectEnrollment.allocationRound.status.closed'),
};

export const AllocationRoundsFilters = reatomComponent(
  function AllocationRoundsFilters() {
    const { t } = useTranslation();
    const filter = allocationRoundListAtom.filter();
    const setFilter = allocationRoundListAtom.setFilter;

    const handleStatusChange = (value: StatusValue) => {
      setFilter({ statusFilter: value });
    };

    return (
      <div className="flex items-center gap-3">
        <SelectEnum
          value={filter.statusFilter}
          onChange={handleStatusChange}
          options={enumToOptions(StatusValue, STATUS_LABEL_KEYS, t)}
          placeholder={t(
            'projectEnrollment.allocationRound.filters.statusPlaceholder',
          )}
        />
      </div>
    );
  },
);
