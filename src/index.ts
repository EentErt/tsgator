import { exit } from "process";
import { Config } from "./config.js";
import { setUser, readConfig } from "./config.js";
import { db } from "./lib/db/index.js";
import { createUser, getUserByName } from "./lib/db/queries/users.js";

let cfg = {} as Config;

async function main() {
    let registry = {} as CommandsRegistry;
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);

    cfg = readConfig();

    const args = process.argv.slice(2);
    try {
        await runCommand(registry, args[0], ...args.slice(1));
    } catch (error) {
        console.log("Error:", error);
        exit(1);
    }
    process.exit(0);
}

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        throw new Error("username required"); 
    }

    setUser(cfg, args[0]);
    console.log("Logged in as", args[0]);
}

async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        throw new Error("name required"); 
    }
    try {
        let existing = await getUserByName(args[0]);
        if existing =
    }
    try {
        let user = await createUser(args[0]);
    } catch (error) {
        throw error;
    }
}

type CommandsRegistry = Record<string, CommandHandler>;

function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error("unknown command: " + cmdName);
    }

    handler(cmdName, ...args);
}




main();