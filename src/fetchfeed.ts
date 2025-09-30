import { XMLParser } from "fast-xml-parser"

export async function fetchFeed(feedURL: string) {
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