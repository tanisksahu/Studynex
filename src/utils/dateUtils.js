/**
 * Studynex Date Utilities — Centralized & Reusable Exam Countdown & Classification Logic
 */

/**
 * Safely parses any date string, Date object, or timestamp.
 * Returns null if missing or invalid.
 * @param {string|Date|number} dateInput
 * @returns {Date|null}
 */
export function parseValidDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Parse YYYY-MM-DD as local calendar date to eliminate UTC-offset shifts
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const localDate = new Date(year, month, day);
      return isNaN(localDate.getTime()) ? null : localDate;
    }
  }
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Classifies an exam date into 'PAST', 'TODAY', 'UPCOMING', or 'INVALID'.
 * Compares strictly on calendar day boundaries (midnight to midnight).
 * @param {string|Date} examDate
 * @returns {'PAST'|'TODAY'|'UPCOMING'|'INVALID'}
 */
export function getExamClassification(examDate) {
  const d = parseValidDate(examDate);
  if (!d) return 'INVALID';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'PAST';
  if (diffDays === 0) return 'TODAY';
  return 'UPCOMING';
}

/**
 * Returns the exact signed number of days remaining until examDate.
 * - Negative: Exam took place in the past (e.g. -138)
 * - 0: Exam is today
 * - Positive: Exam is upcoming in the future (e.g. 14)
 * - null: Invalid or missing date
 * @param {string|Date} examDate
 * @returns {number|null}
 */
export function getDaysRemaining(examDate) {
  const d = parseValidDate(examDate);
  if (!d) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Returns true if the exam is scheduled for today or a future date.
 * @param {string|Date} examDate
 * @returns {boolean}
 */
export function isUpcomingOrToday(examDate) {
  const classification = getExamClassification(examDate);
  return classification === 'TODAY' || classification === 'UPCOMING';
}

/**
 * Formats an exam date safely. Returns fallback text instead of "Invalid Date".
 * @param {string|Date} examDate
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatExamDate(examDate, options) {
  const d = parseValidDate(examDate);
  if (!d) return 'No exam date set';
  return d.toLocaleDateString('en-US', options || { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Returns a human-readable exam countdown label.
 * @param {string|Date} examDate
 * @returns {string}
 */
export function getExamLabel(examDate) {
  const classification = getExamClassification(examDate);
  if (classification === 'INVALID') return 'No exam date set';
  if (classification === 'PAST') return 'Exam completed';
  if (classification === 'TODAY') return 'Exam today!';

  const days = getDaysRemaining(examDate);
  return `Exam in ${days} day${days === 1 ? '' : 's'}`;
}

/**
 * Returns urgency text and color class based on days remaining and incomplete units.
 * Accurately treats past exams as completed rather than 'Exam Today!'.
 * @param {number|null} days
 * @param {number} incompleteUnits
 * @returns {{ text: string, color: string, isPast: boolean }}
 */
export function getUrgencyText(days, incompleteUnits) {
  if (days === null) {
    return { text: 'No exam date set', color: 'text-on-surface-variant', isPast: false };
  }
  if (days < 0) {
    return { text: '✓ Exam Completed', color: 'text-on-surface-variant', isPast: true };
  }
  if (days === 0) {
    return { text: '🚨 Exam Today!', color: 'text-error animate-pulse', isPast: false };
  }
  if (incompleteUnits <= 0) {
    return { text: '✅ Fully Prepared', color: 'text-secondary', isPast: false };
  }

  const requiredPerDay = (incompleteUnits / Math.max(1, days)).toFixed(1);
  if (requiredPerDay > 2) {
    return { text: `🚨 Critical: ${requiredPerDay} units/day`, color: 'text-error animate-pulse', isPast: false };
  }
  if (requiredPerDay > 1) {
    return { text: `⚠️ Warning: ${requiredPerDay} units/day`, color: 'text-secondary', isPast: false };
  }
  return { text: `✅ On Track: ${requiredPerDay} units/day`, color: 'text-primary', isPast: false };
}
