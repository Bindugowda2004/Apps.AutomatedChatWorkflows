import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IPostMessageSentToBot } from "@rocket.chat/apps-engine/definition/messages/IPostMessageSentToBot";
import {
    IMessage,
    IMessageRaw,
} from "@rocket.chat/apps-engine/definition/messages";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import {
    createAnswerIdentificationPrompt,
    createAutomationCommandCreationPrompt,
    createReasoningPrompt,
    createStructuredParsingPrompt,
    createValidCommandPrompt,
} from "../utils/prompt-helpers";
import { sendDirectMessage, sendThreadMessage } from "../utils/Messages";
import {
    clearUserCommand,
    clearUserQuestions,
    clearUserStep,
    getUserCommand,
    getUserQuestions,
    getUserStep,
    saveTriggerResponse,
    setUserCommand,
    setUserQuestions,
    setUserStep,
} from "../utils/PersistenceMethodsCreationWorkflow";
import { generateResponse } from "../utils/GeminiModel";

interface CommandPromptResponse {
    workflow_identification_valid: boolean;
    response: string;
}

interface ReasoningPromptResponse {
    requires_clarification: boolean;
    questions: string[];
}

interface IdentificationPromptResponse {
    answer_identification_valid: boolean;
    response?: {
        questions: string[];
        answers: string[];
    };
    message?: string;
}

interface CommandCreationResponse {
    command: string;
}

interface StructuredParsingResponse {
    trigger: {
        user: string;
        channel: string;
        condition: string;
    };
    response: {
        action: string;
        message: string;
    };
}

export class PostMessageSentToBotHandler implements IPostMessageSentToBot {
    public async executePostMessageSentToBot(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        const user = message.sender;
        const text = message.text;
        const room = message.room;
        const threadId = message.threadId;
        const appUser = (await read.getUserReader().getAppUser()) as IUser;

        if (!text) return;

        // Get a user's step
        const currentStep = await getUserStep(read, user.id);
        if (currentStep && currentStep === "clarification") {
            const questionsArr = await getUserQuestions(read, user.id);
            if (!questionsArr) return;

            const answerIdentificationPrompt = createAnswerIdentificationPrompt(
                questionsArr,
                text
            );
            const answerIdentificationPromptByLLM = await generateResponse(
                read,
                http,
                answerIdentificationPrompt
            );

            const identificationResponse: IdentificationPromptResponse =
                typeof answerIdentificationPromptByLLM === "string"
                    ? JSON.parse(answerIdentificationPromptByLLM)
                    : answerIdentificationPromptByLLM;

            if (!identificationResponse.answer_identification_valid) {
                if (threadId) {
                    await sendThreadMessage(
                        read,
                        modify,
                        appUser,
                        room,
                        identificationResponse.message ||
                            "Please answer all the questions again",
                        threadId
                    );
                }
                return;
            }

            if (!identificationResponse.response) return;

            const currentCommand = await getUserCommand(read, user.id);
            if (!currentCommand) return;

            const automationCommandCreationPrompt =
                createAutomationCommandCreationPrompt(
                    currentCommand,
                    identificationResponse.response?.questions,
                    identificationResponse.response?.answers
                );

            const automationCommandCreationPromptByLLM = await generateResponse(
                read,
                http,
                automationCommandCreationPrompt
            );

            const commandCreationResponse: CommandCreationResponse = {
                command: automationCommandCreationPromptByLLM,
            };

            const structuredParsingPrompt = createStructuredParsingPrompt(
                commandCreationResponse.command
            );
            const structuredParsingPromptByLLM = await generateResponse(
                read,
                http,
                structuredParsingPrompt
            );

            const structuredParsingResponse: StructuredParsingResponse =
                typeof structuredParsingPromptByLLM === "string"
                    ? JSON.parse(structuredParsingPromptByLLM)
                    : structuredParsingPromptByLLM;

            if (!structuredParsingResponse) return;

            const responseToSave = {
                command: commandCreationResponse.command,
                ...structuredParsingResponse,
            };

            const id = await saveTriggerResponse(
                persistence,
                responseToSave,
                user.id,
                true,
                true,
                true
            );

            await clearUserCommand(persistence, user.id);
            await clearUserStep(persistence, user.id);
            await clearUserQuestions(persistence, user.id);

            if (threadId) {
                await sendThreadMessage(
                    read,
                    modify,
                    appUser,
                    room,
                    JSON.stringify(responseToSave),
                    threadId
                );
            }
        } else {
            if (threadId) return;

            const validCommandPrompt = createValidCommandPrompt(text);
            const validCommandPromptByLLM = await generateResponse(
                read,
                http,
                validCommandPrompt
            );

            const response: CommandPromptResponse =
                typeof validCommandPromptByLLM === "string"
                    ? JSON.parse(validCommandPromptByLLM)
                    : validCommandPromptByLLM;

            // If the command in not valid
            if (!response.workflow_identification_valid) {
                await sendDirectMessage(read, modify, user, response.response);
                return;
            }

            const reasoningPrompt = createReasoningPrompt(text);
            const reasoningPromptByLLM = await generateResponse(
                read,
                http,
                reasoningPrompt
            );

            const reasoningResponse: ReasoningPromptResponse =
                typeof reasoningPromptByLLM === "string"
                    ? JSON.parse(reasoningPromptByLLM)
                    : reasoningPromptByLLM;

            if (reasoningResponse.requires_clarification) {
                const questionsArr = reasoningResponse.questions;
                const questions = questionsArr.join("\n");

                await sendDirectMessage(
                    read,
                    modify,
                    user,
                    "For the current command, please continue the conversation in this thread. \nTo create a new command, start a new message - do not reply in this thread."
                );

                const messages: IMessageRaw[] = await read
                    .getRoomReader()
                    .getMessages(room.id, {
                        limit: Math.min(1),
                        sort: { createdAt: "desc" },
                    });

                const newThreadId = messages[0]?.id;
                if (newThreadId) {
                    await sendThreadMessage(
                        read,
                        modify,
                        appUser,
                        room,
                        questions,
                        newThreadId
                    );

                    // call persistence method - set values
                    await setUserCommand(persistence, user.id, text);
                    await setUserStep(persistence, user.id, "clarification");
                    await setUserQuestions(persistence, user.id, questionsArr);
                    return;
                }
            }

            const structuredParsingPrompt = createStructuredParsingPrompt(text);
            const structuredParsingPromptByLLM = await generateResponse(
                read,
                http,
                structuredParsingPrompt
            );

            const structuredParsingResponse: StructuredParsingResponse =
                typeof structuredParsingPromptByLLM === "string"
                    ? JSON.parse(structuredParsingPromptByLLM)
                    : structuredParsingPromptByLLM;

            if (!structuredParsingResponse) return;

            const responseToSave = {
                command: text,
                ...structuredParsingResponse,
            };

            await sendDirectMessage(
                read,
                modify,
                user,
                "_Success! The Chat Automation workflow has been created._ \n_For more details, please open the thread._"
            );

            const id = await saveTriggerResponse(
                persistence,
                responseToSave,
                user.id,
                true,
                true,
                true
            );

            const messages: IMessageRaw[] = await read
                .getRoomReader()
                .getMessages(room.id, {
                    limit: Math.min(1),
                    sort: { createdAt: "desc" },
                });

            const newThreadId = messages[0]?.id;
            if (newThreadId) {
                await sendThreadMessage(
                    read,
                    modify,
                    appUser,
                    room,
                    JSON.stringify(responseToSave),
                    newThreadId
                );
            }
        }
    }
}
