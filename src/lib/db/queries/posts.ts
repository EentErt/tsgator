import { db } from "..";
import { feed_follows, posts } from "../schema";
import { eq, desc } from "drizzle-orm";
import { User } from "./users";

export async function createPost(title: string, url: string, publishedAt: Date, feedId: string, description?: string) {
    await db.insert(posts).values({
        title: title,
        url: url,
        publishedAt: publishedAt,
        feedId: feedId,
        description: description
    })
}

export async function getPostByUrl(url: string) {
    const [result] = await db.select().from(posts).where(eq(posts.url, url));
    return result;
}

export async function getPostsForUser(user: User, limit: number = 2) {
    const result = await db.select().from(posts).innerJoin(feed_follows, eq(posts.feedId, feed_follows.feedId)).orderBy(desc(posts.publishedAt)).where(eq(feed_follows.userId, user.id)).limit(limit);
    return result;
}