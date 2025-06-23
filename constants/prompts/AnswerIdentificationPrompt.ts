export enum AnswerIdentificationPrompt {
    TEMPLATE = `  
Analyze the user’s response to determine if they’ve answered ALL pending questions. Follow these rules:

1. **Validation Criteria**:  
   - Check if answers match the **order and intent** of the pending questions.  
   - Validate formatting (e.g., '@username', '#channel').  
   - Reject incomplete/ambiguous answers (e.g., "the admin" → "which admin?").  

2. **Response Handling**:  
   - If answers are valid → Return them mapped to questions.  
   - If answers are missing/invalid → Generate a **guided follow-up**.  
   - If new irrelevant info is added → "Let’s focus on the questions first: [list]."  

3. **Output Format (STRICT JSON)**:  
{  
  "answer_identification_valid": true/false,  
  "response": {  
    "questions": ["q1", "q2"],  
    "answers": ["a1", "a2"]  
  } OR "message": "guidance text"  
}  
- Respond strictly in JSON format. Do not include any explanations, notes, or extra text. Only output the raw JSON.
- Do NOT add headings, disclaimers, or conversational text. Only the JSON object is allowed.
- Use this exact JSON structure. No deviations or extra text
- Respond ONLY with the JSON object. No extra text, no greetings, no Markdown.

**Examples**:  

1. **Valid Answer**:  
   - Pending Questions: ["Who is 'captain'? Provide @username", "What message?"]  
   - User Response: "Captain is @john. Send 'Busy now, will update soon.'"  
   - Output:  
{  
  "answer_identification_valid": true,  
  "response": {  
    "questions": ["Who is 'captain'? Provide @username", "What message?"],  
    "answers": ["@john", "Busy now, will update soon"]  
  }  
}  

2. Partial Answer:
   - Pending Questions: ["Apply to ALL admins? If not, specify @username"]
   - User Response: "Yes, all admins"
   - Output:
{  
  "answer_identification_valid": true,  
  "response": {  
    "questions": ["Apply to ALL admins? If not, specify @username"],  
    "answers": ["all"]  
  }  
}  

3. Invalid Answer:
   - Pending Questions: ["Specify @username for 'manager'", "What channel?"]
   - User Response: "Use #general"
   - Output:
{  
  "answer_identification_valid": false,  
  "message": "Almost there! Please: 1) Specify @username for 'manager', 2) Confirm channel: #general?"  
}  

4. Formatting Error:
   - Pending Question: ["Specify @username for 'leader'"]
   - User Response: "Leader is John"
   - Output:
{  
  "answer_identification_valid": false,  
  "message": "Please use @username format for users. Example: 'Leader is @john_rc'"  
}  

5. Irrelevant Response:
Pending Question: ["What message to send?"]
User Response: "Also, make sure to ping me"
Output:
{  
  "answer_identification_valid": false,  
  "message": "Let’s finish this first: What exact message should I send?"  
}  

Now process:
###
Pending Questions: {questions}
User Response: {user_message}
###
`,
}
