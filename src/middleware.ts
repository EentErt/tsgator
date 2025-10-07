import { CommandHandler, handlerAddFeed, runCommand } from "./handlers.js";
import { getUserByName, User } from "./lib/db/queries/users.js";
import { readConfig } from "./config.js";

export type UserCommandHandler = (
    cmdName: string,
    user: User,
    ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
    return async (cmdName, ...args) => { 
        const cfg = readConfig();

        const user = await getUserByName(cfg.currentUserName);
        if (!user) {
            throw new Error("Please log in first");
        }
        return handler(cmdName, user, ...args); }
}