import { db } from "..";
import { users, feeds } from "../schema";
import { eq } from "drizzle-orm";
import { getUserById } from "./users";

export type Feed = typeof feeds.$inferSelect;

export async function addFeed(name: string, url: string, user: string) {
    await db.insert(feeds).values({ name: name, url: url, userId: user });
}

export async function getFeeds() {
    const result = await db.select().from(feeds);
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}