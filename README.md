# cc-wrapper

Cross-platform CLI wrapper for `claude` with reusable environment profiles.

## Install

```bash
npm install -g cc-wrapper
```

## Usage

### Create a profile

```bash
cc-wrapper new
```

### List profiles

```bash
cc-wrapper list
```

### Set default profile

```bash
cc-wrapper default local
```

### Edit a profile

```bash
cc-wrapper edit local
```

### Delete a profile

```bash
cc-wrapper delete local
```

### Run claude

```bash
cc-wrapper claude
```

Passes all extra args directly to claude:

```bash
cc-wrapper claude --print "hello"
```

Disable `--dangerously-skip-permissions` injection:

```bash
cc-wrapper claude --dd
```

Use a specific profile:

```bash
cc-wrapper claude --profile openrouter
```

## Sync env vars from Claude docs

```bash
npm run sync-envs
```

## Config file

**Linux/macOS:** `~/.config/cc-wrapper/config.json`

**Windows:** `%APPDATA%\cc-wrapper\config.json`

```json
{
  "default": "local",
  "configs": {
    "local": {
      "env": {
        "ANTHROPIC_BASE_URL": "http://localhost:8787"
      },
      "args": []
    }
  }
}
```

## License

MIT
