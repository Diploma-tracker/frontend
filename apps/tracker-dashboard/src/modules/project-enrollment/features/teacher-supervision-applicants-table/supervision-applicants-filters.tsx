import {
  SelectEnum,
  enumToOptions,
} from '@/shared/components/form/select-enum';
import { k, useTranslation } from '@/shared/utils/i18n';
import { reatomComponent } from '@reatom/react';

import { ListSupervisionApplicantsForTeacherStatusFilter as StatusFilterValue } from '@repo/api/model';

import { teacherSupervisionApplicantsListAtom } from '../../models';

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

    const currentValue = filter.statusFilter;

    const handleStatusChange = (value: StatusFilterValue) => {
      teacherSupervisionApplicantsListAtom.setFilter({
        statusFilter: value,
      });
    };

    return (
      <div className="flex items-center gap-4">
        <SelectEnum
          value={currentValue}
          onChange={handleStatusChange}
          options={enumToOptions(StatusFilterValue, STATUS_LABEL_KEYS, t)}
          placeholder={t(
            'projectEnrollment.supervisionApplicants.filters.statusPlaceholder',
          )}
        />
      </div>
    );
  },
);
