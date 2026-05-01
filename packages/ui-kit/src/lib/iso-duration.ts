/**
 * Parses an ISO 8601 duration string into hours and minutes components.
 *
 * @param iso - ISO 8601 duration string
 * @returns Object with hours and minutes
 *
 * @example
 * parseISODurationComponents('PT1H30M') // { hours: 1, minutes: 30 }
 * parseISODurationComponents('PT45M')   // { hours: 0, minutes: 45 }
 */
export function parseISODurationComponents(iso: string): { hours: number; minutes: number } {
  if (!iso) return { hours: 0, minutes: 0 };
  const h = iso.match(/(\d+)H/);
  const m = iso.match(/(\d+)M/);
  return {
    hours: h ? parseInt(h[1]!, 10) : 0,
    minutes: m ? parseInt(m[1]!, 10) : 0,
  };
}

/**
 * Formats hours and minutes into an ISO 8601 duration string.
 *
 * @param hours - Number of hours
 * @param minutes - Number of minutes
 * @returns ISO 8601 duration string
 *
 * @example
 * formatISODuration(1, 30) // 'PT1H30M'
 * formatISODuration(0, 45) // 'PT45M'
 * formatISODuration(2, 0)  // 'PT2H'
 */
export function formatISODuration(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return 'PT0M';
  const h = hours > 0 ? `${hours}H` : '';
  const m = minutes > 0 ? `${minutes}M` : '';
  return `PT${h}${m}`;
}
