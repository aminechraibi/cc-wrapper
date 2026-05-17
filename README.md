# cc-wrapper

> Cross-platform CLI wrapper for [Claude Code](https://claude.ai/code) with named environment profiles, arg passthrough, and zero config friction.

[![npm version](https://img.shields.io/npm/v/cc-wrapper)](https://www.npmjs.com/package/cc-wrapper)
[![npm downloads](https://img.shields.io/npm/dm/cc-wrapper)](https://www.npmjs.com/package/cc-wrapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >= 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](#)

Switch between Claude environments — local proxies, OpenRouter, AWS Bedrock, Google Vertex AI — with a single command instead of exporting env vars every time.

```bash
# Before cc-wrapper
ANTHROPIC_BASE_URL=http://localhost:8787 ANTHROPIC_AUTH_TOKEN=my-token claude

# After cc-wrapper
cc-wrapper claude
```

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Configuration](#configuration)
- [Supported Environment Variables](#supported-environment-variables)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Named profiles** — save multiple Claude environments (local, openrouter, vertex, bedrock, etc.)
- **Interactive setup** — searchable env var selector with descriptions and example values
- **Auto `--dangerously-skip-permissions`** — injected by default, disable with `--dd`
- **Full arg passthrough** — all extra args forwarded to `claude` unchanged
- **Cross-platform** — Windows, macOS, Linux; config stored at correct OS path automatically
- **Secret masking** — API keys and tokens masked in all log output
- **Live sync** — fetch latest Claude env vars from official docs with `npm run sync-envs`

---

## Requirements

- [Node.js](https://nodejs.org) >= 20
- [Claude Code CLI](https://claude.ai/code) installed and accessible as `claude` in PATH

---

## Installation

```bash
npm install -g cc-wrapper
```

Verify:

```bash
cc-wrapper --version
cc-wrapper --help
```

---

## Quick Start

**1. Create your first profile:**

```bash
cc-wrapper new
```

You will be prompted for:
- Profile name (e.g. `local`, `openrouter`, `vertex`)
- Which Claude env vars to set (searchable, numbered list with descriptions)
- Value for each selected env var (with examples shown inline)
- Default extra args to pass to `claude`

**2. Run Claude with the profile:**

```bash
cc-wrapper claude
```

---

## Commands

### `cc-wrapper new`

Create a new named profile interactively.

```bash
cc-wrapper new
```

Flow:
1. Enter profile name
2. Multi-select env vars from numbered list (SPACE to toggle, ENTER to confirm)
3. Enter value for each selected var (example shown inline)
4. Enter default claude args
5. Profile saved — set as default if it's the first one

---

### `cc-wrapper list`

List all saved profiles. Default profile is highlighted.

```bash
cc-wrapper list
```

```
● local  (default)
○ openrouter
○ vertex
```

---

### `cc-wrapper default <name>`

Set the default profile used by `cc-wrapper claude`.

```bash
cc-wrapper default openrouter
```

---

### `cc-wrapper edit <name>`

Interactively edit an existing profile. Current values are pre-filled and masked.

```bash
cc-wrapper edit local
```

---

### `cc-wrapper delete <name>`

Delete a profile (confirmation prompt required).

```bash
cc-wrapper delete vertex
```

If the deleted profile was the default, the next available profile becomes the new default automatically.

---

### `cc-wrapper show <name>`

Display all env vars and args stored in a profile. Secret values (keys, tokens, passwords) are masked.

```bash
cc-wrapper show local
```

Output example:

```
cc-wrapper › local (default)

  env:
    ANTHROPIC_BASE_URL    http://localhost:8787
    ANTHROPIC_API_KEY     sk-a*****

  args: --dangerously-skip-permissions
```

---

### `cc-wrapper claude [args...]`

Launch `claude` with the default profile's environment variables injected.

```bash
cc-wrapper claude
```

**Pass extra args directly to claude:**

```bash
cc-wrapper claude --print "explain this codebase"
cc-wrapper claude --model claude-opus-4-7-20250514
cc-wrapper claude --no-stream
```

**Disable automatic `--dangerously-skip-permissions` injection:**

```bash
cc-wrapper claude --dd
```

**Use a specific profile instead of default:**

```bash
cc-wrapper claude --profile openrouter
cc-wrapper claude -p vertex --print "hello"
```

---

## Configuration

Config is stored as a single JSON file at the OS-appropriate path:

| OS | Path |
|---|---|
| Linux | `~/.config/cc-wrapper/config.json` |
| macOS | `~/Library/Preferences/cc-wrapper/config.json` |
| Windows | `%APPDATA%\cc-wrapper\config.json` |

### Config schema

```json
{
  "default": "local",
  "configs": {
    "local": {
      "env": {
        "ANTHROPIC_BASE_URL": "http://localhost:8787",
        "ANTHROPIC_AUTH_TOKEN": "my-token"
      },
      "args": []
    },
    "openrouter": {
      "env": {
        "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/v1",
        "ANTHROPIC_API_KEY": "sk-or-..."
      },
      "args": ["--model", "anthropic/claude-opus-4"]
    },
    "vertex": {
      "env": {
        "CLAUDE_CODE_USE_VERTEX": "1",
        "ANTHROPIC_VERTEX_PROJECT_ID": "my-gcp-project",
        "CLOUD_ML_REGION": "us-central1"
      },
      "args": []
    }
  }
}
```

You can edit this file directly or use `cc-wrapper edit <name>`.

---

## Supported Environment Variables

cc-wrapper supports all official Claude Code environment variables. The list is stored in `src/data/env-vars.json` and can be refreshed from the official docs:

```bash
npm run sync-envs
```

Key variables include:

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_BASE_URL` | Custom API base URL (local proxy, OpenRouter, etc.) |
| `ANTHROPIC_AUTH_TOKEN` | Bearer token for custom auth |
| `ANTHROPIC_MODEL` | Override default model |
| `CLAUDE_CODE_USE_VERTEX` | Use Google Vertex AI |
| `CLAUDE_CODE_USE_BEDROCK` | Use AWS Bedrock |
| `AWS_REGION` | AWS region for Bedrock |
| `CLOUD_ML_REGION` | GCP region for Vertex |
| `HTTP_PROXY` / `HTTPS_PROXY` | Proxy settings |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Override max output tokens |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Disable telemetry |

Full list: run `cc-wrapper new` and browse the interactive selector.

---

## Security

- API keys and tokens are **never printed** in logs — always masked (e.g. `sk-a*****`)
- Config file lives in your user data directory, not in project folders
- No values are sent anywhere other than the `claude` process environment

---

## Contributing

```bash
git clone https://github.com/aminechraibi/cc-wrapper
cd cc-wrapper
npm install
npm test
npm run build
```

Refresh Claude env var list from official docs:

```bash
npm run sync-envs
```

---

## Support

<a href="https://www.buymeacoffee.com/addev" target="_blank" title="buymeacoffee">
  <img src="https://iili.io/JoQ1MeS.md.png" alt="buymeacoffee-yellow-badge" style="width: 104px;">
</a>

---

## License

MIT — [Amine Chraibi](https://github.com/aminechraibi)
