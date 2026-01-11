export function Gradient({ conic, className, small }: { small?: boolean; conic?: boolean; className?: string }) {
  return (
    <span
      className={`ui:absolute ui:rounded-[100%] ui:mix-blend-normal ui:will-change-[filter] ${
        small ? 'ui:blur-[32px]' : 'ui:blur-[75px]'
      } ${
        conic
          ? 'ui:bg-red-1000 ui:bg-gradient-to-r ui:from-10% ui:via-purple-1000 ui:via-30% ui:to-blue-1000 ui:to-100%'
          : ''
      } ${className ?? ''}`}
    />
  );
}
