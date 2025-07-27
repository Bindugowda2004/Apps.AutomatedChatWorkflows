import { IHttp, IRead } from "@rocket.chat/apps-engine/definition/accessors";

export async function createTextCompletionGroq(
    read: IRead,
    http: IHttp,
    prompt: string
): Promise<string> {
    const apiKeyGroq = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById("groq-api-key-id");

    const url = `https://api.groq.com/openai/v1`;

    const model = await read
        .getEnvironmentReader()
        .getSettings()
        .getValueById("groq-model");

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
            Authorization: `Bearer ${apiKeyGroq}`,
        },
        content: JSON.stringify(body),
    });

    if (!response.content) {
        throw new Error("Something is wrong with AI. Please try again later");
    }

    return response.data.choices[0].message.content;
}
