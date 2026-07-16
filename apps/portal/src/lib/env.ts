// Runtime deploy target — surfaced in the sidebar version widget so it's always
// obvious whether the app you're looking at points at dev / staging / prod.
//
// Set NEXT_PUBLIC_APP_ENV at build time (it's baked into the client bundle, like
// all NEXT_PUBLIC_* vars). When unset, we infer from NODE_ENV.

export type AppEnv = "development" | "staging" | "production";

export const APP_ENV: AppEnv = (() => {
  const raw = (process.env.NEXT_PUBLIC_APP_ENV ?? "").toLowerCase();
  if (raw === "production" || raw === "prod") return "production";
  if (raw === "staging" || raw === "stage" || raw === "stg") return "staging";
  if (raw === "development" || raw === "dev") return "development";
  return process.env.NODE_ENV === "production" ? "production" : "development";
})();

export const ENV_META: Record<AppEnv, { label: string; short: string; color: string }> = {
  development: { label: "Development", short: "DEV", color: "#f59e0b" },
  staging: { label: "Staging", short: "STG", color: "#6366f1" },
  production: { label: "Production", short: "PROD", color: "#10b981" },
};
