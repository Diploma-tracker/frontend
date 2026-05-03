export function calculatePercentage(part: number, total: number): number {
  if (!total || total === 0) return 0;

  return (part / total) * 100;
}

export function formatPercentageString(
  percentValue: number,
  decimals: number = 0,
): string {
  const ratio = percentValue / 100;

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(ratio);
}
