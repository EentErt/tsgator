import { exit } from "process";
import { Config } from "./config.js";
import { setUser, readConfig } from "./config.js";
import { db } from "./lib/db/index.js";
import { createUser, getUserByName, getUserById, getUsers, reset } from "./lib/db/queries/users.js";
import { addFeed, getFeeds, Feed } from "./lib/db/queries/feeds.js"
import { fetchFeed } from "./fetchfeed.js";

let cfg = {} as Config;

async function main() {
    let registry = {} as CommandsRegistry;
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "addfeed", handlerAddFeed);
    registerCommand(registry, "feeds", handlerFeeds);

    cfg = readConfig();

    const args = process.argv.slice(2);
    console.log("Running command:", args[0])
    try {
        await runCommand(registry, args[0], ...args.slice(1));
    } catch (error) {
        console.log("Error:", error);
        process.exit(1);
    }
    process.exit(0);
}

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args[0] === undefined) {
        throw new Error("username required"); 
    }

    console.log("Checking if user exists")
    let existing = await getUserByName(args[0]);
    if (existing === undefined) {
        throw new Error(`No user with name ${args[0]} exists`)
    }

    setUser(cfg, args[0]);
    console.log("Logged in as", args[0]);
}

async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
    if (args[0] === undefined) {
        throw new Error("name required"); 
    }

    console.log("Checking if user exists")
    let existing = await getUserByName(args[0]);
    if (existing !== undefined) {
        throw new Error(`User with name ${args[0]} already exists`)
    }

    console.log("User does not exist. Creating user.")
    try {
        let user = await createUser(args[0]);
        setUser(cfg, user.name);
        console.log("Created and logged in as user:", args[0]);
    } catch (error) {
        throw error;
    }
}

async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
    const users = await getUsers();
    for ( let user of users ){
        if ( user.name === cfg.currentUserName ) {
            console.log("*", user.name, "(current)");
            continue;
        } 
        console.log("*", user.name);
    }
}

async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    try {
        const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
        console.log(JSON.stringify(feed));
    } catch(error) {
        console.log(error)
    };
}

async function handlerAddFeed(cmdName: string, ...args: string[]): Promise<void> {
    const user = await getUserByName(cfg.currentUserName);
    if (args.length < 2) {
        throw new Error("addfeed requires a feed name and URL");
    }

    try {
        await addFeed(args[0], args[1], user.id);
    } catch(error) {
        throw error;
    }
    
}

async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
    const feeds = await getFeeds();

    for (let feed of feeds) {
        await printFeed(feed);
    }
}

async function printFeed(feed: Feed) {
    console.log(feed.name);
    console.log(feed.url);
    const user = await getUserById(feed.userId);
    console.log(user.name)
}

async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    await reset();
}

type CommandsRegistry = Record<string, CommandHandler>;

function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error("unknown command: " + cmdName);
    }

    await handler(cmdName, ...args);
}




main();