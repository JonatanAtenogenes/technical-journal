export function formatProjectYears(
  startYear: number,
  endYear?: number,
): string {
  if (!endYear || endYear === startYear) {
    return `${startYear}`;
  }
  return `${startYear}-${endYear}`;
}
