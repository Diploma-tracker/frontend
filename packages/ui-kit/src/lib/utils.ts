import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { Portal } from 'radix-ui';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
