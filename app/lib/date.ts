// Birth date utilities: input mask, Spanish validation and display formatting.
// All display copy is Spanish (rioplatense voseo project convention).

const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

/** Keeps only digits, capped at the dd/mm/yyyy shape (8 digits). */
export function applyDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** True when the string matches a complete dd/mm/yyyy shape. */
export function isCompleteMaskedDate(masked: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(masked);
}

/**
 * Strict mask: slashes are inserted automatically and impossible digits
 * are corrected while typing — "4"–"9" as the first day/month digit expand
 * to "04"–"09" (so "9/3/2024" types as "09/03/2024"), and digits that
 * cannot be fixed are dropped (no month 13, no day 00 or 32+, year 19xx/20xx).
 */
export function applyDateMaskStrict(raw: string): string {
  let digits = "";
  for (const char of raw.replace(/\D/g, "")) {
    if (digits.length >= 8) break;
    digits = fitDateDigit(digits, char);
  }
  return applyDateMask(digits);
}

/** Absorbs one typed digit into the current dd/mm/yyyy digit buffer. */
function fitDateDigit(digits: string, char: string): string {
  const position = digits.length;
  // Day first digit: 0–3 accepted; 4–9 expand to 04–09.
  if (position === 0) {
    if (char <= "3") return digits + char;
    if (char <= "9") return digits + "0" + char;
    return digits;
  }
  // Day second digit: "3_" accepts only 0–1; "0_" accepts 1–9 (no day 00).
  if (position === 1) {
    const first = digits.charAt(0);
    const ok = first === "3" ? char <= "1" : first === "0" ? char >= "1" : true;
    return ok ? digits + char : digits;
  }
  // Month first digit: 0–1 accepted; 2–9 expand to 02–09.
  if (position === 2) {
    if (char <= "1") return digits + char;
    if (char <= "9") return digits + "0" + char;
    return digits;
  }
  // Month second digit: "1_" accepts only 0–2; "0_" accepts 1–9 (no month 00).
  if (position === 3) {
    const first = digits.charAt(2);
    const ok = first === "1" ? char <= "2" : char >= "1";
    return ok ? digits + char : digits;
  }
  // Year first digit: 1–2 only (19xx / 20xx).
  if (position === 4) {
    return char === "1" || char === "2" ? digits + char : digits;
  }
  return digits + char;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(month: number, year: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  if (month === 4 || month === 6 || month === 9 || month === 11) return 30;
  return 31;
}

function daysFitMonth(day: number, month: number, year: number): boolean {
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= daysInMonth(month, year);
}

function isFutureDate(masked: string): boolean {
  const [day, month, year] = masked.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return date.getTime() > endOfToday.getTime();
}

/** Spanish validation message for the birth date input, or null when valid. */
export function birthDateErrorES(masked: string): string | null {
  if (!masked) return "La fecha de nacimiento es obligatoria.";
  if (!isCompleteMaskedDate(masked)) return "Completá la fecha con el formato dd/mm/aaaa.";
  const [day, month, year] = masked.split("/").map(Number);
  if (year < 1900) return "El año no puede ser anterior a 1900.";
  if (!daysFitMonth(day, month, year)) return "La fecha no es válida: revisá día y mes.";
  if (isFutureDate(masked)) return "La fecha no puede ser posterior a hoy.";
  return null;
}

/**
 * Validates a masked date as a real birth date: day fits the month
 * (leap years included), year ≥ 1900 and the date is not in the future.
 */
export function isValidBirthDate(masked: string): boolean {
  return isCompleteMaskedDate(masked) && birthDateErrorES(masked) === null;
}

/** Masked "dd/mm/yyyy" → ISO "yyyy-mm-dd", or null when invalid. */
export function parseDateES(masked: string): string | null {
  if (!isValidBirthDate(masked)) return null;
  const [day, month, year] = masked.split("/");
  return `${year}-${month}-${day}`;
}

/** ISO "yyyy-mm-dd" → display "12 mar 2022" (day without leading zero). */
export function formatDateES(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return iso;
  return `${day} ${MONTHS_ES[month - 1]} ${year}`;
}

/**
 * ISO "yyyy-mm-dd" → Spanish age. Full years once the child is 1+,
 * otherwise months ("0 meses" included for a same-day birth).
 */
export function computeAgeES(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "";
  const today = new Date();
  const birth = new Date(year, month - 1, day);

  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years -= 1;
  }

  if (years >= 1) return years === 1 ? "1 año" : `${years} años`;

  let months = (today.getFullYear() - birth.getFullYear()) * 12 + monthDiff;
  if (today.getDate() < birth.getDate()) months -= 1;
  if (months < 0) months = 0;
  return months === 1 ? "1 mes" : `${months} meses`;
}

/** Current month/year in Spanish abbreviated form: "nov 2026". */
export function currentMonthYearES(date: Date = new Date()): string {
  return `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}
