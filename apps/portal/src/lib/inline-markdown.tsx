import type { ReactNode } from "react";

// Tiny inline-markdown renderer — deliberately dependency-free so it adds zero
// bundle weight and carries no React-19 / Next-16 peer-version risk. Supports
// the subset used in changelog lines:
//   **bold**   _italic_   `code`   [text](url)
// Container tokens (bold/italic/link) recurse, so nesting works (e.g. **`x`**).

const TOKEN =
  /(\*\*([^*]+?)\*\*)|(`([^`]+?)`)|(\[([^\]]+?)\]\((https?:\/\/[^)\s]+)\))|(_([^_]+?)_)/;

export function renderInlineMarkdown(text: string): ReactNode {
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length) {
    const m = TOKEN.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));

    if (m[1]) {
      out.push(
        <strong key={key++} style={{ color: "var(--fg)", fontWeight: 600 }}>
          {renderInlineMarkdown(m[2])}
        </strong>,
      );
    } else if (m[3]) {
      out.push(
        <code
          key={key++}
          className="rounded px-1 py-0.5 font-mono text-[0.82em]"
          style={{ background: "var(--bg-subtle)", color: "#5b5fef", border: "1px solid var(--border)" }}
        >
          {m[4]}
        </code>,
      );
    } else if (m[5]) {
      out.push(
        <a
          key={key++}
          href={m[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline decoration-from-font underline-offset-2"
          style={{ color: "#5b5fef" }}
        >
          {renderInlineMarkdown(m[6])}
        </a>,
      );
    } else if (m[8]) {
      out.push(
        <em key={key++} style={{ color: "var(--fg-muted)" }}>
          {renderInlineMarkdown(m[9])}
        </em>,
      );
    }

    rest = rest.slice(m.index + m[0].length);
  }

  return out;
}
