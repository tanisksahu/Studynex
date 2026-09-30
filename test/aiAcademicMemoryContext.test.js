import assert from 'node:assert';
import { buildAIContextWithMemory } from '../src/utils/academicMemory.js';

console.log('Testing AI Prompt Context Injection with Academic Memory...');

const mockSubjects = [
  { id: 1, name: 'Data Structures', code: 'CS201', examDate: '2026-05-15', totalUnits: 8, progress: 85 },
  { id: 2, name: 'Microeconomics', code: 'ECON101', examDate: '2026-06-01', totalUnits: 10, progress: 95 },
  { id: 3, name: 'Systems Architecture', code: 'CS301', examDate: '2026-05-20', totalUnits: 6, progress: 50 },
  { id: 4, name: 'Linear Algebra', code: 'MATH200', examDate: '2026-05-12', totalUnits: 5, progress: 60 }
];

const mockMastery = [
  { subjectId: 1, retention: 82, timeSpent: 300 },
  { subjectId: 2, retention: 95, timeSpent: 450 },
  { subjectId: 3, retention: 64, timeSpent: 120 },
  { subjectId: 4, retention: 71, timeSpent: 180 }
];

const mockExams = [
  { id: 201, subjectId: 1, subjectName: 'Data Structures', date: '2026-05-15' },
  { id: 202, subjectId: 2, subjectName: 'Microeconomics', date: '2026-06-01' }
];

const context = buildAIContextWithMemory({
  subjects: mockSubjects,
  exams: mockExams,
  masteryData: mockMastery,
  tasks: [],
  profile: { firstName: 'Alex' }
});

// Verify context conforms strictly to AI prompt expectations
assert(context.currentSemester, 'currentSemester must be defined');
assert.strictEqual(context.currentSemester.upcomingExams.length, 0, 'Past exams must not be upcoming exams');
assert(context.academicMemory, 'academicMemory must be defined');
assert.strictEqual(context.academicMemory.hasHistoricalContext, true);
assert(context.academicMemory.previousSemesters.length > 0);
assert(context.academicMemory.reinforcementRecommendations.length > 0);

console.log('✓ Academic memory context structure validated for AI pipeline.');
