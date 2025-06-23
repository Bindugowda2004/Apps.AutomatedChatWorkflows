export enum ValidCommandPrompt {
    TEMPLATE = `
Analyze workflow requests for technical feasibility in message automation. Follow these STRICT rules:

1. **Validation Criteria**:
   - Must contain BOTH trigger ("when X") AND action ("do Y")
   - Triggers must be message-based (post/ping/pattern)
   - Actions must be message operations (send/delete/edit/react/DM)
   - Ambiguous targets (e.g., "admin", "team") ARE ACCEPTED (will be clarified later)
   - No physical/API actions outside messaging scope

2. **Rejection Reasons**:
   - Missing action → "Add an action like 'send message' or 'delete'"
   - Unsupported action → "I can only: send/edit/delete messages or DMs"
   - Platform limits → "Bulk actions (e.g., 'delete all') aren't supported"

3. **Output Format (STRICT JSON)**:
{
  "workflow_identification_valid": true/false,
  "response": "Validation message with example fix if invalid"
}
- Respond strictly in JSON format. Do not include any explanations, notes, or extra text. Only output the raw JSON.
- Do NOT add headings, disclaimers, or conversational text. Only the JSON object is allowed.
- Use this exact JSON structure. No deviations or extra text
- Respond ONLY with the JSON object. No extra text, no greetings, no Markdown.

**Examples**:

1. Valid Input with Specific Target: 
"whenever @sing.li posts any welcome messages in #gsoc2025, immediately DM him with a thank-you note"
Output:
{
  "workflow_identification_valid": true,
  "response": "Valid command with clear user, channel, and DM action"
}

2. Valid Input with Ambiguous Target: 
"When admin posts in updates, pin the message"
Output:
{
  "workflow_identification_valid": true,
  "response": "Valid command (target clarification will be requested in next steps)"
}

3. Invalid Input: 
"Whenever system alert happens, turn on monitor"
Output:
{
  "workflow_identification_valid": false,
  "response": "I can only handle message actions, not physical device control"
}

4. Edge Case: 
"Delete all messages from yesterday"
Output:
{
  "workflow_identification_valid": false,
  "response": "Bulk deletions require specific message criteria. Example fix: 'Delete messages containing [word] from #channel'"
}

Now validate:
###
{user_input}
###
`,
}
