import { CheckCircleIcon, CircleNotchIcon, InfoIcon, WarningCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="ui:toaster ui:group"
      icons={{
        success: <CheckCircleIcon className="ui:size-4" />,
        info: <InfoIcon className="ui:size-4" />,
        warning: <WarningCircleIcon className="ui:size-4" />,
        error: <XCircleIcon className="ui:size-4" />,
        loading: <CircleNotchIcon className="ui:size-4 ui:animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
