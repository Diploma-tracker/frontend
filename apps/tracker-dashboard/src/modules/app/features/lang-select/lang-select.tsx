import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';

export const LangSelect = () => {
  const { i18n } = useTranslation();

  return (
    <Select value={i18n.resolvedLanguage || i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
      <SelectTrigger
        size="sm"
        className="border-none bg-transparent! shadow-none hover:bg-accent hover:text-accent-foreground dark:bg-transparent! dark:hover:bg-accent/50!"
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent position="popper">
        <SelectItem value="en">EN</SelectItem>
        <SelectItem value="ua">UA</SelectItem>
      </SelectContent>
    </Select>
  );
};
