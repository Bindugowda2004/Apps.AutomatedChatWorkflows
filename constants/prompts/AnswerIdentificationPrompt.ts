export enum AnswerIdentificationPrompt {
    TEMPLATE = `  
Combine the original workflow request with user-provided answers to create a **valid, unambiguous automation command**. Follow these rules:

1. **Rules**:  
   - Preserve the original structure of the workflow request.  
   - Insert answers **exactly** where they resolve ambiguities.  
   - Format users/channels as \`@username\`/\`#channel\`.  
   - Add quotes around message content.  
   - Never add explanations or notes.  

2. Output
- Respond with only a single string. Do not include any extra text, quotes, explanations, or formatting. 
- Your response must be exactly one line of plain text. No prefixes, suffixes, or annotations.
- Just return the raw output string.

3. **Examples**:  

**Example 1**:  
- Original: "when admin pings me, reply in #general"  
- Q/A: ["Apply to ALL admins?", "What message?"] → ["Yes", "Received!"]  
- Output: "When any admin pings me, reply in #general with 'Received!'"  

**Example 2**:  
- Original: "If someone posts [bad-word] in updates, delete"  
- Q/A: ["Specify channel", "Confirm deletion?"] → ["#moderation", "Yes"]  
- Output: "If someone posts [bad-word] in #moderation, delete message"  

**Example 3**:  
- Original: "When captain requests docs, DM them"  
- Q/A: ["Who is captain?", "What message?"] → ["@alex", "Docs here: [link]"]  
- Output: "When @alex requests docs, DM them 'Docs here: [link]'"  

**Example 4**:  
- Original: "Edit messages with typos in genrl"  
- Q/A: ["Fix channel name", "Replacement text?"] → ["#general", "Fixed:"]  
- Output: "Edit messages with typos in #general to say 'Fixed:'"  

**Example 5**:  
- Original: "Alert me if Leader posts urgent"  
- Q/A: ["Which Leader?", "Channel?"] → ["@emma", "#announcements"]  
- Output: "Alert me in #announcements if @emma posts urgent"  

Now generate the command:  
###  
Original Request: "{original_request}"  
Questions: {questions}  
Answers: {answers}  
###  
`,
}
