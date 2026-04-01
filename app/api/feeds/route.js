import RSSParser from "rss-parser";

const FEEDS = [
  { name: "Chronicle of Philanthropy", url: "https://www.philanthropy.com/feed/", domain: "philanthropy.com" },
  { name: "Inside Higher Ed", url: "https://rss.app/feeds/4h9FUHQBWF9cEsTe.xml", domain: "insidehighered.com" },
  { name: "University Business", url: "https://universitybusiness.com/feed/", domain: "universitybusiness.com" },
  { name: "Inside Philanthropy", url: "https://www.insidephilanthropy.com/home?format=rss", domain: "insidephilanthropy.com" },
  { name: "CASE", url: "https://rss.app/feeds/V87InOfgvGACpCS1.xml", domain: "case.org" },
  { name: "CCS Fundraising", url: "https://www.ccsfundraising.com/insights/feed/", domain: "ccsfundraising.com" },
  { name: "Annual Giving Network", url: "https://www.annualgivingnetwork.com/feed/", domain: "annualgivingnetwork.com" },
  { name: "F&P Magazine", url: "https://rss.app/feeds/QnbheyDbIBY7BNDN.xml", domain: "fandp.com.au" },
  { name: "Philanthropy Australia", url: "https://www.philanthropy.org.au/news-and-stories/?format=rss", domain: "philanthropy.org.au" },
  { name: "Times Higher Education", url: "https://rss.app/feeds/1bxxKLdB6jjvspDy.xml", domain: "timeshighereducation.com" }
];

// Titles that indicate placeholder/non-article pages
const PLACEHOLDER_TITLE_PATTERNS = [
  /^home$/i, /^about/i, /^contact/i, /^subscribe/i, /^sign up/i,
  /^log\s?in/i, /^register/i, /^privacy/i, /^terms/i, /^cookie/i,
  /^disclaimer/i, /^advertise/i, /^careers/i, /^jobs$/i, /^faq/i,
  /^search$/i, /^archive/i, /^tag:/i, /^category:/i, /^page \d/i,
  /^untitled/i, /^test/i, /^sample/i, /^draft/i, /^placeholder/i,
  /^menu$/i, /^navigation$/i, /^sidebar$/i, /^footer$/i, /^header$/i,
  /^404/i, /^error/i, /^not found/i, /^coming soon/i,
  /^sponsored content$/i, /^advertisement$/i, /^partner content$/i,
];

const MIN_DESCRIPTION_WORDS = 20;

function isPlaceholderPage(title, description) {
  const trimmedTitle = (title || "").trim();

  // No title = not a real article
  if (!trimmedTitle) return true;

  // Title matches a known placeholder pattern
  if (PLACEHOLDER_TITLE_PATTERNS.some((p) => p.test(trimmedTitle))) return true;

  // Description is too short or empty — likely not a real article
  const cleanDesc = (description || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = cleanDesc ? cleanDesc.split(" ").length : 0;
  if (wordCount < MIN_DESCRIPTION_WORDS) return true;

  return false;
}

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
      const items = (data.items || [])
        .slice(0, 15)
        .map((item) => ({
          title: item.title || "",
          description: item.contentSnippet || item.content || item.summary || "",
          link: item.link || "",
          pubDate: item.pubDate || item.isoDate || "",
          source: feed.name,
        }))
        .filter((item) => !isPlaceholderPage(item.title, item.description));

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
