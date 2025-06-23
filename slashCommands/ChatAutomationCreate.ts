import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { AiChatWorkflowsAutomationApp } from '../AiChatWorkflowsAutomationApp';
import { CommandUtility } from '../utils/CommandUtility';

export class ChatAutomationCreate implements ISlashCommand {
    public constructor(private readonly app: AiChatWorkflowsAutomationApp) {}
    
    public command = "chat-automation-create";
    public i18nDescription = "Create automated workflows based on keywords";
    public providesPreview = false;
    public i18nParamsExample = "";

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        const sender = context.getSender();
        const room = context.getRoom();

        const commandUtility = new CommandUtility({
            sender,
            room,
            command: context.getArguments(),
            context,
            read,
            modify,
            http,
            persistence,
            app: this.app,
        });

        await commandUtility.openAutomationCreateForm();
    }
}