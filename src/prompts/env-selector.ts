import { checkbox, input } from "@inquirer/prompts";
import { maskValue } from "../utils/mask.js";
import type { EnvVar } from "../types/index.js";

const ENV_EXAMPLES: Record<string, string> = {
  ANTHROPIC_API_KEY: "sk-ant-api03-...",
  ANTHROPIC_BASE_URL: "http://localhost:8787",
  ANTHROPIC_AUTH_TOKEN: "Bearer sk-ant-...",
  ANTHROPIC_MODEL: "claude-opus-4-7-20250514",
  ANTHROPIC_SMALL_FAST_MODEL: "claude-haiku-4-5-20251001",
  ANTHROPIC_VERTEX_PROJECT_ID: "my-gcp-project-123",
  CLOUD_ML_REGION: "us-central1",
  AWS_REGION: "us-east-1",
  AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
  AWS_SECRET_ACCESS_KEY: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  HTTP_PROXY: "http://proxy.corp.com:3128",
  HTTPS_PROXY: "http://proxy.corp.com:3128",
  NO_PROXY: "localhost,127.0.0.1",
  BASH_DEFAULT_TIMEOUT_MS: "30000",
  BASH_MAX_TIMEOUT_MS: "120000",
  BASH_MAX_OUTPUT_LENGTH: "50000",
  CLAUDE_CODE_MAX_OUTPUT_TOKENS: "8192",
  MCP_TIMEOUT: "10000",
  MCP_TOOL_TIMEOUT: "60000",
};

export async function promptEnvSelection(
  envVars: EnvVar[],
  existing: Record<string, string> = {}
): Promise<Record<string, string>> {
  const selected = await checkbox({
    message: "Select env vars (SPACE to toggle, ENTER to confirm):",
    choices: envVars.map((v, i) => ({
      name: `${String(i + 1).padStart(2)}. ${v.name}${existing[v.name] ? ` [${maskValue(existing[v.name])}]` : ""}`,
      value: v.name,
      checked: v.name in existing,
      description: v.description,
    })),
    pageSize: 15,
  });

  const result: Record<string, string> = {};
  for (const name of selected) {
    const current = existing[name];
    const example = ENV_EXAMPLES[name];
    let hint = "";
    if (current) hint = ` (current: ${maskValue(current)}, leave blank to keep)`;
    else if (example) hint = ` (e.g. ${example})`;
    const value = await input({
      message: `${name}${hint}:`,
      required: !current,
    });
    result[name] = value || current || "";
  }

  return result;
}

export async function promptArgs(existing: string[] = []): Promise<string[]> {
  const raw = await input({
    message: "Default claude args (space-separated, e.g. --print --model claude-opus-4-7):",
    default: existing.join(" "),
  });
  return raw.trim() ? raw.trim().split(/\s+/) : [];
}
