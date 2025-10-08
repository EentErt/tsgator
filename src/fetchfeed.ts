import { XMLParser } from "fast-xml-parser"
import { getNextFeed } from "./lib/db/queries/feeds.js"
import { createPost, getPostByUrl } from "./lib/db/queries/posts.js";

export async function scrapeFeeds() {
    const feed = await getNextFeed();
    if (!feed) {
        throw new Error("no feeds to fetch");
    }

    console.log("Fetching feed:", feed.name, feed.url);
    try {
        const rss = await fetchFeed(feed.url);
        for (let item of rss.channel.item) {
            try {
                if (await getPostByUrl(item.link)) {
                    continue;
                }
                await createPost(item.title, item.link, new Date(item.pubDate), feed.id, item.description);
            } catch(error) {
                console.log("Error creating post:", error);
            }
        }
    } catch(error) {
        throw error;
    }
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const init: RequestInit = {
        headers: {
            "User-Agent": "gator",
        }
    };

    console.log("Fetching feed from", feedURL)
    const feed = await fetch(feedURL, init);
    if (!feed.ok) {
        throw new Error("Feed not found")
    }

    const res = await feed.text()

    const parser = new XMLParser();
    let jObj = parser.parse(res)

    if (!jObj.rss.channel) {
        throw new Error("No rss channel found");
    }
    if (!jObj.rss.channel.title || 
        !jObj.rss.channel.link || 
        !jObj.rss.channel.description
    ) {
        throw new Error("feed is missing elements");
    }

    const feedTitle = jObj.rss.channel.title;
    const feedLink = jObj.rss.channel.link;
    const feedDesc = jObj.rss.channel.description;
    let feedItem: RSSItem[] = [];

    if (Array.isArray(jObj.rss.channel.item)) {
        for (let item of jObj.rss.channel.item) {
            if (!item.title || !item.link || !item.description || !item.pubDate) {
                continue;
            }
            let newItem: RSSItem = {
                title: item.title,
                link: item.link,
                description: item.description,
                pubDate: item.pubDate
            };
            feedItem.push(newItem);
        }
    }

    const feedObj: RSSFeed = {
        channel: {
            title: feedTitle,
            link: feedLink,
            description: feedDesc,
            item: feedItem
        }
    }

    return feedObj
}

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};