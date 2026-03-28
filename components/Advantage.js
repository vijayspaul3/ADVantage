"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── TOPIC DEFINITIONS ─── */
const TOPICS = [
  {
    id: "philanthropy",
    label: "Philanthropy",
    color: "#2A6B5E",
    bg: "#E8F5F0",
    keywords: [
      "philanthropy","philanthropic","giving","fundraising","fundraiser",
      "donation","donate","donor","donors","gift","gifts","charitable",
      "endowment","pledge","campaign","capital campaign","annual fund",
      "major gift","planned giving","stewardship","gratitude","generosity",
      "benefactor","grant","grants","grantmaking",
    ],
  },
  {
    id: "engagement",
    label: "Engagement",
    color: "#5B4A9E",
    bg: "#EEEAF7",
    keywords: [
      "alumni","alumnus","alumna","engagement","engage","volunteer",
      "volunteering","mentoring","mentor","networking","community",
      "outreach","reunion","homecoming","connect","connection",
      "involvement","participate","participation","relationship",
      "constituency","stakeholder","advocate","advocacy",
    ],
  },
  {
    id: "innovation",
    label: "Innovation",
    color: "#B8860B",
    bg: "#FFF8E7",
    keywords: [
      "technology","innovation","innovative","digital","ai",
      "artificial intelligence","data","analytics","system","platform",
      "software","automation","automate","process","transform",
      "transformation","disruption","disruptive","startup","emerging",
      "machine learning","crm","database","tech","modernize","upgrade",
    ],
  },
  {
    id: "awards",
    label: "Awards",
    color: "#C0392B",
    bg: "#FDECEA",
    keywords: [
      "award","awards","recognition","recognize","honor","honours",
      "prize","excellence","achievement","distinguished","ceremony",
      "accolade","winner","recipient","medal","scholarship","fellowship",
      "inducted","hall of fame","laureate","outstanding","celebrate",
    ],
  },
  {
    id: "events",
    label: "Events",
    color: "#2874A6",
    bg: "#E8F0FE",
    keywords: [
      "event","events","conference","conferences","summit","symposium",
      "workshop","webinar","gala","forum","seminar","gathering",
      "convocation","commencement","ceremony","session","meeting",
      "annual meeting","congress","expo","exhibition","registration",
      "attend","speaker","keynote","panel",
    ],
  },
];

/* ─── HELPERS ─── */
function tagArticle(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const matched = TOPICS.filter((t) =>
    t.keywords.some((kw) => text.includes(kw))
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

/* ─── CARD COMPONENT ─── */
function ArticleCard({ article, isActive, index, total }) {
  const topics = article._topics || tagArticle(article.title, article.description);
  const summary = article._summary || truncate(article.description);

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
          background: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E8E6E1",
          maxWidth: "520px",
          width: "100%",
          padding: "32px 28px",
          boxShadow: isActive
            ? "0 8px 32px rgba(0,0,0,0.06)"
            : "0 2px 8px rgba(0,0,0,0.03)",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          transform: isActive ? "scale(1)" : "scale(0.97)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxHeight: "calc(100% - 20px)",
          overflow: "hidden",
        }}
      >
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
          {summary}
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

/* ─── MAIN APP ─── */
export default function Advantage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Fetching feeds…");
  const scrollRef = useRef(null);

  /* ── Fetch RSS via our API route ── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      setStatusMsg("Fetching feeds…");

      try {
        const resp = await fetch("/api/feeds");
        const data = await resp.json();

        if (data.articles && data.articles.length > 0) {
          const successFeeds = data.feeds.filter((f) => f.status === "ok");
          setStatusMsg(`${successFeeds.length} sources loaded`);

          // Set articles with fallback keyword tagging first
          const tagged = data.articles.map((a) => ({
            ...a,
            _topics: tagArticle(a.title, a.description),
            _summary: truncate(a.description),
          }));
          setArticles(tagged);
          setLoading(false);

          // Then enhance with Gemini in the background
          enhanceWithGemini(tagged);
        } else {
          setStatusMsg("No articles found — check feed URLs");
          setArticles([]);
          setLoading(false);
        }
      } catch (err) {
        setStatusMsg("Could not fetch feeds");
        setArticles([]);
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ── Gemini enhancement (runs in background) ── */
  async function enhanceWithGemini(articleList) {
    setSummarizing(true);
    try {
      const resp = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articles: articleList.map((a) => ({
            title: a.title,
            description: a.description,
            source: a.source,
          })),
        }),
      });

      if (!resp.ok) {
        setSummarizing(false);
        return;
      }

      const data = await resp.json();

      if (data.results && data.results.length > 0) {
        setArticles((prev) =>
          prev.map((article, idx) => {
            const enhancement = data.results.find(
              (r) => r.originalIndex === idx
            );
            if (!enhancement) return article;

            const geminiTopics = (enhancement.topics || [])
              .map((name) =>
                TOPICS.find(
                  (t) => t.label.toLowerCase() === name.toLowerCase()
                )
              )
              .filter(Boolean);

            return {
              ...article,
              _summary: enhancement.summary || article._summary,
              _topics:
                geminiTopics.length > 0 ? geminiTopics : article._topics,
            };
          })
        );
        setStatusMsg((prev) => prev + " · AI-enhanced");
      }
    } catch (err) {
      // Gemini enhancement is optional — keyword tagging still works
      console.warn("Gemini enhancement skipped:", err.message);
    }
    setSummarizing(false);
  }

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
  }, [activeFilter]);

  /* ── Track active card on scroll ── */
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const c = scrollRef.current;
    setActiveIndex(Math.round(c.scrollTop / c.clientHeight));
  }, []);

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
    },
    [activeIndex, filtered.length]
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
            : `${filtered.length} article${filtered.length !== 1 ? "s" : ""} · ${statusMsg}`}
          {summarizing && " · Enhancing with AI…"}
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
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid #E8E6E1",
              borderTopColor: "#2A6B5E",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: "13px", color: "#8C8780" }}>{statusMsg}</p>
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
          {filtered.slice(0, 20).map((_, i) => (
            <div
              key={i}
              onClick={() => {
                if (!scrollRef.current) return;
                scrollRef.current.scrollTo({
                  top: i * scrollRef.current.clientHeight,
                  behavior: "smooth",
                });
                setActiveIndex(i);
              }}
              style={{
                width: i === activeIndex ? "8px" : "5px",
                height: i === activeIndex ? "8px" : "5px",
                borderRadius: "50%",
                background: i === activeIndex ? "#2A6B5E" : "#D0CCC6",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            />
          ))}
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
