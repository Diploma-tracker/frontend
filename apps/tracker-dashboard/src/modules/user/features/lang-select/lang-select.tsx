import { useTranslation } from '@/shared/utils/i18n';
import { TranslateIcon } from '@phosphor-icons/react';

import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@repo/ui-kit/components/dropdown-menu';

export type LangSelectVariant = 'submenu' | 'inline';

interface LangSelectProps {
  variant: LangSelectVariant;
}

export const LangSelect = ({ variant }: LangSelectProps) => {
  const { t, i18n } = useTranslation();

  const handleLangChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  const radioGroup = (
    <DropdownMenuRadioGroup
      value={i18n.resolvedLanguage || i18n.language}
      onValueChange={handleLangChange}
    >
      <DropdownMenuRadioItem value="en">EN</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="uk">UK</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );

  if (variant === 'inline') {
    return (
      <>
        <DropdownMenuLabel className="flex items-center gap-2 text-muted-foreground">
          <TranslateIcon className="size-4" />
          {t('user.language')}
        </DropdownMenuLabel>

        {radioGroup}
      </>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <TranslateIcon />
        {t('user.language')}
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent>{radioGroup}</DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
