"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

/** Renders text with inline `$...$` and display `$$...$$` KaTeX math. */
export function MathText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const html = katex.renderToString(part.slice(2, -2), {
            throwOnError: false,
            displayMode: true,
          });
          return (
            <div
              key={index}
              className="my-3 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        if (part.startsWith("$") && part.endsWith("$")) {
          const html = katex.renderToString(part.slice(1, -1), {
            throwOnError: false,
            displayMode: false,
          });
          return (
            <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
