export enum StructuredParsingPrompt {
    TEMPLATE = `
Parse the user's automation command into a strictly formatted JSON object with ALL FIELDS MANDATORY (use null for empty values):

OUTPUT FORMAT (JSON):
{
  "trigger": {
    "user": "<user_mention_or_null>",
    "channel": "<channel_name_or_null>",
    "condition": "<description_of_trigger_condition>"
  },
  "response": {
    "action": "<action_type>",
    "message": "<exact_message_text_or_null>"
  }
}
- Respond strictly in JSON format. Do not include any explanations, notes, or extra text. Only output the raw JSON.
- Do NOT add headings, disclaimers, or conversational text. Only the JSON object is allowed.
- Use this exact JSON structure. No deviations or extra text
- Respond ONLY with the JSON object. No extra text, no greetings, no Markdown.

RULES:
1. ALL fields must be present in the output
2. Use null for any empty/unspecified values
3. "action" must be one of: "send-message-in-dm", "send-message-in-channel", "delete-message", "edit-message"
4. "condition" should describe the trigger scenario in natural language
5. "message" must be:
   - EXACT text from command if quoted/instructed
   - null for "delete-message"
   - Contextual response ONLY if generic term used (e.g., "thank-you note")
6. Preserve message casing/punctuation exactly

Examples:

1. Input: "whenever @sing.li posts any welcome messages in #gsoc2025, immediately DM them with a thank-you note"
Output:
{
  "trigger": {
    "user": "@sing.li",
    "channel": "#gsoc2025",
    "condition": "posts welcome messages"
  },
  "response": {
    "action": "send-message-in-dm",
    "message": "Thank you for welcoming participants in the #gsoc2025 channel!"
  }
}

2. Input: "whenever @sing.li posts any welcome messages in #gsoc2025, immediately DM them with 'thank-youuu'"
Output:
{
  "trigger": {
    "user": "@sing.li",
    "channel": "#gsoc2025",
    "condition": "posts welcome messages"
  },
  "response": {
    "action": "send-message-in-dm",
    "message": "thank-youuu"
  }
}

3. Input: "Delete all messages containing [bad-word] in #moderation"
Output:
{
  "trigger": {
    "user": null,
    "channel": "#moderation",
    "condition": "contains [bad-word]"
  },
  "response": {
    "action": "delete-message",
    "message": null
  }
}

4. Input: "If someone posts 'wrong info' in #updates, edit it to say 'please check official sources'"
Output:
{
  "trigger": {
    "user": null,
    "channel": "#updates",
    "condition": "posts 'wrong info'"
  },
  "response": {
    "action": "edit-message",
    "message": "please check official sources"
  }
}

Now parse this command:
###
{user_input}
###
`,
}
