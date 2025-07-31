export function formatWorkflowDetails(
    responseToSave: {
        command: string;
        trigger: {
            user?: string;
            channel?: string;
            condition: string;
        };
        response: {
            action: string;
            message?: string;
        };
    },
    workflowId: string
): string {
    const user = responseToSave.trigger.user || "anyone";
    const channel = responseToSave.trigger.channel || "any channel";
    const condition = responseToSave.trigger.condition;
    const action = responseToSave.response.action;
    const message = responseToSave.response.message || "";

    const userMention = user === "anyone" ? "anyone" : `${user}`;
    const channelMention = channel === "any channel" ? channel : `${channel}`;

    let descriptionLine = "Whenever ";
    if (user === "anyone") {
        descriptionLine += `a message is posted`;
    } else {
        descriptionLine += `${userMention} posts a message`;
    }

    descriptionLine += ` that matches the condition "${condition}"`;

    if (channel !== "any channel") {
        descriptionLine += ` in ${channelMention}`;
    }

    switch (action) {
        case "send-message-in-dm":
            descriptionLine += `, immediately send them a direct message saying: "${message}"`;
            break;
        case "send-message-in-channel":
            descriptionLine += `, immediately post a message in ${channelMention} saying: "${message}"`;
            break;
        case "delete-message":
            descriptionLine += `, delete that message immediately.`;
            break;
        case "edit-message":
            descriptionLine += `, immediately edit the message with:\n\n"${message}"`;
            break;
        default:
            descriptionLine += `, perform an unknown action.`;
    }

    const breakdown = `Here’s how it works:
👀 Who we’re watching: ${user}
📍 Where: ${channel}
🎯 Condition: ${condition}
⚙️ Action: ${action}${message ? `\n📝 Message: "${message}"` : ""}`;

    return `🚀 Your Workflow is Ready!

${descriptionLine}

${breakdown}`;
}
