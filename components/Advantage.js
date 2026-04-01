"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── TOPIC DEFINITIONS ─── */
const TOPICS = [
  {
    id: "philanthropy",
    label: "Philanthropy",
    color: "#2A6B5E",
    bg: "#E8F5F0",
  },
  {
    id: "engagement",
    label: "Engagement",
    color: "#5B4A9E",
    bg: "#EEEAF7",
  },
  {
    id: "innovation",
    label: "Innovation",
    color: "#B8860B",
    bg: "#FFF8E7",
  },
  {
    id: "awards",
    label: "Awards",
    color: "#C0392B",
    bg: "#FDECEA",
  },
  {
    id: "events",
    label: "Events",
    color: "#2874A6",
    bg: "#E8F0FE",
  },
];

/* ─── KEYWORD HELPERS (fallback when Gemini is unavailable) ─── */
const TOPIC_KEYWORDS = {
  philanthropy: [
    "philanthropy","philanthropic","giving","fundraising","fundraiser",
    "donation","donate","donor","donors","gift","gifts","charitable",
    "endowment","pledge","campaign","capital campaign","annual fund",
    "major gift","planned giving","stewardship","generosity","benefactor",
    "grant","grants","grantmaking",
  ],
  engagement: [
    "alumni","alumnus","alumna","engagement","engage","volunteer",
    "volunteering","mentoring","mentor","networking","community",
    "outreach","reunion","homecoming","connect","connection",
    "involvement","participate","participation","relationship",
    "constituency","stakeholder","advocate","advocacy",
  ],
  innovation: [
    "technology","innovation","innovative","digital","ai",
    "artificial intelligence","data","analytics","system","platform",
    "software","automation","automate","process","transform",
    "transformation","disruption","disruptive","emerging",
    "machine learning","crm","database","tech","modernize","upgrade",
  ],
  awards: [
    "award","awards","recognition","recognize","honor","honours",
    "prize","excellence","achievement","distinguished","ceremony",
    "accolade","winner","recipient","medal","scholarship","fellowship",
    "inducted","hall of fame","laureate","outstanding","celebrate",
  ],
  events: [
    "event","events","conference","conferences","summit","symposium",
    "workshop","webinar","gala","forum","seminar","gathering",
    "convocation","commencement","ceremony","session","meeting",
    "annual meeting","congress","expo","exhibition","registration",
    "attend","speaker","keynote","panel",
  ],
};

function tagArticleByKeywords(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const matched = TOPICS.filter((t) =>
    (TOPIC_KEYWORDS[t.id] || []).some((kw) => text.includes(kw))
  );
  return matched.length > 0 ? matched : [TOPICS[0]];
}

function truncate(text, wordLimit = 60) {
  if (!text) return "";
  const clean = text
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = clean.split(" ");
  if (words.length <= wordLimit) return clean;
  return words.slice(0, wordLimit).join(" ") + "…";
}

