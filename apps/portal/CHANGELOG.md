# Changelog

All notable changes to the portal are documented here (Keep a Changelog format).
The in-app "What's new" modal is driven by `src/lib/changelog.ts`; keep both in
sync with `package.json`'s version.

## [1.0.0] - 2026-07-13

### Added
- Initial version of the AI-First Project Template portal: Next.js 16, React 19,
  Rails-backed authentication, and a role-scoped shell (`/dashboard` for any
  authenticated user, `/admin` for the `admin` role).
