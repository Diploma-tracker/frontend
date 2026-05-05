import { useState } from 'react';

import { SearchField } from '@/shared/components';
import { useTranslation } from '@/shared/utils/i18n';
import { useDebounce } from '@/shared/utils/use-debounce';
import { reatomComponent } from '@reatom/react';

import { teacherListAtom } from '../../models';

export const StudentTeachersFilters = reatomComponent(
  function StudentTeachersFilters() {
    const { t } = useTranslation();
    const filter = teacherListAtom.filter();
    const setFilter = teacherListAtom.setFilter;

    const [searchInput, setSearchInput] = useState(filter.search ?? '');

    useDebounce(() => {
      setFilter({ search: searchInput || undefined });
    }, [searchInput]);

    return (
      <div className="flex items-center justify-between gap-4">
        <SearchField
          value={searchInput ?? ''}
          onChange={setSearchInput}
          placeholder={t('projectEnrollment.teacher.filters.searchPlaceholder')}
        />
      </div>
    );
  },
);
