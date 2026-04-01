import { GoogleGenerativeAI } from "@google/generative-ai";

const TOPICS = [
  "Philanthropy (giving, fundraising, donations, donor relations, endowments, grants)",
  "Engagement (alumni engagement, volunteer activities, mentoring, networking, community outreach)",
  "Innovation (technology, AI, data analytics, digital transformation, systems, processes)",
  "Awards (recognition, honors, prizes, excellence, achievements, ceremonies)",
  "Events (conferences, summits, workshops, webinars, galas, forums, seminars)",
];

// Limit articles sent to Gemini to stay within free tier (15 requests/min)
const MAX_ARTICLES = 50;
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES_MS = 5000;

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return Response.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { articles } = await request.json();

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return Response.json({ error: "No articles provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Limit to most recent articles to stay within rate limits
    // With 50 articles at batch size 10 = only 5 API calls
    const limitedArticles = articles.slice(0, MAX_ARTICLES);
    const results = [];

    for (let i = 0; i < limitedArticles.length; i += BATCH_SIZE) {
      const batch = limitedArticles.slice(i, i + BATCH_SIZE);

      const prompt = `You are a content curator for university advancement professionals (people who work in fundraising, alumni relations, donor engagement, and institutional advancement at universities and colleges).

For each article below, you must:

1. Assess RELEVANCE: Is this article relevant to university advancement professionals? It must be about one or more of: philanthropy, fundraising, donor relations, alumni engagement, higher education policy, university operations, institutional advancement, nonprofit management, or related topics that directly impact university advancement work. If the article is a placeholder page, navigation page, login page, subscription prompt, generic advertisement, or completely unrelated to university advancement or philanthropy — mark it as NOT relevant.

2. If relevant, write a clear, informative SUMMARY in 50-60 words that highlights why it matters to university advancement professionals.

3. If relevant, assign one or more TOPIC TAGS from this list: ${TOPICS.map((t) => t.split(" (")[0]).join(", ")}

Respond ONLY with a valid JSON array. No markdown, no backticks, no extra text.
Each element must have:
- "index" (number)
- "relevant" (boolean — true if the article is relevant to university advancement, false otherwise)
- "summary" (string — the summary if relevant, empty string if not)
- "topics" (array of strings — topic tags if relevant, empty array if not)

Articles:
${batch
  .map(
    (a, idx) => `
[Article ${i + idx}]
Title: ${a.title}
Content: ${(a.description || "").substring(0, 800)}
Source: ${a.source}
`
  )
  .join("\n")}

Respond with JSON array only:`;

      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean and parse the response
        const cleaned = text
          .replace(/```json\s*/gi, "")
          .replace(/```\s*/g, "")
          .trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed)) {
          parsed.forEach((item, idx) => {
            results.push({
              originalIndex: i + idx,
              relevant: item.relevant === true,
              summary: item.summary || "",
              topics: item.topics || [],
            });
          });
        }
      } catch (batchErr) {
        // If a batch fails, mark all as not relevant
        batch.forEach((_, idx) => {
          results.push({
            originalIndex: i + idx,
            relevant: false,
            summary: "",
            topics: [],
          });
        });
      }

      // Wait between batches to respect the 15 requests/min free tier limit
      if (i + BATCH_SIZE < limitedArticles.length) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
      }
    }

    return Response.json({ results });
  } catch (err) {
    return Response.json(
      { error: "Summarization failed: " + err.message },
      { status: 500 }
    );
  }
}
