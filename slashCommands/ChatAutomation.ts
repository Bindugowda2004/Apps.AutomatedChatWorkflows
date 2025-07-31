import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { AiChatWorkflowsAutomationApp } from "../AiChatWorkflowsAutomationApp";
import {
    deleteTriggerResponse,
    findTriggerResponsesByCreatorAndLLM,
    updateIsActiveStatus,
    updateToNotifyStatus,
} from "../utils/PersistenceMethods";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { MessageEnum } from "../definitions/MessageEnum";
import {
    sendDirectMessage,
    sendNotification,
    sendMessageInChannel,
    sendThreadMessage,
} from "../utils/Messages";
import { IMessageRaw } from "@rocket.chat/apps-engine/definition/messages";

export class ChatAutomation implements ISlashCommand {
    public constructor(private readonly app: AiChatWorkflowsAutomationApp) {}

    public command = "chat-automation";
    public i18nDescription = "chat automation config";
    public providesPreview = false;
    public i18nParamsExample = "";

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        const user = context.getSender();
        const room = context.getRoom();
        const threadId = context.getThreadId();

        const appUser = (await read.getUserReader().getAppUser()) as IUser;

        const command = context.getArguments();
        const [subcommand] = context.getArguments();
        const filter = subcommand ? subcommand.toLowerCase() : "";

        if (filter === "list") {
            const userCommands = await findTriggerResponsesByCreatorAndLLM(
                read,
                user.id,
                true
            );

            let messageToSend: string;

            if (userCommands.length > 0) {
                let counter = 1;
                messageToSend = userCommands
                    .map((command) => {
                        const line = `${counter}. *Id*: ${command.data.id}
                        *Command*: ${command.data.command}
                        *Notification*: ${command.data.toNotify ? "ON" : "OFF"}
                        *Active Status*: ${
                            command.data.isActive ? "Enabled" : "Disabled"
                        }\n`;
                        counter++;
                        return line;
                    })
                    .join("\n");
            } else {
                messageToSend = MessageEnum.WORKFLOW_NOT_FOUND_DM;
            }

            await sendNotification(
                read,
                modify,
                user,
                room,
                `Created using chat: 
                ${messageToSend}`,
                threadId
            );

            /*
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
                    messageToSend,
                    newThreadId
                );
            }
            */

            // ==================================================================
            const userCommandsUI = await findTriggerResponsesByCreatorAndLLM(
                read,
                user.id,
                false
            );

            let messageToSendUI: string;

            if (userCommandsUI.length > 0) {
                let counter = 1;
                messageToSendUI = userCommandsUI
                    .map((command) => {
                        const line = `${counter}. *Id*: ${command.data.id}
                        *Command*: ${command.data.command}
                        *Notification*: ${command.data.toNotify ? "ON" : "OFF"}
                        *Active Status*: ${
                            command.data.isActive ? "Enabled" : "Disabled"
                        }\n`;
                        counter++;
                        return line;
                    })
                    .join("\n");
            } else {
                messageToSendUI = MessageEnum.WORKFLOW_NOT_FOUND_UI;
            }

            await sendNotification(
                read,
                modify,
                user,
                room,
                `Created using UI Block: 
                ${messageToSendUI}`,
                threadId
            );

            /*
            const messagesForUI: IMessageRaw[] = await read
                .getRoomReader()
                .getMessages(room.id, {
                    limit: Math.min(1),
                    sort: { createdAt: "desc" },
                });

            const newThreadIdUI = messagesForUI[0]?.id;
            if (newThreadIdUI) {
                await sendThreadMessage(
                    read,
                    modify,
                    appUser,
                    room,
                    messageToSendUI,
                    newThreadIdUI
                );
            }
            */
        } else if (filter === "delete") {
            if (command[1]) {
                await deleteTriggerResponse(persistence, command[1]);

                await sendNotification(
                    read,
                    modify,
                    user,
                    room,
                    `Deleted the workflow with id ${command[1]}`,
                    threadId
                );
            }
        } else if (filter === "notification") {
            if (command[1]) {
                if (command[1].toLocaleLowerCase() === "off") {
                    if (command[2]) {
                        await updateToNotifyStatus(
                            persistence,
                            read,
                            command[2],
                            false
                        );

                        await sendNotification(
                            read,
                            modify,
                            user,
                            room,
                            `Notification config updated to 'OFF' for workflow with id: ${command[2]}`,
                            threadId
                        );
                    }
                } else if (command[1].toLocaleLowerCase() === "on") {
                    if (command[2]) {
                        await updateToNotifyStatus(
                            persistence,
                            read,
                            command[2],
                            true
                        );

                        await sendNotification(
                            read,
                            modify,
                            user,
                            room,
                            `Notification config updated to 'ON' for workflow with id: ${command[2]}`,
                            threadId
                        );
                    }
                }
            }
        } else if (filter === "enable") {
            if (command[1]) {
                await updateIsActiveStatus(persistence, read, command[1], true);

                await sendNotification(
                    read,
                    modify,
                    user,
                    room,
                    `Automation workflow with id: ${command[1]} is now enabled.`,
                    threadId
                );
            }
        } else if (filter === "disable") {
            if (command[1]) {
                await updateIsActiveStatus(
                    persistence,
                    read,
                    command[1],
                    false
                );
                await sendNotification(
                    read,
                    modify,
                    user,
                    room,
                    `Automation workflow with id: ${command[1]} is now disabled.`,
                    threadId
                );
            }
        } else if (filter === "ping") {
            await sendDirectMessage(
                read,
                modify,
                user,
                `_Hello ${user.name}, I'm ${appUser.name} App. I can help you create Chat Automation workflows!_
                Here’s how it works: 
                _"Whenever @<username> posts any welcome messages in #<channel name>, immediately DM them with a thank-you note."_
                _Just describe what you'd like to automate, and I'll take care of the rest!_`
            );
        } else {
            await sendNotification(
                read,
                modify,
                user,
                room,
                MessageEnum.CHAT_AUTOMATION_COMMAND_INSTRUCTION_MESSAGE,
                threadId
            );
        }
    }
}
