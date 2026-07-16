# Mobile — AI-First Project Template

Expo / React Native starter app for the template. Generated from the
[Obytes React Native template](https://github.com/obytes/react-native-template-obytes)
and trimmed to a minimal, generic base: Home, an AI Assistant placeholder,
and an auth-aware Profile.

Built with Expo SDK 54 and React Native 0.81. It consumes the Rails API
(`apps/api`) for authentication.

## Stack

- Expo SDK 54, React Native 0.81, Expo Router 6
- TypeScript (strict)
- NativeWind / Uniwind (Tailwind for RN)
- Zustand (client state), React Query (server state)
- TanStack Form + Zod (forms), MMKV (storage)
- Jest + React Testing Library

## Structure

```
src/
├── app/                # Expo Router routes
│   ├── (app)/(tabs)/   # Home, Assistant, Profile tabs
│   ├── login / register
├── features/           # auth, profile, home, ai-assistant, settings
├── components/ui/      # generic UI primitives
├── lib/                # api client, auth, i18n, hooks, storage
└── translations/       # i18n (en, ar)
```

`features/*` are examples — add your own feature folders alongside them.

## Setup

```bash
cd apps/mobile
pnpm install
pnpm start            # start the dev server
pnpm ios              # or: pnpm android
```

Point the app at your API with `EXPO_PUBLIC_API_URL` (defaults to
`http://127.0.0.1:3000` in development). App identity (name, bundle IDs,
scheme) lives in `env.ts` — customize it before shipping.

## Quality

```bash
pnpm type-check       # tsc --noemit
pnpm lint             # eslint
pnpm test             # jest
pnpm check-all        # all of the above
```

## Notes

- Use absolute imports (`@/...`), never relative.
- Follow the feature-based structure under `src/features/`.
- The AI Assistant screen is a placeholder and makes no live model calls —
  wire it to your backend (which keeps provider calls behind the API).
- Do not edit `ios/` or `android/` directly; use Expo config plugins.
