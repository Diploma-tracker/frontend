import { useState } from 'react';

import { SearchField } from '@/shared/components';
import {
  SelectEnum,
  enumToOptions,
} from '@/shared/components/form/select-enum';
import { k, useTranslation } from '@/shared/utils/i18n';
import { useDebounce } from '@/shared/utils/use-debounce';
import { reatomComponent } from '@reatom/react';

import { TeacherSelectionFilter, teacherListAtom } from '../../models';

const SELECTION_LABEL_KEYS: Record<TeacherSelectionFilter, string> = {
  ALL: k('projectEnrollment.teacher.filters.selectionAll'),
  SELECTED: k('projectEnrollment.teacher.filters.selectionSelected'),
  NOT_SELECTED: k('projectEnrollment.teacher.filters.selectionNotSelected'),
};

export const AdminTeachersFilters = reatomComponent(
  function AdminTeachersFilters() {
    const { t } = useTranslation();
    const filter = teacherListAtom.filter();
    const setFilter = teacherListAtom.setFilter;

    const [searchInput, setSearchInput] = useState(filter.search ?? '');

    useDebounce(() => {
      setFilter({ search: searchInput || undefined });
    }, [searchInput]);

    const handleSelectionChange = (value: TeacherSelectionFilter) => {
      setFilter({ selectionFilter: value });
    };

    return (
      <div className="flex items-center justify-between gap-4">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('projectEnrollment.teacher.filters.searchPlaceholder')}
        />

        <SelectEnum
          value={filter.selectionFilter}
          onChange={handleSelectionChange}
          options={enumToOptions(
            TeacherSelectionFilter,
            SELECTION_LABEL_KEYS,
            t,
          )}
          placeholder={t(
            'projectEnrollment.teacher.filters.selectionPlaceholder',
          )}
        />
      </div>
    );
  },
);
