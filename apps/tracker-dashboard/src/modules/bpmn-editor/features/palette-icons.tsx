import type { PaletteIcon } from '../models/element-types';

/**
 * BPMN notation glyphs drawn as plain SVG so the rail matches the notation: a
 * start event is a thin circle, an intermediate event a double circle, an end
 * event a bold circle and a pool a rectangle with a name band. Geometry and
 * stroke widths mirror the Phosphor "regular" (16/256) and "bold" (24/256)
 * weights so they sit flush with the bundled Phosphor icons.
 */

interface IconProps {
  className?: string;
}

export const StartEventIcon: PaletteIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeWidth="16"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="128" cy="128" r="96" />
  </svg>
);

export const IntermediateEventIcon: PaletteIcon = ({
  className,
}: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeWidth="16"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="128" cy="128" r="96" />
    <circle cx="128" cy="128" r="60" />
  </svg>
);

export const EndEventIcon: PaletteIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeWidth="24"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="128" cy="128" r="96" />
  </svg>
);

export const PoolIcon: PaletteIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 256 256"
    fill="none"
    stroke="currentColor"
    strokeWidth="16"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="32" y="48" width="192" height="160" rx="16" />
    <line x1="88" y1="48" x2="88" y2="208" />
  </svg>
);