/* ─── HELPERS ─── */
function timeSince(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ─── READ TRACKING ─── */
function getReadArticles() {
  try {
    const stored = localStorage.getItem("advantage_read");
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    // Clean out entries older than 30 days to prevent unbounded growth
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const cleaned = {};
    for (const [key, timestamp] of Object.entries(parsed)) {
      if (timestamp > cutoff) cleaned[key] = timestamp;
    }
    return cleaned;
  } catch {
    return {};
  }
}

function markAsRead(articleLink) {
  try {
    const current = getReadArticles();
    current[articleLink] = Date.now();
    localStorage.setItem("advantage_read", JSON.stringify(current));
  } catch {}
}

/* ─── CARD COMPONENT ─── */
function ArticleCard({ article, isActive, index, total, isRead }) {
  const topics = article._topics || [];

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: isRead ? "#F7F6F3" : "#FFFFFF",
          borderRadius: "16px",
          border: isRead ? "1px solid #EDEBE6" : "1px solid #E8E6E1",
          maxWidth: "520px",
          width: "100%",
          padding: "32px 28px",
          boxShadow: isActive
            ? "0 8px 32px rgba(0,0,0,0.06)"
            : "0 2px 8px rgba(0,0,0,0.03)",
          transition: "box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease",
          transform: isActive ? "scale(1)" : "scale(0.97)",
          opacity: isRead ? 0.7 : 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxHeight: "calc(100% - 20px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Read indicator */}
        {isRead && (
          <span
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              fontSize: "10px",
              fontWeight: 600,
              color: "#B0ACA6",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Read
          </span>
        )}
        {/* Source & time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#8C8780",
            }}
          >
            {article.source}
          </span>
          <span style={{ fontSize: "11px", color: "#B0ACA6" }}>
            {timeSince(article.pubDate)}
          </span>
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontSize: "22px",
            fontWeight: 500,
            lineHeight: 1.35,
            color: "#1A1815",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {article.title}
        </h2>

        {/* Topic pills */}
        {topics.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {topics.map((t) => (
              <span
                key={t.id}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "100px",
                  background: t.bg,
                  color: t.color,
                  letterSpacing: "0.02em",
                }}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Summary */}
        <p
          style={{
            fontSize: "14.5px",
            lineHeight: 1.65,
            color: "#4A4640",
            margin: 0,
            flexGrow: 1,
          }}
        >
          {article._summary}
        </p>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "8px",
            borderTop: "1px solid #F0EDE8",
          }}
        >
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#2A6B5E",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Read full article
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
          <span style={{ fontSize: "11px", color: "#C0BBB5" }}>
            {index + 1} / {total}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── LOADING MESSAGES ─── */
const LOADING_MESSAGES = [
  "Fetching feeds…",
  "Reading articles…",
  "Curating relevant content…",
  "Writing summaries…",
  "Almost there…",
];

/* ─── MAIN APP ─── */
export default function Advantage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState(LOADING_MESSAGES[0]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [feedCount, setFeedCount] = useState(0);
  const [readArticles, setReadArticles] = useState({});
  const scrollRef = useRef(null);

  /* ── Load read history from localStorage ── */
  useEffect(() => {
    setReadArticles(getReadArticles());
  }, []);

  /* ── Rotate loading messages ── */
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        const next = Math.min(prev + 1, LOADING_MESSAGES.length - 1);
        setStatusMsg(LOADING_MESSAGES[next]);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  /* ── Fetch RSS then curate with Gemini (with fallback) ── */
  useEffect(() => {
    async function load() {
      setLoading(true);

      let feedData;

      try {
        // Step 1: Fetch articles from RSS feeds
        const feedResp = await fetch("/api/feeds");
        feedData = await feedResp.json();

        if (!feedData.articles || feedData.articles.length === 0) {
          setStatusMsg("No articles found — check feed URLs");
          setLoading(false);
          return;
        }

        const successFeeds = feedData.feeds.filter((f) => f.status === "ok");
        setFeedCount(successFeeds.length);

        // Step 2: Try Gemini for summarization + relevance check
        setLoadingStep(2);
        setStatusMsg(LOADING_MESSAGES[2]);

        const sumResp = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articles: feedData.articles.map((a) => ({
              title: a.title,
              description: a.description,
              source: a.source,
            })),
          }),
        });

        if (!sumResp.ok) {
          // Gemini failed — use fallback
          applyFallback(feedData, successFeeds.length);
          return;
        }

        const sumData = await sumResp.json();

        if (!sumData.results || sumData.results.length === 0) {
          // Gemini returned nothing — use fallback
          applyFallback(feedData, successFeeds.length);
          return;
        }

        // Step 3: Only keep articles that are relevant AND have a summary
        const curated = [];

        sumData.results.forEach((result) => {
          if (!result.relevant) return;
          if (!result.summary || result.summary.trim().length === 0) return;

          const original = feedData.articles[result.originalIndex];
          if (!original) return;

          const geminiTopics = (result.topics || [])
            .map((name) =>
              TOPICS.find(
                (t) => t.label.toLowerCase() === name.toLowerCase()
              )
            )
            .filter(Boolean);

          curated.push({
            ...original,
            _summary: result.summary,
            _topics: geminiTopics.length > 0 ? geminiTopics : [],
          });
        });

        if (curated.length > 0) {
          setArticles(curated);
          setStatusMsg(`${successFeeds.length} sources · AI-curated`);
        } else {
          // Gemini marked everything as irrelevant — use fallback
          applyFallback(feedData, successFeeds.length);
        }
      } catch (err) {
        // Network or other error — try fallback if we have feed data
        if (feedData && feedData.articles && feedData.articles.length > 0) {
          const successFeeds = (feedData.feeds || []).filter((f) => f.status === "ok");
          applyFallback(feedData, successFeeds.length);
        } else {
          setStatusMsg("Something went wrong — please refresh");
          setArticles([]);
        }
      }

      setLoading(false);
    }

    function applyFallback(feedData, feedCount) {
      // Use keyword-based tagging and truncated descriptions
      const fallbackArticles = feedData.articles.map((a) => ({
        ...a,
        _summary: truncate(a.description),
        _topics: tagArticleByKeywords(a.title, a.description),
      }));
      setArticles(fallbackArticles);
      setStatusMsg(`${feedCount} sources · keyword-tagged`);
      setLoading(false);
    }

    load();
  }, []);

  /* ── Filtered articles ── */
  const filtered =
    activeFilter === "all"
      ? articles
      : articles.filter((a) =>
          (a._topics || []).some((t) => t.id === activeFilter)
        );

  /* ── Reset scroll on filter change ── */
  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    // Mark the first article as read
    if (filtered[0] && filtered[0].link) {
      markAsRead(filtered[0].link);
      setReadArticles((prev) => ({
        ...prev,
        [filtered[0].link]: Date.now(),
      }));
    }
  }, [activeFilter, filtered.length]);

  /* ── Track active card on scroll & mark as read ── */
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const c = scrollRef.current;
    const idx = Math.round(c.scrollTop / c.clientHeight);
    setActiveIndex(idx);

    // Mark the current article as read
    if (filtered[idx] && filtered[idx].link) {
      markAsRead(filtered[idx].link);
      setReadArticles((prev) => ({
        ...prev,
        [filtered[idx].link]: Date.now(),
      }));
    }
  }, [filtered]);

  /* ── Keyboard navigation ── */
  const navigateTo = useCallback(
    (dir) => {
      if (!scrollRef.current) return;
      const c = scrollRef.current;
      const newIdx =
        dir === "next"
          ? Math.min(activeIndex + 1, filtered.length - 1)
          : Math.max(activeIndex - 1, 0);
      c.scrollTo({ top: newIdx * c.clientHeight, behavior: "smooth" });
      setActiveIndex(newIdx);

      // Mark as read
      if (filtered[newIdx] && filtered[newIdx].link) {
        markAsRead(filtered[newIdx].link);
        setReadArticles((prev) => ({
          ...prev,
          [filtered[newIdx].link]: Date.now(),
        }));
      }
    },
    [activeIndex, filtered]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        navigateTo("next");
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        navigateTo("prev");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigateTo]);

  /* ─── RENDER ─── */
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: "#FAF9F6",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Header */}
      <header style={{ padding: "20px 20px 0", textAlign: "center", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "4px",
          }}
        >
          <img
            src="/logo.png"
            alt="Advantage"
            style={{
              height: "40px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "#8C8780",
            margin: "2px 0 0",
            letterSpacing: "0.04em",
          }}
        >
          Curated insights for university advancement
        </p>
      </header>

      {/* Topic filters */}
      <nav
        style={{
          padding: "14px 16px 10px",
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          flexShrink: 0,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <FilterPill
          active={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
          label="All"
        />
        {TOPICS.map((t) => (
          <FilterPill
            key={t.id}
            active={activeFilter === t.id}
            onClick={() => setActiveFilter(t.id)}
            label={t.label}
            color={t.color}
            bg={t.bg}
          />
        ))}
      </nav>

      {/* Status bar */}
      <div style={{ textAlign: "center", padding: "0 16px 6px", flexShrink: 0 }}>
        <span style={{ fontSize: "11px", color: "#B0ACA6" }}>
          {loading
            ? statusMsg
            : (() => {
                const unreadCount = filtered.filter((a) => !readArticles[a.link]).length;
                const unreadLabel = unreadCount > 0 ? ` · ${unreadCount} new` : "";
                return `${filtered.length} article${filtered.length !== 1 ? "s" : ""}${unreadLabel} · ${statusMsg}`;
              })()}
        </span>
      </div>

      {/* Cards */}
      {loading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid #E8E6E1",
              borderTopColor: "#2A6B5E",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#4A4640", marginBottom: "4px" }}>
              {statusMsg}
            </p>
            <p style={{ fontSize: "11px", color: "#B0ACA6" }}>
              This usually takes 15–30 seconds
            </p>
          </div>
          {/* Progress dots */}
          <div style={{ display: "flex", gap: "8px" }}>
            {LOADING_MESSAGES.map((_, i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: i <= loadingStep ? "#2A6B5E" : "#E8E6E1",
                  transition: "background 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "#8C8780" }}>
            No articles found for this topic.
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "scroll",
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {filtered.map((article, i) => (
            <div
              key={`${article.link}-${i}`}
              style={{
                height: "100%",
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
              }}
            >
              <ArticleCard
                article={article}
                isActive={i === activeIndex}
                isRead={!!readArticles[article.link]}
                index={i}
                total={filtered.length}
              />
            </div>
          ))}
        </div>
      )}

      {/* Side dots */}
      {!loading && filtered.length > 1 && (
        <div
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            zIndex: 10,
          }}
        >
          {filtered.slice(0, 20).map((article, i) => {
            const dotIsRead = !!readArticles[article.link];
            return (
              <div
                key={i}
                onClick={() => {
                  if (!scrollRef.current) return;
                  scrollRef.current.scrollTo({
                    top: i * scrollRef.current.clientHeight,
                    behavior: "smooth",
                  });
                  setActiveIndex(i);
                  if (article.link) {
                    markAsRead(article.link);
                    setReadArticles((prev) => ({
                      ...prev,
                      [article.link]: Date.now(),
                    }));
                  }
                }}
                style={{
                  width: i === activeIndex ? "8px" : "5px",
                  height: i === activeIndex ? "8px" : "5px",
                  borderRadius: "50%",
                  background: i === activeIndex
                    ? "#2A6B5E"
                    : dotIsRead
                      ? "#E8E6E1"
                      : "#D0CCC6",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Swipe hint */}
      {!loading && filtered.length > 1 && activeIndex === 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            animation: "bounce 2s ease infinite",
            opacity: 0.5,
          }}
        >
          <style>
            {`@keyframes bounce {
              0%, 100% { transform: translateX(-50%) translateY(0); }
              50% { transform: translateX(-50%) translateY(-8px); }
            }`}
          </style>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8C8780"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
          <span style={{ fontSize: "10px", color: "#8C8780" }}>Swipe up</span>
        </div>
      )}
    </div>
  );
}

/* ─── FILTER PILL ─── */
function FilterPill({ active, onClick, label, color, bg }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: "12px",
        fontWeight: active ? 700 : 500,
        padding: "7px 16px",
        borderRadius: "100px",
        border: active
          ? `1.5px solid ${color || "#1A1815"}`
          : "1px solid #DDD9D3",
        background: active ? (bg || "#1A1815") : "transparent",
        color: active ? (color || "#FFFFFF") : "#6B6660",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {label}
    </button>
  );
}
