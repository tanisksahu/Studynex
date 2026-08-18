const { generateContentMultimodal } = require('./geminiService');

const EXTRACTION_PROMPT = `
You are the StudyNex Agent Vanguard. You analyze documents/images and the user's existing context to propose concrete actions.
The user just uploaded file(s). You MUST immediately analyze them and output what should happen next.

Available Action Types:
- CREATE_SUBJECTS: { subjects: [{ name, courseCode, credits, confidence }] }
- UPDATE_SUBJECT: { subjectId, updates: { name, courseCode, credits, confidence } }
- CREATE_EXAMS: { exams: [{ subjectName, courseCode, date, startTime, endTime, confidence }] }
- UPDATE_PROFILE: { profile: { degree, program, graduationYear, skills, experience, projects, certifications } }
- CREATE_TASKS: { tasks: [{ title, time, priority }] }
- NULL: if no database mutation is required.

Rules:
1. Deduplication: Look at [USER_CONTEXT]. If a subject already exists, do NOT propose CREATE_SUBJECTS. Instead propose UPDATE_SUBJECT.
2. Confidence: For every extracted array item, include a "confidence" percentage (0-100).
3. RESUME HANDLING: If the file looks like a resume/CV, extract their education (degree, program, graduation year), skills, and summarize projects/experience. Propose an UPDATE_PROFILE action.
4. TRANSCRIPT HANDLING: If it's a transcript or list of courses, propose CREATE_SUBJECTS or UPDATE_SUBJECT.
5. Warnings: If something is blurry or ambiguous, add a string to the "warnings" array.

Return ONLY a JSON object exactly matching this contract (NO markdown wrappers):

If it's a resume:
{
  "success": true,
  "documentType": "RESUME",
  "message": "Resume detected. I found your education and skills. Would you like me to update your StudyNex profile?",
  "proposedActions": [ { "type": "UPDATE_PROFILE", "payload": { "profile": { ... } } } ]
}

If it's a subjects image/document:
{
  "success": true,
  "documentType": "SUBJECT_LIST",
  "message": "Academic transcript detected. I found subjects. Would you like me to update your academic record?",
  "confidence": "high",
  "proposedActions": [ { "type": "CREATE_SUBJECTS", "payload": { "subjects": [...] } } ]
}

If it's an exam date sheet:
{
  "success": true,
  "documentType": "EXAM_DATE_SHEET",
  "message": "Exam schedule detected. I found upcoming exams. Would you like me to add them to your planner?",
  "proposedActions": [ { "type": "CREATE_EXAMS", "payload": { "exams": [...] } } ]
}

If the image is completely unreadable or missing:
{
  "success": false,
  "errorCode": "INVALID_AI_RESPONSE",
  "documentType": "UNKNOWN",
  "message": "I couldn't understand this document.",
  "warnings": ["..."],
  "proposedActions": []
}

[USER_CONTEXT_PLACEHOLDER]
`;

async function extractAcademicData(files, context = {}) {
  console.log('[CommandCenter] Multi-file extraction started');
  
  const prompt = EXTRACTION_PROMPT.replace(
    '[USER_CONTEXT_PLACEHOLDER]', 
    JSON.stringify(context)
  );

  try {
    const responseText = await generateContentMultimodal(prompt, files);
    
    // Clean up potential markdown formatting from Gemini
    let cleanJson = responseText.trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }

    const parsedData = JSON.parse(cleanJson);
    
    if (typeof parsedData.success === 'undefined') {
      parsedData.success = true;
    }
    return parsedData;
  } catch (error) {
    console.error('Extraction Error:', error);
    return {
      success: false,
      errorCode: "GEMINI_EXTRACTION_FAILED",
      message: "I encountered an error trying to extract structured data from these files.",
      details: error.message
    };
  }
}

module.exports = { extractAcademicData };
