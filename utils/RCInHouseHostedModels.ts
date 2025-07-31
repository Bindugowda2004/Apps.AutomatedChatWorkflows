import { IHttp, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { SettingEnum } from "../settings/settings";


export async function createTextCompletionRocketChat(
    read: IRead,
    http: IHttp,
    prompt: string
): Promise<string> {
    const rcModel = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById(SettingEnum.ID_RC_MODEL);

    if (!rcModel) {
        throw new Error("rcModel not configured.");
    }

    const url = `http://${rcModel}/v1`;

    const body = {
        rcModel,
        messages: [
            {
                role: "system",
                content: prompt,
            },
        ],
        temperature: 0,
    };

    const response = await http.post(url + "/chat/completions", {
        headers: {
            "Content-Type": "application/json",
        },
        content: JSON.stringify(body),
    });

    if (!response.content) {
        console.log("Something is wrong with AI. Please try again later");
        throw new Error("Something is wrong with AI. Please try again later");
    }

    return JSON.parse(response.content).choices[0].message.content;
}
