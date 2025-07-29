import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IPostMessageSent } from "@rocket.chat/apps-engine/definition/messages";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import {
    findTriggerResponsesByNullCombinations,
    findTriggerResponsesByUserAndChannel,
} from "../utils/PersistenceMethodsCreationWorkflow";
import {
    createCheckConditionPrompt,
    createEditMessagePrompt,
} from "../utils/prompt-helpers";
import {
    deleteMessage,
    sendDirectMessage,
    sendMessageInChannel,
    updateMessageText,
} from "../utils/Messages";
import { generateResponse } from "../utils/GeminiModel";

interface CheckConditionResponse {
    condition_met: boolean;
    confidence: number;
}

interface EditMessageResponse {
    message: string;
}

export class PostMessageSentHandler implements IPostMessageSent {
    public async executePostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const user = message.sender;
        const text = message.text;
        const room = message.room;

        // Get the bot user
        const appUser = (await read.getUserReader().getAppUser()) as IUser;

        if (!text) return;
        if (user.name === "ai-chat-workflows-automation.bot") return;
        // if(room.slugifiedName == undefined) return;

        try {
            // Get all trigger responses for this user and channel
            // console.log("user: " + user.username);
            // console.log("room: " + room.slugifiedName);
            // console.log("room.type: " + room.type);

            const triggerResponses = await findTriggerResponsesByUserAndChannel(
                read,
                user.username,
                room.slugifiedName ?? ""
            );

            // console.log(`Found ${triggerResponses.length} trigger responses with user ${user.username} in channel ${room.slugifiedName}`);

            const triggerResponses2 =
                await findTriggerResponsesByNullCombinations(read);
            // console.log(`Found ${triggerResponses2.length} trigger responses with null user or channel case`);

            const allResponses = [...triggerResponses, ...triggerResponses2];
            // console.log(`Found ${allResponses.length} in merged result`);

            for (const [index, response] of allResponses.entries()) {
                // UI Approach
                if (!response.data.usedLLM) {
                    if (!text.includes(response.data.trigger.condition))
                        continue;

                    if (response.data.response.action === "delete-message") {
                        const isDeleted = await deleteMessage(
                            modify,
                            message,
                            user
                        );
                    }

                    if (response.data.response.message) {
                        if (
                            response.data.response.action ===
                            "send-message-in-dm"
                        ) {
                            await sendDirectMessage(
                                read,
                                modify,
                                user,
                                response.data.response.message
                            );
                        } else if (
                            response.data.response.action ===
                            "send-message-in-channel"
                        ) {
                            await sendMessageInChannel(
                                modify,
                                appUser,
                                room,
                                response.data.response.message
                            );
                        }

                        if (response.data.toNotify) {
                            const creatorUser = await read
                                .getUserReader()
                                .getById(response.data.createdBy);
                            const confirmationMessage = `Automation Workflow triggered for command: \n${response.data.command}`;

                            await sendDirectMessage(
                                read,
                                modify,
                                creatorUser,
                                confirmationMessage
                            );
                        }
                    }
                    continue;
                }

                // LLM Approach
                // LLM call to check if the condition is triggered
                const checkConditionPrompt = createCheckConditionPrompt(
                    text,
                    response.data.trigger.condition
                );
                const checkConditionPromptByLLM = await generateResponse(
                    read,
                    http,
                    checkConditionPrompt
                );

                const checkConditionResponse: CheckConditionResponse =
                    typeof checkConditionPromptByLLM === "string"
                        ? JSON.parse(checkConditionPromptByLLM)
                        : checkConditionPromptByLLM;

                if (!checkConditionResponse.condition_met) continue;
                if (checkConditionResponse.confidence < 75) continue;

                if (response.data.response.action === "delete-message") {
                    const isDeleted = await deleteMessage(
                        modify,
                        message,
                        user
                    );
                }

                const messageToSend = response.data.response.message;
                if (!messageToSend) continue;

                if (response.data.response.action === "send-message-in-dm") {
                    await sendDirectMessage(read, modify, user, messageToSend);
                } else if (
                    response.data.response.action === "send-message-in-channel"
                ) {
                    await sendMessageInChannel(
                        modify,
                        appUser,
                        room,
                        messageToSend
                    );
                } else if (response.data.response.action === "edit-message") {
                    const editMessagePrompt = createEditMessagePrompt(
                        response.data.command,
                        text
                    );
                    const editMessagePromptByLLM = await generateResponse(
                        read,
                        http,
                        editMessagePrompt
                    );

                    const editMessageResponse: EditMessageResponse = {
                        message: editMessagePromptByLLM,
                    };

                    if (!editMessageResponse.message) continue;

                    await updateMessageText(
                        modify,
                        message,
                        editMessageResponse.message,
                        user
                    );
                }

                if (response.data.toNotify) {
                    const creatorUser = await read
                        .getUserReader()
                        .getById(response.data.createdBy);
                    const confirmationMessage = `Automation Workflow triggered for command: \n${response.data.command}`;

                    await sendDirectMessage(
                        read,
                        modify,
                        creatorUser,
                        confirmationMessage
                    );
                }
            }
        } catch (error) {
            console.error("Error checking trigger responses:", error);
        }
    }
}
