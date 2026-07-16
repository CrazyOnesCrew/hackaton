import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
            AI-First <span style={{ color: "var(--color-primary)" }}>Project Template</span>
          </h1>
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
            Web portal. Authentication is backed by the Rails API.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 text-center" style={{ border: "1px solid var(--border)" }}>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity btn-accent"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
