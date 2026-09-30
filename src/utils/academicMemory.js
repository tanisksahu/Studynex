/**
 * StudyNex Academic Memory & Semester Intelligence Engine
 * * Provides:
 * 1. Logical separation between Current Active Semester and Historical Semesters.
 * 2. Academic Memory synthesis (strengths, weaknesses, retention patterns, reinforcement needs).
 * 3. Structured context generation for the AI agent (never confusing past exams with current ones).
 * 4. Backward-compatible classification of legacy un-tagged records.
 */

import { parseValidDate, getExamClassification } from './dateUtils.js';

export const SEMESTER_DEFINITIONS = [
  {
    id: 'spring-2026',
    name: 'Spring 2026',
    term: 'Semester 2',
    academicYear: '2025–26',
    status: 'completed',
    startDate: '2026-01-10',
    endDate: '2026-06-15'
  },
  {
    id: 'fall-2026',
    name: 'Fall 2026',
    term: 'Semester 1',
    academicYear: '2026–27',
    status: 'active',
    startDate: '2026-08-15',
    endDate: '2026-12-20'
  }
];

export const CURRENT_SEMESTER_ID = 'fall-2026';

/**
 * Classifies whether a subject belongs to historical or current semester.
 * Safely backward-compatible for records created before semester tracking.
 */
export function classifySubjectSemester(subject) {
  if (!subject) return { semesterId: CURRENT_SEMESTER_ID, isHistorical: false };

  // Explicit flag or semester tag
  if (subject.isHistorical || subject.status === 'archived' || subject.status === 'completed') {
    return { semesterId: subject.semesterId || 'spring-2026', isHistorical: true };
  }
  if (subject.semesterId) {
    const isHistorical = subject.semesterId !== CURRENT_SEMESTER_ID;
    return { semesterId: subject.semesterId, isHistorical };
  }

  // Fallback inferred by examDate: May/June 2026 was Spring 2026 (Historical)
  const d = parseValidDate(subject.examDate);
  if (d && d < new Date('2026-07-01T00:00:00')) {
    return { semesterId: 'spring-2026', isHistorical: true };
  }

  return { semesterId: CURRENT_SEMESTER_ID, isHistorical: false };
}

/**
 * Classifies an exam into historical vs active.
 */
export function classifyExamSemester(exam) {
  if (!exam) return { isHistorical: false, classification: 'INVALID' };

  const classification = getExamClassification(exam.date);
  if (exam.isArchived || classification === 'PAST') {
    return { isHistorical: true, classification };
  }

  return { isHistorical: false, classification };
}

/**
 * Synthesizes Academic Memory from previous semester records.
 * Analyzes performance, mastery, retention patterns, and identifies reinforcement needs.
 */
