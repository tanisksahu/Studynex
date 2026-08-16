import dayjs from 'dayjs';

/**
 * Calculates the gaps between a sorted list of exams.
 * Returns an array of gap objects representing the interval between an exam and the next.
 */
export const calculateExamGaps = (exams) => {
  if (!exams || exams.length < 2) return [];

  // Sort exams chronologically
  const sortedExams = [...exams].sort((a, b) => {
     const dateA = dayjs(`${a.date} ${a.startTime || '00:00'}`);
     const dateB = dayjs(`${b.date} ${b.startTime || '00:00'}`);
     return dateA.diff(dateB);
  });

  const gaps = [];
  for (let i = 0; i < sortedExams.length - 1; i++) {
    const current = sortedExams[i];
    const next = sortedExams[i + 1];
    
    const currentEnd = dayjs(`${current.date} ${current.endTime || '12:00'}`);
    const nextStart = dayjs(`${next.date} ${next.startTime || '00:00'}`);
    
    const diffHours = nextStart.diff(currentEnd, 'hour');
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;

    gaps.push({
       fromExam: current,
       toExam: next,
       days,
       hours,
       totalHours: diffHours,
       isHighRisk: diffHours < 48 // Flag if gap is less than 48 hours
    });
  }

  return gaps;
};

/**
 * Calculates the Exam Readiness score based on mastery, completeness, and days remaining.
 */
export const calculateExamReadiness = (exam, subject) => {
   if (!exam || !subject) return { score: 0, risk: 'UNKNOWN', reasons: [] };

   let score = 50; // Base score
   const reasons = [];

   // Factor 1: Mastery Level
   if (subject.retention > 80) {
      score += 20;
      reasons.push('High mastery retention');
   } else if (subject.retention < 50) {
      score -= 15;
      reasons.push('Low mastery retention');
   }

   // Factor 2: Progress (Units completed)
   if (subject.progress === 100) {
      score += 20;
      reasons.push('All units completed');
   } else if (subject.progress < 50) {
      score -= 20;
      reasons.push(`${100 - subject.progress}% of units incomplete`);
   }

   // Factor 3: Time remaining
   const examDate = dayjs(`${exam.date} ${exam.startTime || '00:00'}`);
   const daysRemaining = examDate.diff(dayjs(), 'day');

   if (daysRemaining < 3 && score < 70) {
      score -= 15;
      reasons.push(`Only ${daysRemaining} days remaining with low readiness`);
   }

   score = Math.max(0, Math.min(100, score)); // Clamp between 0 and 100

   let risk = 'LOW';
   if (score < 40) risk = 'HIGH';
   else if (score < 70) risk = 'MEDIUM';

   return { score, risk, reasons, daysRemaining };
};

/**
 * Detects exam clusters (e.g., 3 exams within 48 hours)
 */
export const detectConflicts = (exams) => {
   if (!exams || exams.length < 2) return [];

   const sortedExams = [...exams].sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
   const clusters = [];

   for (let i = 0; i < sortedExams.length - 2; i++) {
     const e1 = sortedExams[i];
     const e3 = sortedExams[i + 2];
     const diffDays = dayjs(e3.date).diff(dayjs(e1.date), 'day');

     if (diffDays <= 3) {
       clusters.push({
         type: 'EXAM_CLUSTER',
         message: `3 exams within ${diffDays} days (${e1.date} to ${e3.date})`,
         exams: [e1, sortedExams[i+1], e3]
       });
     }
   }

   // Check same day overlapping
   for (let i = 0; i < sortedExams.length - 1; i++) {
      if (sortedExams[i].date === sortedExams[i+1].date) {
         clusters.push({
            type: 'SAME_DAY',
            message: `Multiple exams on ${sortedExams[i].date}`,
            exams: [sortedExams[i], sortedExams[i+1]]
         });
      }
   }

   return clusters;
};
