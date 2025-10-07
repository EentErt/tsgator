import { db } from "..";
import { users, feeds, feed_follows } from "../schema";
import { eq } from "drizzle-orm";
import { getUserById } from "./users";
import { getFeedByUrl } from "./feeds";

export async function createFeedFollow(userId: string, feedId: string) {
    const [result] = await db.insert(feed_follows).values({ userId: userId, feedId: feedId }).returning();
    return result;
}

export async function getFeedFollowsByUserId(userId: string) {
    const result = await db.select().from(feed_follows).where(eq(users.id, userId))
        .innerJoin(users, eq(feed_follows.userId, users.id))
        .innerJoin(feeds, eq(feed_follows.feedId, feeds.id));
    return result;
}

export async function deleteFeedFollow(userId: string, feedId: string) {
    await db.delete(feed_follows).where((eq(feed_follows.userId, userId) && eq(feed_follows.feedId, feedId)));
}