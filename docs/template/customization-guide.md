# Customization Guide

How to turn this template into your own project. Work on a branch, change names
first, then build features with Spec Kit.

## 1. Rename & rebrand checklist

### Repo root
- [ ] `package.json` `name` (`ai-first-project-template` → your slug)
- [ ] `README.md`, `docs/*` — project name and copy
- [ ] `AGENTS.md` / `CLAUDE.md` — usually fine as-is; adjust if your rules differ

### API (`apps/api`)
- [ ] `config/application.rb` — `module TemplateApi` → your module
- [ ] `config/database.yml` — `template_development` / `template_test` DB names
- [ ] `config/deploy.yml`, `Dockerfile` — `template_api` service/image names
- [ ] `.env.example` — DB names, `APP_NAME`
- [ ] `db/seeds.rb` — replace demo users
- [ ] `User::ROLES` — adjust roles for your product

### Mobile (`apps/mobile`)
- [ ] `env.ts` — `NAME`, `BUNDLE_IDS`, `PACKAGES`, `SCHEMES`
      (`com.example.template` → your identifiers)
- [ ] `package.json` `name`
- [ ] `app.config.ts` — `slug`, icons, splash
- [ ] `src/global.css` and `src/components/ui/colors.js` — theme tokens/colors
- [ ] `src/translations/*` — your copy

### Portal (`apps/portal`)
- [ ] `package.json` `name` and `version`
- [ ] `src/app/layout.tsx` — metadata (title/description)
- [ ] `src/app/page.tsx`, `components/layout/LoginScreen.tsx`,
      `components/layout/Sidebar.tsx` — brand text
- [ ] `src/app/globals.css` — design tokens/colors
- [ ] `src/lib/navigation.ts`, `proxy.ts` — roles and protected areas
- [ ] `src/lib/changelog.ts` + `CHANGELOG.md` — reset to your first entry

### Find stragglers
```bash
# from the repo root, look for the old identifiers you renamed
grep -rin "template\|com.example.template" apps --include=*.ts --include=*.tsx --include=*.rb \
  | grep -v node_modules
```

## 2. Define your first feature (Spec Kit)

1. `/speckit.specify` — the *what* and *why*.
2. `/speckit.clarify` — resolve ambiguity.
3. `/speckit.plan` — technology choices.
4. `/speckit.tasks` — small, verifiable tasks.
5. `/speckit.implement` — build it.

Copy `specs/example/` as a starting scaffold. Keep the artifacts under
`specs/<number>-<name>/`.

## 3. Add your domain

- **Data:** add Rails migrations (`bin/rails g migration ...`), then models,
  controllers under `/api/v1`, and serializers. Never hand-edit `db/schema.rb`.
- **Contracts:** document each endpoint (method, path, request, responses,
  errors, auth) under the feature's `contracts/`.
- **Clients:** consume the documented contract from mobile/portal; don't
  duplicate authoritative logic.
- **Tests:** add tests on both sides for behavior changes.

## 4. AI features

Follow [`../ai-development-workflow.md`](../ai-development-workflow.md): keep
provider calls behind Rails, validate identifiers, add a deterministic fallback,
and test with doubles (never a live model).

## 5. Before you ship

- Run each app's checks (see `docs/getting-started.md`).
- Replace all demo data and example accounts.
- Confirm no secrets are committed and no `EXPO_PUBLIC_*` var holds a secret.
- Set real environment variables in your deployment.
