export enum MessageEnum {
    SUCCESS_MESSAGE_APP_DM_DIRECT = `_Success! The Chat Automation workflow has been created._ 
    _For more details, please open the thread._`,
    SUCCESS_MESSAGE_APP_DM_REASONING = `_Success! The Chat Automation workflow has been created._ 
    _Here are the details:_`,
    SUCCESS_MESSAGE_UI_MODAL = `_Success! The Chat Automation workflow has been created._
    Automation command: 
    `,
    CONTINUE_IN_THREAD_MESSAGE = `For the current command, please continue the conversation in this thread. 
    To create a new command, start a new message - do not reply in this thread.`,
    WORKFLOW_NOT_FOUND_DM = `_No automation workflows found that were created using Chat. Please create a workflow using Chat first._`,
    WORKFLOW_NOT_FOUND_UI = `_No automation workflows found that were created using the UI Block. Please create a workflow using the UI Block first._`,
    CHAT_AUTOMATION_COMMAND_INSTRUCTION_MESSAGE = `🛠️ *Available Slash Commands*\n\n` +
        `• \`/chat-automation ping\` – Sends a hello message to your DM\n` +
        `• \`/chat-automation list\` – Lists all created workflows\n` +
        `• \`/chat-automation delete <id>\` – Deletes the workflow with the specified ID\n` +
        `• \`/chat-automation enable <id>\` – Enables the workflow with the specified ID\n` +
        `• \`/chat-automation disable <id>\` – Disables the workflow with the specified ID\n` +
        `• \`/chat-automation notification on <id>\` – Enables notifications for a workflow\n` +
        `• \`/chat-automation notification off <id>\` – Disables notifications for a workflow\n\n` +
        `👉 *Please provide a filter or action*, e.g., \`ping\`, \`list\`, \`delete workflowId_1753828680384\`, \`notification off workflowId_1753828680384\``,
}
