import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDebounce } from '@/shared/utils/use-debounce';
import { MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { reatomComponent } from '@reatom/react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@repo/ui-kit/components/input-group';

import { teacherListAtom, type TeacherSelectionFilter } from '../../models';

const SELECTION_VALUES = ['all', 'selected', 'not_selected'] as const;

const SELECTION_LABEL_KEYS: Record<TeacherSelectionFilter, string> = {
  all: 'projectEnrollment.teacher.filters.selectionAll',
  selected: 'projectEnrollment.teacher.filters.selectionSelected',
  not_selected: 'projectEnrollment.teacher.filters.selectionNotSelected',
};

interface TeachersFiltersProps {
  roundId: string;
}

export const TeachersFilters = reatomComponent(function TeachersFilters({ roundId }: TeachersFiltersProps) {
  const { t } = useTranslation();
  const filter = teacherListAtom.filter();
  const setFilter = teacherListAtom.setFilter;

  const [searchInput, setSearchInput] = useState(filter.search ?? '');

  useDebounce(
    () => {
      setFilter({ search: searchInput || undefined });
      teacherListAtom.fetch(roundId);
    },
    300,
    [searchInput]
  );

  const handleSearchClear = () => {
    setSearchInput('');
  };

  const handleSelectionChange = (value: string) => {
    setFilter({ selectionFilter: value as TeacherSelectionFilter });
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <InputGroup className="w-64">
        <InputGroupAddon align="inline-start">
          <MagnifyingGlassIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={t('projectEnrollment.teacher.filters.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={handleSearchClear}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      <Select value={filter.selectionFilter} onValueChange={handleSelectionChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder={t('projectEnrollment.teacher.filters.selectionPlaceholder')} />
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
});
