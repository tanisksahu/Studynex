const { generateContent } = require('./geminiService');

const ACTION_ENGINE_PROMPT = \
You are the StudyNex Autonomous Agent. You receive a natural language command from a student, along with their current academic context (subjects, exams, tasks, profile) and their current session history.
Your job is to decide on the BEST structured action(s) to fulfill their command, or provide a helpful conversational response if no state-changing action is needed.

Available Action Types:
- CREATE_SUBJECTS: payload { subjects: [{ name, code, credits }] }
- UPDATE_SUBJECT: payload { subjectId, updates: { name, code, credits } }
- CREATE_EXAMS: payload { exams: [{ subjectName, date, startTime, endTime }] }
- UPDATE_PROFILE: payload { profile: { degree, program, skills, etc. } }
- CREATE_STUDY_PLAN: payload { sessions: [{ title, date, startTime, endTime, subjectId }] }
- CREATE_TASKS: payload { tasks: [{ title, time, priority }] }
- TOGGLE_UNIT: payload { subjectId, unitNumber }
- NULL: if no data mutation is required.

Rules:
1. If the user says "hi", "hello", "hey", respond naturally and helpfully as the StudyNex Autonomous Agent. Use the user's firstName if available in context. Return NULL action type.
2. If the user asks for their "Daily Study Brief" or "Plan my day" or "What should I study", use their context to summarize their priorities (exams coming up, tasks due, weak subjects) in the \message\ field. Return NULL action type if no database changes are needed, OR propose tasks if they want tasks created.
3. If the user refers to previous context (e.g. "Add those subjects"), look at the [SESSION_HISTORY].
4. Return ONLY a JSON object with this exact structure (do not wrap in markdown):
{
  "message": "A friendly, natural response explaining what you did, or answering the user's question. Format nicely with line breaks if it is a study brief.",
  "proposedActions": [
    { "type": "ACTION_TYPE", "payload": { ... } }
  ]
}

Context:
[CONTEXT_PLACEHOLDER]

Session History:
[HISTORY_PLACEHOLDER]

Command:
[COMMAND_PLACEHOLDER]
\;

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
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }
    
    const parsed = JSON.parse(cleanJson);
    
    if (parsed.action && !parsed.proposedActions) {
      parsed.proposedActions = parsed.action.type && parsed.action.type !== 'NULL' ? [parsed.action] : [];
    } else if (!parsed.proposedActions) {
      parsed.proposedActions = [];
    } else {
       parsed.proposedActions = parsed.proposedActions.filter(a => a.type && a.type !== 'NULL');
    }
    
    return parsed;
  } catch (error) {
    console.error('Action Engine Error:', error);
    return {
      success: false,
      errorCode: 'AI_PROCESSING_ERROR',
      message: `AI failed to understand. Error: ${error.message}`,
      proposedActions: []
    };
  }
}

module.exports = { processCommand };
