import assert from 'node:assert';
import {
  parseValidDate,
  getExamClassification,
  getDaysRemaining,
  isUpcomingOrToday,
  formatExamDate,
  getExamLabel,
  getUrgencyText
} from '../src/utils/dateUtils.js';

import {
  SEMESTER_DEFINITIONS,
  CURRENT_SEMESTER_ID,
  classifySubjectSemester,
  classifyExamSemester,
  synthesizeAcademicMemory,
  buildAIContextWithMemory
} from '../src/utils/academicMemory.js';

console.log('====================================================');
console.log('STUDYNEX SEMESTER & DATE INTELLIGENCE TEST SUITE');
console.log('====================================================\n');

// 1. Past Exam Date
console.log('[Test 1] Past Exam Date Classification & Countdown...');
const pastExamDate = '2026-05-15'; // May 15, 2026
const pastClass = getExamClassification(pastExamDate);
const pastDays = getDaysRemaining(pastExamDate);
const pastLabel = getExamLabel(pastExamDate);

assert.strictEqual(pastClass, 'PAST', 'May 15, 2026 exam must be classified as PAST');
assert(pastDays < 0, `Days remaining for past exam must be negative, got: ${pastDays}`);
assert.strictEqual(isUpcomingOrToday(pastExamDate), false, 'Past exam must NOT be upcoming or today');
assert.strictEqual(pastLabel, 'Exam completed', 'Past exam label must be "Exam completed"');
console.log(`✓ Past exam correctly classified: class=${pastClass}, days=${pastDays}, label="${pastLabel}"`);

// 2. Today's Exam
console.log('\n[Test 2] Today\'s Exam Date Classification...');
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const todayClass = getExamClassification(todayStr);
const todayDays = getDaysRemaining(todayStr);
const todayLabel = getExamLabel(todayStr);

assert.strictEqual(todayClass, 'TODAY', 'Today exam date must be classified as TODAY');
assert.strictEqual(todayDays, 0, 'Today exam date must have exactly 0 days remaining');
assert.strictEqual(isUpcomingOrToday(todayStr), true, 'Today exam date must evaluate to upcoming/today');
assert.strictEqual(todayLabel, 'Exam today!', 'Today exam label must be "Exam today!"');
console.log(`✓ Today's exam correctly classified: class=${todayClass}, days=${todayDays}, label="${todayLabel}"`);

// 3. Future Exam
console.log('\n[Test 3] Future Exam Date Classification...');
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 14); // 14 days in the future
const futureStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
const futureClass = getExamClassification(futureStr);
const futureDays = getDaysRemaining(futureStr);
const futureLabel = getExamLabel(futureStr);

assert.strictEqual(futureClass, 'UPCOMING', 'Future exam date must be classified as UPCOMING');
assert(futureDays >= 13 && futureDays <= 15, `Future exam should have ~14 days remaining, got: ${futureDays}`);
assert.strictEqual(isUpcomingOrToday(futureStr), true, 'Future exam must evaluate to upcoming/today');
assert(futureLabel.includes('Exam in'), `Future exam label must indicate countdown, got: ${futureLabel}`);
console.log(`✓ Future exam correctly classified: class=${futureClass}, days=${futureDays}, label="${futureLabel}"`);

// 4. Invalid or Missing Exam Date (The Algorithms Bug)
console.log('\n[Test 4] Invalid / Missing Exam Date Handling (Algorithms Bug Fix)...');
const invalidNull = formatExamDate(null);
const invalidUndefined = formatExamDate(undefined);
const invalidString = formatExamDate('INVALID DATE');
const invalidClass = getExamClassification(null);
const invalidLabel = getExamLabel(undefined);

assert.strictEqual(invalidNull, 'No exam date set');
assert.strictEqual(invalidUndefined, 'No exam date set');
assert.strictEqual(invalidString, 'No exam date set');
assert.strictEqual(invalidClass, 'INVALID');
assert.strictEqual(invalidLabel, 'No exam date set');
assert.strictEqual(isUpcomingOrToday(null), false, 'Invalid date must never be upcoming or today');
console.log(`✓ Missing/Invalid exam dates safely return fallbacks instead of crashing to "EXAM: INVALID DATE"`);

// 5. Previous Semester Subject (Spring 2026)
console.log('\n[Test 5] Previous Semester Subject Classification...');
const springSubject = {
  id: 1,
  name: 'Data Structures',
  code: 'CS201',
  examDate: '2026-05-15',
  totalUnits: 8
};
const springSemClassification = classifySubjectSemester(springSubject);
assert.strictEqual(springSemClassification.isHistorical, true, 'Spring 2026 exam date subject must be classified as historical');
assert.strictEqual(springSemClassification.semesterId, 'spring-2026');
console.log(`✓ Subject "Data Structures" (exam: 2026-05-15) correctly mapped to historical semester "${springSemClassification.semesterId}"`);

