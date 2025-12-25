"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ResultCard, type ResearchItem } from "./ResultCard";

type ResearchStatus = "idle" | "loading" | "done" | "error";

interface ResearchResponse {
  summary: string;
  insights: string[];
  items: ResearchItem[];
  query: string;
}

interface HistoryItem extends ResearchResponse {
  timestamp: number;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short"
  }).format(timestamp);
}

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ResearchStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [current, setCurrent] = useState<ResearchResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const disableSubmit = useMemo(() => query.trim().length < 3 || status === "loading", [query, status]);

  useEffect(() => {
    if (history.length === 0 || !current) {
      return;
    }
    const latest = history[0];
    if (latest.query === current.query) {
      setHistory((prev) => [{ ...current, timestamp: Date.now() }, ...prev.slice(1)]);
    } else {
      setHistory((prev) => [{ ...current, timestamp: Date.now() }, ...prev]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  async function runResearch(input: string) {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input })
      });

      if (!response.ok) {
        throw new Error("Falha ao consultar fontes externas");
      }

      const payload = (await response.json()) as ResearchResponse;
      setCurrent(payload);
      setStatus("done");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível concluir a pesquisa no momento."
      );
      setStatus("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setErrorMessage("Digite pelo menos 3 caracteres para pesquisar.");
      return;
    }
    runResearch(trimmed);
  }

  return (
    <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
      <section style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "var(--secondary)",
            borderRadius: "18px",
            padding: "1.5rem",
            border: `1px solid var(--border)`
          }}
        >
          <label htmlFor="query" style={{ display: "block", fontWeight: 600, marginBottom: "0.75rem" }}>
            O que você deseja investigar?
          </label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input
              id="query"
              name="query"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex: Tendências de IA generativa na educação"
              style={{
                flex: 1,
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                border: `1px solid var(--border)`,
                background: "white",
                color: "var(--foreground)"
              }}
            />
            <button
              type="submit"
              disabled={disableSubmit}
              style={{
                minWidth: "140px",
                borderRadius: "12px",
                border: "none",
                background: disableSubmit ? "#9aa5c7" : "var(--primary)",
                color: "white",
                fontWeight: 600
              }}
            >
              {status === "loading" ? "Pesquisando…" : "Pesquisar"}
            </button>
          </div>
          <p style={{ marginTop: "0.6rem", fontSize: "0.9rem", opacity: 0.75 }}>
            O agente analisa múltiplas fontes públicas, organiza os principais destaques e sugere próximos passos.
          </p>
        </form>

        {status === "error" && errorMessage && (
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "12px",
              border: `1px solid var(--danger)`,
              background: "rgba(214, 69, 80, 0.12)",
              color: "var(--danger)"
            }}
          >
            {errorMessage}
          </div>
        )}

        {current && (
          <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div
              style={{
                borderRadius: "18px",
                border: `1px solid var(--border)`,
                background: "var(--secondary)",
                padding: "1.5rem"
              }}
            >
              <header style={{ marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Visão executiva</h2>
                <p style={{ marginTop: "0.5rem", lineHeight: 1.6 }}>{current.summary}</p>
              </header>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Principais insights</h3>
                <ul style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
                  {current.insights.map((insight, index) => (
                    <li key={index} style={{ lineHeight: 1.5 }}>
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              {current.items.map((item) => (
                <ResultCard key={item.url} item={item} />
              ))}
            </div>
          </section>
        )}
      </section>

      <aside
        style={{
          width: "280px",
          position: "sticky",
          top: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}
      >
        <div
          style={{
            borderRadius: "18px",
            border: `1px solid var(--border)`,
            background: "var(--secondary)",
            padding: "1.2rem"
          }}
        >
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Histórico de consultas</h3>
          <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "0.35rem" }}>
            Clique para reabrir um resultado anterior.
          </p>
        </div>
        {history.length === 0 && (
          <p style={{ fontSize: "0.9rem", opacity: 0.6 }}>
            Acompanhe aqui as investigações realizadas. As consultas mais recentes aparecem no topo.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {history.map((item) => (
            <button
              key={`${item.timestamp}-${item.query}`}
              onClick={() => setCurrent(item)}
              style={{
                textAlign: "left",
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                border: `1px solid var(--border)`,
                background:
                  current?.query === item.query ? "rgba(45, 127, 249, 0.12)" : "var(--secondary)",
                color: "var(--foreground)"
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{item.query}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.65 }}>{formatDate(item.timestamp)}</div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
