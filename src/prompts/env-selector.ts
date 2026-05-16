import { input } from "@inquirer/prompts";
import { searchableCheckbox } from "./searchable-checkbox.js";
import { maskValue } from "../utils/mask.js";
import type { EnvVar } from "../types/index.js";

const ENV_EXAMPLES: Record<string, string> = {
  ANTHROPIC_API_KEY: "sk-ant-api03-...",
  ANTHROPIC_BASE_URL: "http://localhost:8787",
  ANTHROPIC_AUTH_TOKEN: "Bearer sk-ant-...",
  ANTHROPIC_BETAS: "interleaved-thinking-2025-05-14",
  ANTHROPIC_CUSTOM_HEADERS: "X-My-Header: value",
  ANTHROPIC_MODEL: "claude-opus-4-7-20250514",
  ANTHROPIC_DEFAULT_OPUS_MODEL: "claude-opus-4-7-20250514",
  ANTHROPIC_DEFAULT_SONNET_MODEL: "claude-sonnet-4-6-20251101",
  ANTHROPIC_DEFAULT_HAIKU_MODEL: "claude-haiku-4-5-20251001",
  ANTHROPIC_SMALL_FAST_MODEL: "claude-haiku-4-5-20251001",
  CLAUDE_CODE_SUBAGENT_MODEL: "claude-haiku-4-5-20251001",
  ANTHROPIC_CUSTOM_MODEL_OPTION: "my-gateway/claude-opus",
  CLAUDE_CODE_EFFORT_LEVEL: "high",
  ANTHROPIC_VERTEX_PROJECT_ID: "my-gcp-project-123",
  ANTHROPIC_VERTEX_BASE_URL: "https://us-central1-aiplatform.googleapis.com",
  ANTHROPIC_BEDROCK_BASE_URL: "https://bedrock.us-east-1.amazonaws.com",
  ANTHROPIC_BEDROCK_SERVICE_TIER: "default",
  ANTHROPIC_FOUNDRY_BASE_URL: "https://my-resource.services.ai.azure.com/anthropic",
  ANTHROPIC_FOUNDRY_RESOURCE: "my-resource",
  ANTHROPIC_AWS_WORKSPACE_ID: "ws-abc123",
  HTTP_PROXY: "http://proxy.corp.com:3128",
  HTTPS_PROXY: "http://proxy.corp.com:3128",
  NO_PROXY: "localhost,127.0.0.1",
  API_TIMEOUT_MS: "600000",
  BASH_DEFAULT_TIMEOUT_MS: "120000",
  BASH_MAX_TIMEOUT_MS: "600000",
  BASH_MAX_OUTPUT_LENGTH: "50000",
  CLAUDE_CODE_MAX_OUTPUT_TOKENS: "8192",
  CLAUDE_CODE_MAX_TURNS: "50",
  CLAUDE_CODE_MAX_RETRIES: "5",
  MAX_THINKING_TOKENS: "10000",
  MCP_TIMEOUT: "30000",
  MCP_TOOL_TIMEOUT: "60000",
  ENABLE_TOOL_SEARCH: "auto",
  CLAUDE_AUTOCOMPACT_PCT_OVERRIDE: "80",
  CLAUDE_CODE_EXTRA_BODY: '{"temperature":0}',
  CLAUDE_CONFIG_DIR: "~/.claude-work",
  CLAUDE_CODE_SHELL: "/bin/zsh",
  DEBUG: "1",
  CLAUDE_CODE_DEBUG_LOG_LEVEL: "verbose",
  VERTEX_REGION_CLAUDE_4_6_SONNET: "us-central1",
  VERTEX_REGION_CLAUDE_4_7_OPUS: "us-central1",
};

export async function promptEnvSelection(
  envVars: EnvVar[],
  existing: Record<string, string> = {}
): Promise<Record<string, string>> {
  const selected = await searchableCheckbox({
    message: "Select env vars",
    choices: envVars.map((v) => ({
      name: existing[v.name]
        ? `${v.name} [${maskValue(existing[v.name])}]`
        : v.name,
      value: v.name,
      checked: v.name in existing,
      description: v.description,
    })),
    pageSize: 14,
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
