// Client-safe types for shared models.
// The portal has no local database — `User` mirrors the identity Rails
// returns from GET /api/v1/profile (see src/lib/rails.ts's `RailsUser`).

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "member" | "auxiliary";
}
