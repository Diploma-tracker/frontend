import { useTranslation } from '@/shared/utils/i18n';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui-kit/components/common/form/select';

export const LangSelect = () => {
  const { i18n } = useTranslation();

  const handleLangChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select
      value={i18n.resolvedLanguage || i18n.language}
      onValueChange={handleLangChange}
    >
      <SelectTrigger
        size="sm"
        className="border-none bg-transparent! shadow-none hover:bg-accent hover:text-accent-foreground dark:bg-transparent! dark:hover:bg-accent/50!"
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent position="popper">
        <SelectItem value="en">EN</SelectItem>
        <SelectItem value="uk">UK</SelectItem>
      </SelectContent>
    </Select>
  );
};
