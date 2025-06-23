import {
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationRecord,
    RocketChatAssociationModel,
} from "@rocket.chat/apps-engine/definition/metadata";

// Type for our user step records
interface UserStepData {
    step: number | string;
    userId: string; // Storing userId in the data for easier retrieval
}

// Association constant
const USER_STEP_TRACKER = "user_step_tracker";

/**
 * Sets or updates a user's current step
 * @param persistence IPersistence accessor
 * @param userId The user's ID
 * @param step The step number/identifier
 */
export async function setUserStep(
    persistence: IPersistence,
    userId: string,
    step: number | string
): Promise<void> {
    const userAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        userId
    );
    const trackerAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        USER_STEP_TRACKER
    );

    const data: UserStepData = {
        step,
        userId,
    };

    await persistence.updateByAssociations(
        [userAssoc, trackerAssoc],
        data,
        true // upsert enabled
    );
}

/**
 * Gets a user's current step
 * @param read IRead accessor
 * @param userId The user's ID
 * @returns The current step or undefined if not found
 */
export async function getUserStep(
    read: IRead,
    userId: string
): Promise<number | string | undefined> {
    const userAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        userId
    );
    const trackerAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        USER_STEP_TRACKER
    );

    const [record] = (await read
        .getPersistenceReader()
        .readByAssociations([userAssoc, trackerAssoc])) as UserStepData[];

    return record?.step;
}

/**
 * Clears a user's step data
 * @param persistence IPersistence accessor
 * @param userId The user's ID
 */
export async function clearUserStep(
    persistence: IPersistence,
    userId: string
): Promise<void> {
    const userAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        userId
    );
    const trackerAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        USER_STEP_TRACKER
    );

    await persistence.removeByAssociations([userAssoc, trackerAssoc]);
}

// =======================================================================

// Type for our user questions data
interface UserQuestionsData {
    userId: string; // Storing userId in the data for safety
    questions: string[]; // Array of questions
}

// Association constant
const USER_QUESTIONS_TRACKER = "user_questions_tracker";

/**
 * Stores/replaces questions for a specific user
 * @param persistence IPersistence accessor
 * @param userId The user's ID
 * @param questions Array of questions to store
 */
export async function setUserQuestions(
    persistence: IPersistence,
    userId: string,
    questions: string[]
): Promise<void> {
    const userAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        userId
    );
    const trackerAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        USER_QUESTIONS_TRACKER
    );

    const data: UserQuestionsData = {
        userId,
        questions,
    };

    await persistence.updateByAssociations(
        [userAssoc, trackerAssoc],
        data,
        true // upsert enabled
    );
}

/**
 * Gets questions for a specific user
 * @param read IRead accessor
 * @param userId The user's ID
 * @returns Array of questions or undefined if not found
 */
export async function getUserQuestions(
    read: IRead,
    userId: string
): Promise<string[] | undefined> {
    const userAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        userId
    );
    const trackerAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        USER_QUESTIONS_TRACKER
    );

    const [record] = (await read
        .getPersistenceReader()
        .readByAssociations([userAssoc, trackerAssoc])) as UserQuestionsData[];

    return record?.questions;
}

/**
 * Adds a new question for a specific user
 * @param persistence IPersistence accessor
 * @param read IRead accessor
 * @param userId The user's ID
 * @param newQuestion The question to add
 */
/*
export async function addUserQuestion(
    persistence: IPersistence,
    read: IRead,
    userId: string,
    newQuestion: string
): Promise<void> {
    const existing = await getUserQuestions(read, userId) || [];
    await setUserQuestions(persistence, userId, [...existing, newQuestion]);
}
*/

/**
 * Clears all questions for a user
 * @param persistence IPersistence accessor
 * @param userId The user's ID
 */
export async function clearUserQuestions(
    persistence: IPersistence,
    userId: string
): Promise<void> {
    const userAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        userId
    );
    const trackerAssoc = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MISC,
        USER_QUESTIONS_TRACKER
    );

    await persistence.removeByAssociations([userAssoc, trackerAssoc]);
}

// ==========================================================================

// Define the shape of our stored command data
interface StoredCommand {
    command: string;
    _id?: string;          // Optional persistence internal fields
    _updatedAt?: Date;
}

const USER_COMMAND_TRACKER = 'user_command';

export async function setUserCommand(
    persistence: IPersistence,
    userId: string,
    command: string
): Promise<void> {
    const associations = [
        new RocketChatAssociationRecord(RocketChatAssociationModel.USER, userId),
        new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, USER_COMMAND_TRACKER)
    ];
    
    await persistence.updateByAssociations(associations, { command }, true);
}

export async function getUserCommand(
    read: IRead,
    userId: string
): Promise<string | undefined> {
    const associations = [
        new RocketChatAssociationRecord(RocketChatAssociationModel.USER, userId),
        new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, USER_COMMAND_TRACKER)
    ];
    
    // Add type assertion here
    const [record] = await read.getPersistenceReader().readByAssociations(associations) as StoredCommand[];
    return record?.command;
}

export async function clearUserCommand(
    persistence: IPersistence,
    userId: string
): Promise<void> {
    const associations = [
        new RocketChatAssociationRecord(RocketChatAssociationModel.USER, userId),
        new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, USER_COMMAND_TRACKER)
    ];
    
    await persistence.removeByAssociations(associations);
}

export async function hasUserCommand(
    read: IRead,
    userId: string,
    command: string
): Promise<boolean> {
    const storedCommand = await getUserCommand(read, userId);
    return storedCommand === command;
}