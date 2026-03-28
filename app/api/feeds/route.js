import RSSParser from "rss-parser";

const FEEDS = [
  { name: "Chronicle of Philanthropy", url: "https://www.philanthropy.com/feed" },
  { name: "Inside Higher Ed", url: "https://www.insidehighered.com/feed" },
  { name: "University Business", url: "https://universitybusiness.com/feed/" },
  { name: "Inside Philanthropy", url: "https://www.insidephilanthropy.com/home?format=rss" },
  { name: "CCS Fundraising", url: "https://www.ccsfundraising.com/insights/feed/" },
  { name: "CASE", url: "https://www.case.org/feed" },
  { name: "Annual Giving Network", url: "https://www.annualgivingnetwork.com/feed/" },
  { name: "F&P Magazine", url: "https://fandp.com.au/feed/" },
];

export const revalidate = 3600; // Cache results for 1 hour

export async function GET() {
  const parser = new RSSParser({
    timeout: 10000,
    headers: {
      "User-Agent": "Advantage/1.0 (News Aggregator)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  const allArticles = [];
  const feedResults = [];

  const promises = FEEDS.map(async (feed) => {
    try {
      const data = await parser.parseURL(feed.url);
      const items = (data.items || []).slice(0, 15).map((item) => ({
        title: item.title || "",
        description: item.contentSnippet || item.content || item.summary || "",
        link: item.link || "",
        pubDate: item.pubDate || item.isoDate || "",
        source: feed.name,
      }));
      allArticles.push(...items);
      feedResults.push({ name: feed.name, status: "ok", count: items.length });
    } catch (err) {
      feedResults.push({ name: feed.name, status: "error", error: err.message });
    }
  });

  await Promise.allSettled(promises);

  // Sort by date, newest first
  allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return Response.json({
    articles: allArticles,
    feeds: feedResults,
    fetchedAt: new Date().toISOString(),
  });
}
