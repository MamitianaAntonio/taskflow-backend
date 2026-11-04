export const repeatRules = ["none", "daily", "weekly", "monthly", "yearly"] as const;

export type RepeatRule = (typeof repeatRules)[number];

export const isRepeatRule = (value: unknown): value is RepeatRule =>
  typeof value === "string" &&
  (repeatRules as readonly string[]).includes(value);

/** Number of days in the given UTC month (month is 0-based). */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * Next occurrence of a recurring task.
 *
 * The arithmetic runs in UTC so the wall-clock time of the day is preserved
 * whatever the server timezone is. Monthly and yearly rules stick to the
 * anchor day the user picked and clamp it to the last day of a shorter
 * month, so a task due on the 31st lands on the 28th in February and goes
 * back to the 31st in March.
 */
export function nextOccurrence(
  from: Date,
  rule: RepeatRule,
  anchorDay?: number | null,
): Date {
  const next = new Date(from.getTime());

  switch (rule) {
    case "daily":
      next.setUTCDate(next.getUTCDate() + 1);
      break;

    case "weekly":
      next.setUTCDate(next.getUTCDate() + 7);
      break;

    case "monthly": {
      const day = anchorDay ?? next.getUTCDate();
      next.setUTCDate(1);
      next.setUTCMonth(next.getUTCMonth() + 1);
      next.setUTCDate(
        Math.min(day, daysInMonth(next.getUTCFullYear(), next.getUTCMonth())),
      );
      break;
    }

    case "yearly": {
      const day = anchorDay ?? next.getUTCDate();
      const month = next.getUTCMonth();
      next.setUTCDate(1);
      next.setUTCFullYear(next.getUTCFullYear() + 1);
      next.setUTCMonth(month);
      next.setUTCDate(
        Math.min(day, daysInMonth(next.getUTCFullYear(), next.getUTCMonth())),
      );
      break;
    }

    default:
      break;
  }

  return next;
}

/**
 * Next occurrence that is still ahead of us. A weekly task completed three
 * weeks late does not spawn three occurrences, it spawns the next upcoming
 * one — otherwise the board would fill up with tasks already in the past.
 */
export function nextFutureOccurrence(
  from: Date,
  rule: RepeatRule,
  anchorDay?: number | null,
  now: Date = new Date(),
  maxSteps = 400,
): Date | null {
  let candidate = nextOccurrence(from, rule, anchorDay);
  let steps = 0;

  while (candidate.getTime() <= now.getTime() && steps < maxSteps) {
    candidate = nextOccurrence(candidate, rule, anchorDay);
    steps += 1;
  }

  return steps >= maxSteps ? null : candidate;
}
