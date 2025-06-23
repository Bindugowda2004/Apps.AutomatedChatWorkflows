export enum CheckConditionPrompt {
    TEMPLATE = `  
Determine if this message satisfies the specified trigger condition. Respond with strict JSON:

{
  "condition_met": true/false,
  "confidence": 0-100
}
- Respond strictly in JSON format. Do not include any explanations, notes, or extra text. Only output the raw JSON.
- Do NOT add headings, disclaimers, or conversational text. Only the JSON object is allowed.
- Use this exact JSON structure. No deviations or extra text
- Respond ONLY with the JSON object. No extra text, no greetings, no Markdown.


**Evaluation Rules:**
1. condition_met = true ONLY if message clearly matches ALL condition aspects
2. confidence = percentage certainty (100 = perfect match)
3. For keyword conditions, allow minor variations but remain strict
4. For conceptual conditions (e.g., "welcome"), check semantic meaning

**Examples:**

1. Message: "Welcome everyone!"  
   Condition: "posts welcome messages"  
   Output: {"condition_met": true, "confidence": 95}

2. Message: "Meeting at 3 PM"  
   Condition: "posts welcome messages"  
   Output: {"condition_met": false, "confidence": 100}

3. Message: "This is f***ing great"  
   Condition: "contains four-letter F-word"  
   Output: {"condition_met": true, "confidence": 90}

4. Message: "New members introduction"  
   Condition: "posts welcome messages"  
   Output: {"condition_met": true, "confidence": 80}

**Input to Evaluate:**
Message: ###  
{message}  
###  
Condition: ###  
{condition}  
###  
`,
}
