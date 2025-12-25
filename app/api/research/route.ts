import { NextResponse } from "next/server";

type DuckDuckGoTopic = {
  Text: string;
  FirstURL: string;
  Icon: { URL: string };
  Result: string;
};

type DuckDuckGoResponse = {
  Abstract: string;
  AbstractText: string;
  Heading: string;
  RelatedTopics: Array<DuckDuckGoTopic | { Name: string; Topics: DuckDuckGoTopic[] }>;
};

function flattenTopics(topics: DuckDuckGoResponse["RelatedTopics"]): DuckDuckGoTopic[] {
  const results: DuckDuckGoTopic[] = [];
  for (const topic of topics) {
    if ("Topics" in topic) {
      results.push(...topic.Topics);
    } else {
      results.push(topic);
    }
  }
  return results.filter((topic) => Boolean(topic.Text && topic.FirstURL));
}

function cleanSnippet(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/(\[[^\]]*\])/g, "")
    .trim();
}

function buildInsights(items: ReturnType<typeof flattenTopics>): string[] {
  return items
    .slice(0, 6)
    .map((item) => cleanSnippet(item.Text))
    .filter((item) => item.length > 0);
}

export async function POST(request: Request) {
  try {
    const { query } = (await request.json()) as { query?: string };
    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json({ error: "Consulta inválida" }, { status: 400 });
    }

    const searchUrl = new URL("https://api.duckduckgo.com/");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("t", "agentic-researcher");
    searchUrl.searchParams.set("no_redirect", "1");
    searchUrl.searchParams.set("no_html", "1");

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Agentic-Researcher/1.0"
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Falha ao consultar fonte externa" }, { status: 502 });
    }

    const payload = (await response.json()) as DuckDuckGoResponse;

    const candidates = flattenTopics(payload.RelatedTopics ?? []);
    const items = candidates.slice(0, 10).map((item) => ({
      title: cleanSnippet(item.Text.split(" - ")[0] ?? ""),
      snippet: cleanSnippet(item.Text),
      url: item.FirstURL,
      source: new URL(item.FirstURL).hostname.replace(/^www\./, "")
    }));

    const summary = payload.AbstractText
      ? cleanSnippet(payload.AbstractText)
      : "Levantamento de fontes relacionadas concluído. Confira os detalhes abaixo.";

    return NextResponse.json({
      summary,
      insights: buildInsights(candidates),
      items,
      query,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 });
  }
}
