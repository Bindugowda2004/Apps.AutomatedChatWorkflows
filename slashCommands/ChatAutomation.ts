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
} from "../utils/PersistenceMethodsCreationWorkflow";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { sendMessageInChannel } from "../utils/Messages";

export class ChatAutomation implements ISlashCommand {
    public constructor(private readonly app: AiChatWorkflowsAutomationApp) {}

    public command = "chat-automation";
    public i18nDescription = "chat automation config";
    public providesPreview = false;
    public i18nParamsExample = "list";

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        const sender = context.getSender();
        const room = context.getRoom();

        const appUser = (await read.getUserReader().getAppUser()) as IUser;

        const command = context.getArguments();
        const [subcommand] = context.getArguments();
        const filter = subcommand ? subcommand.toLowerCase() : "";

        // let ids: string[] | undefined;

        if (filter === "list") {
            const userCommands = await findTriggerResponsesByCreatorAndLLM(
                read,
                sender.id,
                true
            );

            let messageToSend: string;

            if (userCommands.length > 0) {
                let counter = 1;
                messageToSend = userCommands
                    .map((command) => {
                        const line = `${counter}. Id: ${command.data.id}
                        \nCommand: ${command.data.command}
                        \nNotification: ${command.data.toNotify ? "ON" : "OFF"}
                        \nActive Status: ${
                            command.data.isActive ? "Enabled" : "Disabled"
                        }`;
                        counter++;
                        return line;
                    })
                    .join("\n");
            } else {
                messageToSend =
                    "No automation workflows found. Please create a workflow first.";
            }
            await sendMessageInChannel(
                modify,
                appUser,
                room,
                "Created using chat: "
            );
            await sendMessageInChannel(modify, appUser, room, messageToSend);

            // ==================================================================
            const userCommandsUI = await findTriggerResponsesByCreatorAndLLM(
                read,
                sender.id,
                false
            );

            let messageToSendUI: string;

            if (userCommandsUI.length > 0) {
                let counter = 1;
                messageToSendUI = userCommandsUI
                    .map((command) => {
                        const line = `${counter}. Id: ${command.data.id}
                        \nCommand: ${command.data.command}
                        \nNotification: ${command.data.toNotify ? "ON" : "OFF"}
                        \nActive Status: ${
                            command.data.isActive ? "Enabled" : "Disabled"
                        }`;
                        counter++;
                        return line;
                    })
                    .join("\n");
            } else {
                messageToSendUI =
                    "No automation workflows found. Please create a workflow first.";
            }
            await sendMessageInChannel(
                modify,
                appUser,
                room,
                "Created using UI Block: "
            );
            await sendMessageInChannel(modify, appUser, room, messageToSendUI);
        } else if (filter === "delete") {
            if (command[1]) {
                await deleteTriggerResponse(persistence, command[1]);
                await sendMessageInChannel(
                    modify,
                    appUser,
                    room,
                    `deleted the workflow with id ${command[1]}`
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
                        await sendMessageInChannel(
                            modify,
                            appUser,
                            room,
                            `Notification config updated to 'OFF' for workflow with id: ${command[2]}`
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
                        await sendMessageInChannel(
                            modify,
                            appUser,
                            room,
                            `Notification config updated to 'ON' for workflow with id: ${command[2]}`
                        );
                    }
                }
            }
        } else if (filter === "enable") {
            if (command[1]) {
                await updateIsActiveStatus(persistence, read, command[1], true);
                await sendMessageInChannel(
                    modify,
                    appUser,
                    room,
                    `Automation workflow with id: ${command[1]} is now enabled.`
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
                await sendMessageInChannel(
                    modify,
                    appUser,
                    room,
                    `Automation workflow with id: ${command[1]} is now disabled.`
                );
            }
        } else {
            await sendMessageInChannel(
                modify,
                appUser,
                room,
                `Please provide filter eg: list, delete <id>`
            );
            // ids = command.map((name) => name.replace(/^@/, ''));
        }
    }
}
