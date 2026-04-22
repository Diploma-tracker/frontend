export const getCapitalsFromStrings = (...strings: string[]): string => {
  return strings.map((str) => str[0]?.toUpperCase() || '').join('');
};
