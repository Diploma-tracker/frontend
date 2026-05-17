export function calculatePercentage(
  part: number,
  total: number,
  decimals?: number,
): number {
  if (!total || total === 0) return 0;

  const value = (part / total) * 100;

  if (decimals === undefined) return value;
  return parseFloat(value.toFixed(decimals));
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
