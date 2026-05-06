import { k, useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { SupervisionApplicationStatus } from '@repo/api/model';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';

import { teacherSupervisionApplicantsListAtom } from '../../models';

const STATUS_VALUES = [
  'ALL',
  SupervisionApplicationStatus.PENDING,
  SupervisionApplicationStatus.ACCEPTED,
  SupervisionApplicationStatus.REJECTED,
] as const;

type StatusFilterValue = (typeof STATUS_VALUES)[number];

const STATUS_LABEL_KEYS: Record<StatusFilterValue, string> = {
  ALL: k('projectEnrollment.supervisionApplicants.filters.statusAll'),
  PENDING: k('projectEnrollment.supervisionApplicants.filters.statusPending'),
  ACCEPTED: k('projectEnrollment.supervisionApplicants.filters.statusAccepted'),
  REJECTED: k('projectEnrollment.supervisionApplicants.filters.statusRejected'),
};

export const SupervisionApplicantsFilters = reatomComponent(
  function SupervisionApplicantsFilters() {
    const { t } = useTranslation();
    const filter = teacherSupervisionApplicantsListAtom.filter();

    const currentValue = filter.statusFilter ?? 'ALL';

    const handleStatusChange = (value: string) => {
      teacherSupervisionApplicantsListAtom.setFilter({
        statusFilter:
          value === 'ALL' ? null : (value as SupervisionApplicationStatus),
        page: 1,
      });
    };

    return (
      <div className="flex items-center gap-4">
        <Select value={currentValue} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue
              placeholder={t(
                'projectEnrollment.supervisionApplicants.filters.statusPlaceholder',
              )}
            />
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
  },
);
