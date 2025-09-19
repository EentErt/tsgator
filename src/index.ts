import { exit } from "process";
import { Config } from "./config.js";
import { setUser, readConfig } from "./config.js";

let cfg = {} as Config;

function main() {
    let registry = {} as CommandsRegistry;
    registerCommand(registry, "login", handlerLogin);

    cfg = readConfig();

    const args = process.argv.slice(2);
    try {
        runCommand(registry, args[0], ...args.slice(1));
    } catch (error) {
        console.log("Error:", error);
        exit(1);
    }
}

type CommandHandler = (cmdName: string, ...args: string[]) => void;

function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length < 1) {
        throw new Error("username required"); 
    }

    setUser(cfg, args[0]);
    console.log("Logged in as", args[0]);
}

type CommandsRegistry = Record<string, CommandHandler>;

function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error("unknown command: " + cmdName);
    }

    handler(cmdName, ...args);
}

main();