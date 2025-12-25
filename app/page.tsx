import { SearchPanel } from "./components/SearchPanel";

export default function Page() {
  return (
    <main style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <span
          style={{
            padding: "0.35rem 0.75rem",
            borderRadius: "999px",
            background: "rgba(45, 127, 249, 0.12)",
            color: "var(--primary)",
            fontWeight: 600,
            width: "fit-content",
            fontSize: "0.85rem"
          }}
        >
          Agente de Pesquisa Inteligente
        </span>
        <h1 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.1 }}>
          Descubra insights confiáveis em minutos
        </h1>
        <p style={{ maxWidth: "720px", lineHeight: 1.75, fontSize: "1.05rem", opacity: 0.85 }}>
          Combine pesquisas na web com síntese contextual. Este agente especializado organiza descobertas,
          apresenta evidências relevantes e sugere próximos passos para aprofundar o conhecimento em qualquer
          tema.
        </p>
      </header>
      <SearchPanel />
    </main>
  );
}
