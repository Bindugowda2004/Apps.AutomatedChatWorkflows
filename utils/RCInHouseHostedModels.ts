import { IHttp, IRead } from "@rocket.chat/apps-engine/definition/accessors";

export async function createTextCompletion(
    read: IRead,
    http: IHttp,
    prompt: string
): Promise<string> {
    const model = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById("model");
    const url = `http://${model}/v1`;

    const body = {
        model,
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
