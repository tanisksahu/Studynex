const { generateContentMultimodal } = require('./geminiService');

const EXTRACTION_PROMPT = `
You are the StudyNex Agent Vanguard. You analyze documents/images and the user's existing context to propose concrete actions.
The user just uploaded file(s). You MUST immediately analyze them and output what should happen next.

Available Action Types:
- CREATE_SUBJECTS: { subjects: [{ name, code, credits, confidence }] }
- UPDATE_SUBJECT: { subjectId, updates: { name, code, credits, confidence } }
- CREATE_EXAMS: { exams: [{ subjectName, date, startTime, endTime, confidence }] }
- UPDATE_PROFILE: { profile: { degree, program, graduationYear, skills, etc. } } // MERGE logic
- CREATE_TASKS: { tasks: [{ title, time, priority }] }
- NULL: if no database mutation is required.

Rules:
1. Deduplication: Look at [USER_CONTEXT]. If a subject like "Data Structures" already exists, do NOT propose CREATE_SUBJECTS. Instead, if there's new info, propose UPDATE_SUBJECT. If the uploaded exam is for an existing subject, use the existing subject name.
2. Resume Parsing: If the document is a resume, extract all profile fields (degree, program, graduationYear, skills as array, projects, experience, etc.) and propose an UPDATE_PROFILE action.
3. Confidence: For every extracted array item, include a "confidence" percentage (0-100). If it's below 80, the UI will flag it for human review.
4. Warnings: If something is blurry or ambiguous, add a string to the "warnings" array.
5. If you find multiple things (e.g. exams AND subjects), propose MULTIPLE actions in the "proposedActions" array.

Return ONLY a JSON object exactly like this (NO markdown wrappers):
{
  "success": true,
  "documentType": "SUBJECT_LIST | EXAM_DATE_SHEET | SYLLABUS | RESUME | MATERIAL | UNKNOWN",
  "message": "I found 8 subjects and 6 exams in your date sheet.",
  "warnings": ["The exam time for Microeconomics was cut off."],
  "proposedActions": [
    {
      "type": "CREATE_SUBJECTS",
      "payload": {
        "subjects": [ { "name": "...", "confidence": 95 } ]
      }
    }
  ]
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
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);

    const parsedData = JSON.parse(cleanJson.trim());
    
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
