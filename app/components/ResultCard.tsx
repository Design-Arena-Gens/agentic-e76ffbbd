"use client";

import { useState } from "react";

export interface ResearchItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

interface ResultCardProps {
  item: ResearchItem;
}

export function ResultCard({ item }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = item.snippet.length > 280;
  const text = shouldTruncate && !expanded ? `${item.snippet.slice(0, 280)}…` : item.snippet;

  return (
    <article
      style={{
        background: "var(--secondary)",
        borderRadius: "16px",
        padding: "1.25rem",
        border: `1px solid var(--border)`
      }}
    >
      <header style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "var(--primary)"
          }}
        >
          {item.title}
        </a>
        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>{item.source}</span>
      </header>
      <p style={{ marginTop: "0.75rem", lineHeight: 1.6 }}>{text}</p>
      {shouldTruncate && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: "0.5rem",
            background: "transparent",
            border: "none",
            color: "var(--primary)",
            fontWeight: 500
          }}
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </article>
  );
}
