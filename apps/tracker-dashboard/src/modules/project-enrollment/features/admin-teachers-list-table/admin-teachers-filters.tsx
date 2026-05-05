import { useState } from 'react';

import { SearchField } from '@/shared/components';
import { k, useTranslation } from '@/shared/utils/i18n';
import { useDebounce } from '@/shared/utils/use-debounce';
import { reatomComponent } from '@reatom/react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';

import { type TeacherSelectionFilter, teacherListAtom } from '../../models';

const SELECTION_VALUES = ['ALL', 'SELECTED', 'NOT_SELECTED'] as const;

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

    const handleSelectionChange = (value: string) => {
      setFilter({ selectionFilter: value as TeacherSelectionFilter });
    };

    return (
      <div className="flex items-center justify-between gap-4">
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t('projectEnrollment.teacher.filters.searchPlaceholder')}
        />

        <Select
          value={filter.selectionFilter}
          onValueChange={handleSelectionChange}
        >
          <SelectTrigger className="w-44">
            <SelectValue
              placeholder={t(
                'projectEnrollment.teacher.filters.selectionPlaceholder',
              )}
            />
          </SelectTrigger>
          <SelectContent>
            {SELECTION_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(SELECTION_LABEL_KEYS[value])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  },
);