export function synthesizeAcademicMemory({ subjects = [], units = [], masteryData = [], exams = [] }) {
  const historicalSubjects = subjects.filter(s => classifySubjectSemester(s).isHistorical);
  if (historicalSubjects.length === 0) {
    return {
      hasHistory: false,
      semesters: [],
      overallInsights: {
        summary: 'No historical semesters archived yet. Active semester is your baseline.',
        reinforcementSubjects: [],
        strongSubjects: []
      }
    };
  }

  // Group by semester ID
  const semesterMap = new Map();
  historicalSubjects.forEach(sub => {
    const { semesterId } = classifySubjectSemester(sub);
    if (!semesterMap.has(semesterId)) {
      const def = SEMESTER_DEFINITIONS.find(s => s.id === semesterId) || {
        id: semesterId,
        name: 'Spring 2026',
        academicYear: '2025–26',
        term: 'Previous Term',
        status: 'completed'
      };
      semesterMap.set(semesterId, { definition: def, subjects: [] });
    }
    semesterMap.get(semesterId).subjects.push(sub);
  });

  const semesterSummaries = Array.from(semesterMap.values()).map(({ definition, subjects: semSubjects }) => {
    let totalRetention = 0;
    let retentionCount = 0;
    let totalStudyMinutes = 0;
    let completedUnitsCount = 0;
    let totalUnitsCount = 0;

    const enrichedSubjects = semSubjects.map(sub => {
      const mastery = masteryData.find(m => m.subjectId === sub.id) || {};
      const subUnits = units.filter(u => u.subjectId === sub.id);
      const completedUnits = subUnits.filter(u => u.completed).length;
      const totalUnits = sub.totalUnits || sub.units || (subUnits.length || 5);
      const retention = typeof mastery.retention === 'number' ? mastery.retention : (sub.progress || 70);
      const timeSpent = mastery.timeSpent || sub.timeSpent || 120;

      totalRetention += retention;
      retentionCount += 1;
      totalStudyMinutes += timeSpent;
      completedUnitsCount += completedUnits;
      totalUnitsCount += totalUnits;

      const needsReinforcement = retention < 75 || (completedUnits / Math.max(1, totalUnits)) < 0.8;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        difficulty: sub.difficulty,
        retention,
        timeSpentMinutes: timeSpent,
        completedUnits,
        totalUnits,
        progress: sub.progress || Math.round((completedUnits / Math.max(1, totalUnits)) * 100),
        needsReinforcement
      };
    });

    const averageMastery = retentionCount > 0 ? Math.round(totalRetention / retentionCount) : 0;
    const sortedByRetention = [...enrichedSubjects].sort((a, b) => b.retention - a.retention);
    const strongest = sortedByRetention[0] || null;
    const weakest = sortedByRetention[sortedByRetention.length - 1] || null;
    const reinforcementList = enrichedSubjects.filter(s => s.needsReinforcement);

    const semExams = exams.filter(e => {
      const matchSub = semSubjects.some(s => s.id === e.subjectId || s.code === e.courseCode);
      return matchSub || classifyExamSemester(e).isHistorical;
    });

    return {
      semesterId: definition.id,
      name: definition.name,
      academicYear: definition.academicYear,
      term: definition.term,
      status: definition.status,
      subjectCount: semSubjects.length,
      completedUnitsCount,
      totalUnitsCount,
      averageMastery,
      studyTimeHours: Number((totalStudyMinutes / 60).toFixed(1)),
      strongestSubject: strongest ? { name: strongest.name, code: strongest.code, retention: strongest.retention } : null,
      weakestSubject: weakest ? { name: weakest.name, code: weakest.code, retention: weakest.retention } : null,
      reinforcementSubjects: reinforcementList.map(s => ({
        name: s.name,
        code: s.code,
        retention: s.retention,
        incompleteUnits: Math.max(0, s.totalUnits - s.completedUnits)
      })),
      subjects: enrichedSubjects,
      pastExamsCount: semExams.length
    };
  });

  const allReinforcements = [];
  const allStrong = [];
  semesterSummaries.forEach(s => {
    s.reinforcementSubjects.forEach(r => allReinforcements.push(r));
    if (s.strongestSubject) allStrong.push(s.strongestSubject);
  });

  return {
    hasHistory: true,
    semesters: semesterSummaries,
    overallInsights: {
      summary: `Analyzed ${historicalSubjects.length} historical subjects across ${semesterSummaries.length} past semester(s).`,
      reinforcementSubjects: allReinforcements,
      strongSubjects: allStrong
    }
  };
}

/**
 * Builds clean, structured AI context separating Current Semester from Academic Memory.
 * Guarantees past exams are NEVER presented as upcoming exams.
 */
export function buildAIContextWithMemory({
  subjects = [],
  exams = [],
  units = [],
  masteryData = [],
  tasks = [],
  profile = {},
  history = []
}) {
  const memory = synthesizeAcademicMemory({ subjects, units, masteryData, exams });

  // Separate active current semester from historical
  const activeSubjects = subjects.filter(s => !classifySubjectSemester(s).isHistorical);
  const activeExams = exams.filter(e => !classifyExamSemester(e).isHistorical);
  const activeTasks = tasks.filter(t => !t.isHistorical && !t.completed);

  return {
    currentSemester: {
      id: CURRENT_SEMESTER_ID,
      name: 'Fall 2026',
      academicYear: '2026–27',
      subjects: activeSubjects.map(s => ({
        id: s.id,
        name: s.name,
        code: s.code,
        difficulty: s.difficulty,
        totalUnits: s.totalUnits,
        progress: s.progress || 0
      })),
      upcomingExams: activeExams.map(e => ({
        id: e.id,
        subjectName: e.subjectName,
        courseCode: e.courseCode,
        date: e.date,
        startTime: e.startTime,
        classification: getExamClassification(e.date)
      })),
      pendingTasks: activeTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority
      }))
    },
    academicMemory: {
      hasHistoricalContext: memory.hasHistory,
      previousSemesters: memory.semesters.map(s => ({
        name: s.name,
        academicYear: s.academicYear,
        averageMastery: s.averageMastery,
        studyTimeHours: s.studyTimeHours,
        strongestSubject: s.strongestSubject?.name || 'N/A',
        weakestSubject: s.weakestSubject?.name || 'N/A',
        subjectsNeedingReinforcement: s.reinforcementSubjects.map(r => `${r.name} (${r.code}): ${r.retention}% retention, ${r.incompleteUnits} incomplete units`)
      })),
      reinforcementRecommendations: memory.overallInsights.reinforcementSubjects.map(r =>        `Reinforce ${r.name} (${r.code}) due to ${r.retention}% past retention`
      )
    },
    profile: {
      firstName: profile.firstName || 'Scholar',
      institution: profile.institution || '',
      degree: profile.degree || '',
      targetGpa: profile.targetGpa || 3.9
    },
    history
  };
}
