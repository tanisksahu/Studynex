const { generateContent } = require('./geminiService');

const ACTION_ENGINE_PROMPT = `
You are the StudyNex Action Engine. You receive a natural language command from a student, along with their current academic context (subjects, exams, tasks) and their current session history.
Your job is to decide on the BEST structured action(s) to fulfill their command, or provide a helpful conversational response if no action is needed.

Available Action Types:
- CREATE_SUBJECTS: payload { subjects: [{ name, code, credits }] }
- UPDATE_SUBJECT: payload { subjectId, updates: { name, code, credits } }
- CREATE_EXAMS: payload { exams: [{ subjectName, date, startTime, endTime }] }
- UPDATE_PROFILE: payload { profile: { degree, program, skills, etc. } } // MERGE logic
- CREATE_STUDY_PLAN: payload { sessions: [{ title, date, startTime, endTime, subjectId }] }
- CREATE_TASKS: payload { tasks: [{ title, time, priority }] }
- NULL: if no data mutation is required.

Rules:
1. If the user refers to previous context (e.g. "Add those subjects"), look at the [SESSION_HISTORY].
2. You can propose multiple actions if needed. Return them in an array.

Return ONLY a JSON object with this exact structure (do not wrap in markdown):
{
  "message": "A friendly, concise response explaining what you did or asking for clarification.",
  "action": {
    "type": "ACTION_TYPE or null",
    "payload": { ... }
  },
  "proposedActions": [
    { "type": "CREATE_SUBJECTS", "payload": { "subjects": [...] } }
  ]
}

Note: If proposing multiple actions, use "proposedActions". If just one, use "action". Or just use "proposedActions" for everything to be safe.

Context:
[CONTEXT_PLACEHOLDER]

Session History:
[HISTORY_PLACEHOLDER]

Command:
[COMMAND_PLACEHOLDER]
`;

async function processCommand(command, context) {
  try {
    const history = context.history || [];
    
    // Clean context so we don't send massive history blobs back to prompt
    const safeContext = { ...context };
    delete safeContext.history;

    const prompt = ACTION_ENGINE_PROMPT
      .replace('[CONTEXT_PLACEHOLDER]', JSON.stringify(safeContext))
      .replace('[HISTORY_PLACEHOLDER]', JSON.stringify(history))
      .replace('[COMMAND_PLACEHOLDER]', command);
      
    const responseText = await generateContent(prompt, true); // Use JSON mode
    
    // Clean up potential markdown formatting from Gemini
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    
    const parsed = JSON.parse(cleanJson.trim());
    
    // Normalize to proposedActions array
    if (parsed.action && !parsed.proposedActions) {
      parsed.proposedActions = [parsed.action];
    } else if (!parsed.proposedActions) {
      parsed.proposedActions = [];
    }
    
    return parsed;
  } catch (error) {
    console.error('Action Engine Error:', error);
    return {
      message: "I encountered an error processing your command.",
      proposedActions: []
    };
  }
}

module.exports = { processCommand };