// 6. Current Semester Subject (Fall 2026)
console.log('\n[Test 6] Current Semester Subject Classification...');
const fallSubject = {
  id: 5,
  name: 'Operating Systems',
  code: 'CS401',
  examDate: '2026-11-20',
  totalUnits: 6
};
const fallSemClassification = classifySubjectSemester(fallSubject);
assert.strictEqual(fallSemClassification.isHistorical, false, 'Fall 2026 subject must be active current semester');
assert.strictEqual(fallSemClassification.semesterId, 'fall-2026');
console.log(`✓ Subject "Operating Systems" (exam: 2026-11-20) correctly mapped to active current semester "${fallSemClassification.semesterId}"`);

// 7. Historical Task vs 8. Current Task
console.log('\n[Test 7 & 8] Historical Task vs Current Task Separation...');
const sampleTasks = [
  { id: 1, title: 'Old Sprint Review', isHistorical: true, completed: true },
  { id: 2, title: 'Finish OS Kernel Module', isHistorical: false, completed: false }
];
const contextTasks = buildAIContextWithMemory({
  subjects: [fallSubject],
  exams: [],
  tasks: sampleTasks
});
assert.strictEqual(contextTasks.currentSemester.pendingTasks.length, 1);
assert.strictEqual(contextTasks.currentSemester.pendingTasks[0].title, 'Finish OS Kernel Module');
console.log(`✓ Active pending task retained; historical task excluded from current active queue`);

// 9. AI Receiving Historical Context
console.log('\n[Test 9] AI Context Builder Structure & Separation...');
const historicalDbSubjects = [
  { id: 1, name: 'Data Structures', code: 'CS201', examDate: '2026-05-15', totalUnits: 8, progress: 85 },
  { id: 2, name: 'Microeconomics', code: 'ECON101', examDate: '2026-06-01', totalUnits: 10, progress: 95 },
  { id: 3, name: 'Systems Architecture', code: 'CS301', examDate: '2026-05-20', totalUnits: 6, progress: 50 },
  { id: 4, name: 'Linear Algebra', code: 'MATH200', examDate: '2026-05-12', totalUnits: 5, progress: 60 }
];
const historicalMastery = [
  { subjectId: 1, retention: 82, timeSpent: 300 },
  { subjectId: 2, retention: 95, timeSpent: 450 },
  { subjectId: 3, retention: 64, timeSpent: 120 },
  { subjectId: 4, retention: 71, timeSpent: 180 }
];
const historicalExams = [
  { id: 201, subjectId: 1, subjectName: 'Data Structures', date: '2026-05-15' },
  { id: 202, subjectId: 2, subjectName: 'Microeconomics', date: '2026-06-01' }
];

const fullContext = buildAIContextWithMemory({
  subjects: [...historicalDbSubjects, fallSubject],
  exams: historicalExams,
  masteryData: historicalMastery,
  profile: { firstName: 'Alex', degree: 'Computer Science' }
});

assert(fullContext.currentSemester, 'Context must have currentSemester');
assert(fullContext.academicMemory, 'Context must have academicMemory');
assert.strictEqual(fullContext.currentSemester.upcomingExams.length, 0, 'Past exams must NOT be in currentSemester.upcomingExams');
assert.strictEqual(fullContext.academicMemory.hasHistoricalContext, true, 'Academic memory must flag historical context as true');
assert.strictEqual(fullContext.academicMemory.previousSemesters.length, 1);
assert.strictEqual(fullContext.academicMemory.previousSemesters[0].strongestSubject, 'Microeconomics');
console.log(`✓ AI Context cleanly separates:`);
console.log(`   - Current Semester Upcoming Exams: ${fullContext.currentSemester.upcomingExams.length}`);
console.log(`   - Previous Semester Strongest: ${fullContext.academicMemory.previousSemesters[0].strongestSubject}`);
console.log(`   - Previous Semester Weakest: ${fullContext.academicMemory.previousSemesters[0].weakestSubject}`);

// 10. AI Recommendation Using Historical Information
console.log('\n[Test 10] Academic Memory Reinforcement Recommendations...');
const recommendations = fullContext.academicMemory.reinforcementRecommendations;
assert(recommendations.length > 0, 'Must generate reinforcement recommendations for low retention subjects');
const mathRec = recommendations.find(r => r.includes('MATH200') || r.includes('Linear Algebra'));
const sysRec = recommendations.find(r => r.includes('CS301') || r.includes('Systems Architecture'));
assert(mathRec, 'Linear Algebra (71% retention) must be recommended for reinforcement');
assert(sysRec, 'Systems Architecture (64% retention) must be recommended for reinforcement');
console.log(`✓ Reinforcement Recommendations generated:`);
recommendations.forEach(r => console.log(`   - ${r}`));

console.log('\n====================================================');
console.log('ALL 10 VERIFICATION TESTS PASSED SUCCESSFULLY! ✓');
console.log('====================================================\n');
