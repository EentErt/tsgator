import { setUser, readConfig } from "./config.js";
import { getUserByName, createUser, getUsers, getUserById, reset, User } from "./lib/db/queries/users.js";
import { addFeed, getFeedByUrl, getFeeds, Feed } from "./lib/db/queries/feeds.js";
import { createFeedFollow, getFeedFollowsByUserId } from "./lib/db/queries/feed_follows.js";
import { fetchFeed } from "./fetchfeed.js";
import { UserCommandHandler } from "./middleware.js";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
    if (args[0] === undefined) {
        throw new Error("username required"); 
    }

    console.log("Checking if user exists")
    let existing = await getUserByName(args[0]);
    if (existing === undefined) {
        throw new Error(`No user with name ${args[0]} exists`)
    }

    const cfg = readConfig();
    setUser(cfg, args[0]);
    console.log("Logged in as", args[0]);
}

export async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
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
        const cfg = readConfig();
        let user = await createUser(args[0]);
        setUser(cfg, user.name);
        console.log("Created and logged in as user:", args[0]);
    } catch (error) {
        throw error;
    }
}

export async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
    const users = await getUsers();
    for ( let user of users ){
        const cfg = readConfig();
        if ( user.name === cfg.currentUserName ) {
            console.log("*", user.name, "(current)");
            continue;
        } 
        console.log("*", user.name);
    }
}

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    try {
        const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
        console.log(JSON.stringify(feed));
    } catch(error) {
        console.log(error)
    };
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length < 2) {
        throw new Error("addfeed requires a feed name and URL");
    }

    try {
        await addFeed(args[0], args[1], user.id);
        await createFeedFollow(user.id, (await getFeedByUrl(args[1])).id);
    } catch(error) {
        throw error;
    }
    
}

export async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
    const feeds = await getFeeds();

    for (let feed of feeds) {
        await printFeed(feed);
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if (args.length < 1) {
        throw new Error("follow requires a feed URL");
    }

    const feed = await getFeedByUrl(args[0]);

    try {
        await createFeedFollow(user.id, feed.id);
        console.log(user.name, "is now following", feed.name);
    } catch(error) {
        throw error;
    }
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]): Promise<void> {
    const follows = await getFeedFollowsByUserId(user.id);

    for (let follow of follows) {
        await printFeed(follow.feeds);
    }
}

async function printFeed(feed: Feed) {
    console.log(feed.name);
    console.log(feed.url);
    const user = await getUserById(feed.userId);
    console.log(user.name)
}

export async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
    await reset();
}

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
    const handler = registry[cmdName];
    if (!handler) {
        throw new Error("unknown command: " + cmdName);
    }

    await handler(cmdName, ...args);
}

