import {
    ISetting,
    SettingType,
} from "@rocket.chat/apps-engine/definition/settings";

export const settings: ISetting[] = [
    {
        id: "model",
        i18nLabel: "Model selection",
        i18nDescription: "AI model to use for summarization.",
        type: SettingType.SELECT,
        values: [
            { key: "llama3-8b:1234", i18nLabel: "Llama3 8B" },
            { key: "mistral-7b", i18nLabel: "Mistral 7B" },
        ],
        required: true,
        public: true,
        packageValue: "llama3-8b:1234",
    },
    {
        id: "x-auth-token",
        i18nLabel: "Personal Access Token",
        i18nDescription: "Must be filled to enable file summary add-on",
        type: SettingType.STRING,
        required: false,
        public: true,
        packageValue: "",
    },
    {
        id: "x-user-id",
        i18nLabel: "User ID",
        i18nDescription: "Must be filled to enable file summary add-on",
        type: SettingType.STRING,
        required: false,
        public: true,
        packageValue: "",
    },
];
