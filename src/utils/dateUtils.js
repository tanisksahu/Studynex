/**
 * Studynex Date Utilities — Centralized & Reusable Exam Countdown Logic
 */

/**
 * Returns the number of days remaining until examDate.
 * @param {string|Date} examDate
 * @returns {number|null} days remaining (0 if past), or null if invalid
 */
export function getDaysRemaining(examDate) {
  if (!examDate) return null;
  const today = new Date();
  const exam = new Date(examDate);
  if (isNaN(exam.getTime())) return null;
  const diffTime = exam - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
}

/**
 * Returns a human-readable exam countdown label.
 * @param {string|Date} examDate
 * @returns {string}
 */
export function getExamLabel(examDate) {
  const days = getDaysRemaining(examDate);
  if (days === null) return 'No exam date set';
  if (days === 0) return 'Exam today!';
  const diff = new Date(examDate) - new Date();
  if (diff < 0) return 'Exam completed';
  return `Exam in ${days} day${days === 1 ? '' : 's'}`;
}

/**
 * Returns urgency text and color class based on days remaining and incomplete units.
 * @param {number|null} days
 * @param {number} incompleteUnits
 * @returns {{ text: string, color: string }}
 */
export function getUrgencyText(days, incompleteUnits) {
  if (days === null) return { text: 'No exam date set', color: 'text-on-surface-variant' };
  if (days === 0) return { text: '🚨 Exam Today!', color: 'text-error animate-pulse' };
  if (incompleteUnits <= 0) return { text: '✅ Fully Prepared', color: 'text-secondary' };
  const requiredPerDay = (incompleteUnits / days).toFixed(1);
  if (requiredPerDay > 2) return { text: `🚨 Critical: ${requiredPerDay} units/day`, color: 'text-error animate-pulse' };
  if (requiredPerDay > 1) return { text: `⚠️ Warning: ${requiredPerDay} units/day`, color: 'text-secondary' };
  return { text: `✅ On Track: ${requiredPerDay} units/day`, color: 'text-primary' };
}
