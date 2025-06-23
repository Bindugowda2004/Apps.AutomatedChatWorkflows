export enum ReasoningPrompt {
    TEMPLATE = `  
Analyze the workflow creation request to identify missing or ambiguous components. Follow these rules:

1. **Predefined Roles** (Do NOT require usernames):
   - Roles: Admin, Moderator, Leader, Owner, user, bot, app
   - If role is used (e.g., "admin"), ask if rule applies to ALL role members  
   Example: "Should this apply to all admins? If not, specify @username."

2. **Custom Roles** (Require clarification):
   - Terms like "captain", "manager", etc. → MUST ask for @username  
   Example: "Please specify the @username for 'captain'."

3. **Channel Handling**:
   - If channel is ambiguous ("general" vs "#general") → Ask for #channel format
   - If channel doesn’t exist → "I can’t find #updates. Did you mean #announcements?"

4. **Message Actions**:
   - If message content is missing → "What exact message should I send?"
   - If using placeholders → Confirm replacement logic  
     Example: "Should [deadline] auto-fill with tomorrow’s date?"

5. **Output Format** (STRICT JSON):
{
  "requires_clarification": true/false,
  "questions": ["array", "of", "specific", "questions"] 
}
- Respond strictly in JSON format. Do not include any explanations, notes, or extra text. Only output the raw JSON.
- Do NOT add headings, disclaimers, or conversational text. Only the JSON object is allowed.
- Use this exact JSON structure. No deviations or extra text
- Respond ONLY with the JSON object. No extra text, no greetings, no Markdown.


**Examples**:

1. Input: "whenever captain asks for updates, send message"
Output: 
{
  "requires_clarification": true,
  "questions": ["Who is 'captain'? Please provide @username"]
}

2. Input: "when admin pings me, reply in #general"
Output: 
{
  "requires_clarification": true,
  "questions": [
    "Should this apply to ALL admins? If not, specify @username",
    "What message should I send in #general?"
  ]
}

3. Input: "If @alex posts in updates, delete it"
Output:
{
  "requires_clarification": true,
  "questions": [
    "Did you mean #updates channel? I can’t find 'updates'",
    "Confirm delete action for ALL @alex's messages in this channel?"
  ]
}

4. Input: "When Moderator says 'urgent' in #support, DM them instructions"
Output: 
{
  "requires_clarification": true,
  "questions": [
    "Apply to ALL Moderators? If not, specify @username",
    "What exact instructions should I DM?"
  ]
}

5. Valid Input: "When @user_bot posts in #alerts, send-message-in-channel 'Priority issue!'"
Output: 
{
  "requires_clarification": false,
  "questions": []
}

Now analyze this request:
###
{user_input}
###
`,
}
