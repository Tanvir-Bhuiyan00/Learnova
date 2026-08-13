/**
 * Deterministic date formatting for ISO timestamps.
 *
 * The API stores and returns UTC ISO timestamps. `toLocaleDateString()` and
 * date-fns `format()` render in the runtime's local timezone, which differs
 * between the server (UTC in Docker) and visitors' browsers (e.g. UTC+6).
 * That mismatch breaks React hydration on server-rendered pages (error 418),
 * because the server's HTML says "Aug 12" while the browser renders "Aug 13"
 * for the same instant. These helpers always render in UTC so the output is
 * identical on the server and every client.
 */

const MONTH_DAY_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "numeric",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatUtcMonthDay = (value: string | Date): string =>
  MONTH_DAY_FORMAT.format(new Date(value));

export const formatUtcDate = (value: string | Date): string =>
  DATE_FORMAT.format(new Date(value));

export const formatUtcDateTime = (value: string | Date): string =>
  DATE_TIME_FORMAT.format(new Date(value));
