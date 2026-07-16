# AI-First Project Template

A reusable **monorepo template for AI-first software projects**. It ships three
independent applications and the tooling for spec-driven, AI-assisted
development — with **no business domain** of its own. Clone it, rename it, and
build your product on top.

## Table of contents

- [What's inside](#whats-inside)
- [Stack](#stack)
- [Requirements](#requirements)
- [Installing Ruby and Rails with RVM](#installing-ruby-and-rails-with-rvm)
  - [1. Install RVM](#1-install-rvm-macos-and-linux)
  - [2. Install the OS build dependencies](#2-install-the-os-build-dependencies)
  - [3. Install Ruby 3.4.9](#3-install-ruby-349-and-make-it-the-default)
  - [4. Install the project's gems](#4-install-the-projects-gems)
  - [Troubleshooting](#troubleshooting)
- [Quick start](#quick-start)
  - [Backend with Docker (no local Ruby/PostgreSQL)](#backend-with-docker-no-local-rubypostgresql)
- [Running the apps from the root `package.json`](#running-the-apps-from-the-root-packagejson)
- [Environment variables](#environment-variables)
- [Testing](#testing)
- [AI-assisted development](#ai-assisted-development)
- [Start a new project from this template](#start-a-new-project-from-this-template)
- [Documentation](#documentation)

## What's inside

```text
apps/
├── api/        # Ruby on Rails 8.1 API — source of truth for business rules & auth
├── mobile/     # Expo / React Native app (Home, AI Assistant, Profile)
└── portal/     # Next.js 16 web portal (Rails-backed auth, role-scoped shell)
docs/           # Getting started, architecture, AI workflow, customization guide
specs/          # Spec-Driven Development artifacts (Spec Kit)
.specify/       # Spec Kit templates + project constitution
```

Each app is independent (own runtime, dependencies, lockfile, tests, build).
The apps are wired together by one contract: the mobile and portal clients
authenticate against the Rails API.

## Stack

| App | Stack |
|---|---|
| API | Ruby 3.4, Rails 8.1 (API-only), PostgreSQL, Solid Queue/Cache/Cable, `anthropic`/`faraday` AI base |
| Mobile | Expo SDK 54, React Native 0.81, Expo Router, TypeScript, NativeWind, Zustand, React Query, MMKV |
| Portal | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest |

## Requirements

- Ruby **3.4.9** (pinned in `apps/api/.ruby-version`) + Bundler, PostgreSQL 14+
- Node.js 20+ (Node 24 tested), pnpm (mobile), npm (portal)

If you don't have Ruby yet, follow
[Installing Ruby and Rails with RVM](#installing-ruby-and-rails-with-rvm) below.

## Installing Ruby and Rails with RVM

The API pins **Ruby 3.4.9** in [`apps/api/.ruby-version`](apps/api/.ruby-version).
RVM reads that file and switches to the right Ruby automatically when you `cd`
into the app, so use exactly this version.

> **You do not need to `gem install rails`.** Rails 8.1 and every other gem are
> declared in `apps/api/Gemfile` and installed by `bundle install` (step 4).
> Installing Rails globally is optional and only useful for `rails new`.

### 1. Install RVM (macOS and Linux)

Import the RVM signing keys, then run the installer
([official instructions](https://rvm.io/rvm/install)):

```bash
gpg --keyserver keyserver.ubuntu.com --recv-keys \
  409B6B1796C275462A1703113804BB82D39DC0E3 \
  7D2BAF1CF37B13E2069D6956105BD0E739499BDB

\curl -sSL https://get.rvm.io | bash -s stable
```

The leading `\` is intentional — it bypasses any shell alias on `curl`.

Then load RVM into your **current** shell (new terminals do this for you):

```bash
source ~/.rvm/scripts/rvm
rvm --version        # verify
```

If `rvm` isn't found in new terminals, make sure your shell runs it as a **login
shell**. On zsh/bash add this to `~/.zshrc` / `~/.bashrc`:

```bash
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"
```

### 2. Install the OS build dependencies

Ruby has to be compiled, and the `pg` gem needs the PostgreSQL **client
headers** — this is the single most common cause of a failed `bundle install`.

<details open>
<summary><strong>macOS</strong></summary>

```bash
xcode-select --install                 # Command Line Tools (compiler)
brew install gnupg postgresql@16       # gnupg for the RVM keys, postgres for libpq
brew services start postgresql@16      # start the database
```

RVM's `autolibs` will pull anything else it needs via Homebrew. Do **not** rely
on the Ruby that ships with macOS — it's too old and system-managed.
</details>

<details>
<summary><strong>Linux (Debian / Ubuntu)</strong></summary>

```bash
sudo apt-get update
sudo apt-get install -y gnupg2 curl build-essential \
  libssl-dev libreadline-dev zlib1g-dev libyaml-dev libffi-dev \
  postgresql postgresql-contrib libpq-dev
sudo systemctl start postgresql
```

`libpq-dev` is what the `pg` gem compiles against — without it `bundle install`
fails on the `pg` gem.

On Fedora/RHEL use `dnf install gcc make openssl-devel readline-devel zlib-devel
libyaml-devel libffi-devel postgresql-server postgresql-devel` instead.
</details>

<details>
<summary><strong>Windows — use WSL2</strong></summary>

**RVM does not run on native Windows** (no PowerShell/CMD support). The
supported path is **WSL2**, which gives you a real Linux environment.

In PowerShell **as Administrator**:

```powershell
wsl --install -d Ubuntu
```

Reboot, open the **Ubuntu** terminal, and from that point follow the
**Linux (Debian / Ubuntu)** steps above — RVM, Ruby, and Postgres all get
installed inside WSL, not on Windows.

Two things that will bite you otherwise:

- **Keep the repo inside the Linux filesystem** (e.g. `~/code/...`), not under
  `/mnt/c/...`. Cloning onto the Windows drive makes Bundler and file watching
  dramatically slower.
- Install PostgreSQL **inside WSL** (as above). If you instead use a Postgres
  running on Windows, point the API at it with `DB_HOST` in `apps/api/.env`.

If you truly cannot use WSL2, `rvm` is not an option — use
[RubyInstaller](https://rubyinstaller.org/) instead. That path is not covered
here and isn't what this project is tested against.
</details>

### 3. Install Ruby 3.4.9 and make it the default

```bash
rvm install 3.4.9
rvm --default use 3.4.9

ruby -v          # => ruby 3.4.9
which ruby       # => ~/.rvm/rubies/ruby-3.4.9/bin/ruby
```

If RVM says the version is unknown, its list of rubies is stale — refresh it and
retry:

```bash
rvm get stable && rvm reload
```

### 4. Install the project's gems

```bash
cd apps/api
gem install bundler          # if 'bundle' isn't available yet
bundle install               # installs Rails 8.1 and everything else
bin/rails --version          # => Rails 8.1.x
```

Because `.ruby-version` is present, `cd apps/api` makes RVM switch to Ruby 3.4.9
automatically. RVM also keeps this project's gems in their own gemset, so they
won't collide with other Ruby projects on your machine.

### 5. Continue with the database

Now follow [Quick start](#quick-start): `bin/rails db:prepare && bin/rails db:seed`.

### Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `rvm: command not found` in a new terminal | Your shell isn't a login shell. Add the `source ~/.rvm/scripts/rvm` line above to `~/.zshrc` / `~/.bashrc`. |
| GPG error while installing RVM | The signing keys weren't imported — rerun the `gpg --recv-keys` command in step 1. Behind a firewall, try `--keyserver hkp://keyserver.ubuntu.com:80`. |
| `bundle install` fails on the **pg** gem | Missing PostgreSQL client headers. macOS: `brew install libpq`. Ubuntu: `sudo apt-get install libpq-dev`. |
| `Your Ruby version is 3.x, but your Gemfile specified 3.4.9` | You're on the wrong Ruby. Run `rvm use 3.4.9` (from inside `apps/api`). |
| `PG::ConnectionBad` on `db:prepare` | Postgres isn't running, or another instance holds port 5432. Check with `lsof -nP -iTCP:5432 -sTCP:LISTEN` and set `DB_PORT`/`DB_HOST` in `apps/api/.env`. |

## Quick start

Install each app's dependencies before running any development server. The
backend needs its Ruby gems installed with Bundler, while the frontend apps need
their Node packages installed with their app-specific package managers.

```bash
# API backend dependencies (Ruby gems)
cd apps/api
bundle install
bin/rails db:prepare
bin/rails db:seed

# Portal frontend dependencies (Node packages)
cd ../portal
npm install

# Mobile frontend dependencies (Node packages)
cd ../mobile
pnpm install
```

After the dependencies are installed, run each app in its own terminal:

```bash
# API (http://localhost:3000)
cd apps/api
bin/rails server -b 0.0.0.0

# Portal (http://localhost:3001) — needs the API running
cd apps/portal
npm run dev -- -p 3001

# Mobile — needs the API running
cd apps/mobile
pnpm start
```

Demo accounts (from API seeds): `admin@example.com` / `member@example.com`,
password `Password123`.

See [`docs/getting-started.md`](docs/getting-started.md) for the full walkthrough.

### Backend with Docker (no local Ruby/PostgreSQL)

Prefer containers? Run the Rails API and PostgreSQL with Docker — nothing to
install on the host but Docker Desktop. From the **repo root**:

```bash
cp .env.example .env          # first time only
docker compose up --build     # API on http://localhost:3000 (health: /up)
```

This starts PostgreSQL, prepares/migrates the database, boots Rails with hot
reload, and runs a separate Solid Queue worker. Common commands:

```bash
docker compose exec api bin/rails console   # Rails console
docker compose exec api bin/rails test      # run tests
docker compose down                         # stop (keeps data)
```

Full reference (Windows/WSL2 notes, gems, troubleshooting):
[`apps/api/README_DOCKER.md`](apps/api/README_DOCKER.md).

## Running the apps from the root `package.json`

Once each app's dependencies are installed (see Quick start above), the root
`package.json` exposes convenience scripts so you can start any app from the
repo root without `cd`-ing into it. Run each one in its own terminal.

| Script | Runs | Where |
|---|---|---|
| `npm run backend` | Rails API (`bin/rails server -b 0.0.0.0`) | http://localhost:3000 |
| `npm run frontend` | Next.js portal on port 3001 | http://localhost:3001 |
| `npm run mobile` | Expo dev server | Expo CLI (press `i` / `a`, or scan the QR) |
| `npm run mobile:clear` | Expo dev server with a cleared cache (`-c`) | Expo CLI |
| `npm run mobile:web` | Expo app in the browser | http://localhost:8081 |

```bash
# terminal 1 — API (start this first; the clients depend on it)
npm run backend

# terminal 2 — web portal
npm run frontend

# terminal 3 — mobile
npm run mobile
```

Notes:

- These scripts **only start** the apps — they do not install dependencies or set
  up the database. Run `bundle install` / `bin/rails db:prepare` /
  `pnpm install` / `npm install` once per app first.
- The portal runs on **3001** deliberately, so it doesn't collide with the API on
  3000.
- `mobile:clear` is the one to reach for when Metro serves stale code after you
  change env vars or config.
- Each script delegates to the app's own package manager (`pnpm` for mobile,
  `npm` for portal), so there is no root workspace to install.

## Environment variables

Each app has its own `.env.example` — copy it to `.env` and adjust. Key ones:

| App | Variable | Purpose |
|---|---|---|
| api | `DB_*`, `APP_NAME`, `ANTHROPIC_API_KEY` | Database, app name, AI provider |
| portal | `RAILS_API_URL` | Where the API lives (default `http://127.0.0.1:3000`) |
| mobile | `EXPO_PUBLIC_API_URL` | API base URL for the app |

Never commit real secrets. Never put secrets in Expo `EXPO_PUBLIC_*` vars.

## Testing

```bash
cd apps/api    && bin/rails test && bin/rubocop
cd apps/mobile && pnpm check-all           # type-check + lint + test
cd apps/portal && npx tsc --noEmit && npm run test && npm run build
```

## AI-assisted development

This repo is built to be driven by AI coding agents:

- [`AGENTS.md`](AGENTS.md) — canonical rules shared by every agent.
- [`CLAUDE.md`](CLAUDE.md) — Claude Code entry point (imports `AGENTS.md`).
- `.cursor/`, `.opencode/` — configs for other agents.
- **Spec Kit** under `.specify/` and `specs/` for spec-driven development.
- [`docs/ai-development-workflow.md`](docs/ai-development-workflow.md) — how to
  plan, implement, and review with different models, and how AI features must be
  built (behind the API, validated, with deterministic fallbacks).

## Start a new project from this template

Follow [`docs/template/customization-guide.md`](docs/template/customization-guide.md).
Checklist highlights: rename packages/modules (`ai-first-project-template`,
`TemplateApi`, `template_*` DB names, `com.example.template` bundle IDs), replace
branding/copy, define your first feature with Spec Kit, and add your domain
models via Rails migrations.

## Documentation

- [`docs/getting-started.md`](docs/getting-started.md) — first run and setup
- [`docs/architecture.md`](docs/architecture.md) — how the apps fit together
- [`docs/ai-development-workflow.md`](docs/ai-development-workflow.md) — AI workflow
- [`docs/template/customization-guide.md`](docs/template/customization-guide.md) — rename & rebrand
- [`docs/template/migration-audit.md`](docs/template/migration-audit.md) — how this template was derived
- `docs/architecture/` — system context, API guidelines, ADRs
