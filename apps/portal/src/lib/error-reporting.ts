// Error reporting shim.
//
// In the source project (super-entities-poc) this used Google Cloud Error
// Reporting via @google-cloud/error-reporting. The template ships with a
// no-op shim so it has zero infrastructure dependencies — swap in the real
// integration when you deploy.
//
// To enable Google Cloud Error Reporting:
//   1. npm i @google-cloud/error-reporting
//   2. Replace the body of `reportError` with the SDK call (see
//      docs/BEST_PRACTICES.md → "Error reporting" for the snippet).

export function reportError(error: unknown, context?: string) {
  const prefix = context ? `[${context}] ` : "";

  if (error instanceof Error) {
    console.error(`${prefix}${error.stack || error.message}`);
  } else {
    console.error(`${prefix}${String(error)}`);
  }
}
