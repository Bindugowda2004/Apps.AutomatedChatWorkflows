import {
    ValidCommandPrompt,
    ReasoningPrompt,
    AnswerIdentificationPrompt,
    AutomationCommandCreationPrompt,
    StructuredParsingPrompt,
    CheckConditionPrompt,
    EditMessagePrompt,
    PromptInjectionProtectionPrompt,
} from "../constants/prompts";

export function createValidCommandPrompt(user_input: string): string {
    return ValidCommandPrompt.TEMPLATE.replace("{user_input}", user_input);
}

export function createReasoningPrompt(user_input: string): string {
    return ReasoningPrompt.TEMPLATE.replace("{user_input}", user_input);
}

export function createAnswerIdentificationPrompt(
    questions: string[] | string,
    user_message: string
): string {
    const questionsStr = Array.isArray(questions)
        ? JSON.stringify(questions)
        : questions;

    return AnswerIdentificationPrompt.TEMPLATE.replace(
        "{questions}",
        questionsStr
    ).replace("{user_message}", user_message);
}

export function createAutomationCommandCreationPrompt(
    original_request: string,
    questions: string[] | string,
    answers: string[] | string
): string {
    const questionsStr = Array.isArray(questions)
        ? JSON.stringify(questions)
        : questions;
    const answersStr = Array.isArray(answers)
        ? JSON.stringify(answers)
        : answers;

    return AutomationCommandCreationPrompt.TEMPLATE.replace(
        "{original_request}",
        original_request
    )
        .replace("{questions}", questionsStr)
        .replace("{answers}", answersStr);
}

export function createStructuredParsingPrompt(user_input: string): string {
    return StructuredParsingPrompt.TEMPLATE.replace("{user_input}", user_input);
}

export function createCheckConditionPrompt(
    message: string,
    condition: string
): string {
    return CheckConditionPrompt.TEMPLATE.replace("{message}", message).replace(
        "{condition}",
        condition
    );
}

export function createEditMessagePrompt(
    workflow_command: string,
    current_message: string
): string {
    return EditMessagePrompt.TEMPLATE.replace(
        "{workflow_command}",
        workflow_command
    ).replace("{current_message}", current_message);
}

export function createPromptInjectionProtectionPrompt(
    inputText: string
): string {
    return PromptInjectionProtectionPrompt.TEMPLATE.replace(
        "{input_text}",
        inputText
    );
}

// Type-safe generic version
type PromptVariables = {
    [ValidCommandPrompt.TEMPLATE]: {
        user_input: string;
    };

    [CheckConditionPrompt.TEMPLATE]: {
        message: string;
        condition: string;
    };

    [ReasoningPrompt.TEMPLATE]: {
        user_input: string;
    };

    [AnswerIdentificationPrompt.TEMPLATE]: {
        questions: string[] | string;
        user_message: string;
    };

    [AutomationCommandCreationPrompt.TEMPLATE]: {
        original_request: string;
        questions: string[] | string;
        answers: string[] | string;
    };

    [StructuredParsingPrompt.TEMPLATE]: {
        user_input: string;
    };

    [EditMessagePrompt.TEMPLATE]: {
        workflow_command: string;
        current_message: string;
    };

    [PromptInjectionProtectionPrompt.TEMPLATE]: {
        input_text: string;
    };
};

export function createPrompt<T extends keyof PromptVariables>(
    prompt: T,
    variables: PromptVariables[T]
): string {
    let result = prompt.toString();
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(
            `{${key}}`,
            Array.isArray(value) ? JSON.stringify(value) : value
        );
    }
    return result;
}
