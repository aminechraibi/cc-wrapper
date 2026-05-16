import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../src/data/env-vars.json");
const DOCS_URL = "https://code.claude.com/docs/en/env-vars";

interface EnvVar {
  name: string;
  description: string;
}

// Priority order for sorting — most-used vars appear first
const PRIORITY: string[] = [
  "ANTHROPIC_BASE_URL",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_AUTH_TOKEN",
  "ANTHROPIC_MODEL",
  "ENABLE_TOOL_SEARCH",
  "ANTHROPIC_WORKSPACE_ID",
  "ANTHROPIC_BETAS",
  "ANTHROPIC_CUSTOM_HEADERS",
  "CLAUDE_CODE_USE_BEDROCK",
  "CLAUDE_CODE_USE_VERTEX",
  "CLAUDE_CODE_USE_FOUNDRY",
  "CLAUDE_CODE_USE_ANTHROPIC_AWS",
  "CLAUDE_CODE_USE_MANTLE",
  "ANTHROPIC_DEFAULT_OPUS_MODEL",
  "ANTHROPIC_DEFAULT_SONNET_MODEL",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL",
  "ANTHROPIC_SMALL_FAST_MODEL",
  "CLAUDE_CODE_SUBAGENT_MODEL",
  "ANTHROPIC_CUSTOM_MODEL_OPTION",
  "ANTHROPIC_CUSTOM_MODEL_OPTION_NAME",
  "ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION",
  "CLAUDE_CODE_EFFORT_LEVEL",
  "ANTHROPIC_BEDROCK_BASE_URL",
  "ANTHROPIC_BEDROCK_SERVICE_TIER",
  "ANTHROPIC_BEDROCK_MANTLE_BASE_URL",
  "AWS_BEARER_TOKEN_BEDROCK",
  "ANTHROPIC_SMALL_FAST_MODEL_AWS_REGION",
  "ANTHROPIC_AWS_API_KEY",
  "ANTHROPIC_AWS_BASE_URL",
  "ANTHROPIC_AWS_WORKSPACE_ID",
  "ANTHROPIC_VERTEX_BASE_URL",
  "ANTHROPIC_VERTEX_PROJECT_ID",
  "ANTHROPIC_FOUNDRY_API_KEY",
  "ANTHROPIC_FOUNDRY_BASE_URL",
  "ANTHROPIC_FOUNDRY_RESOURCE",
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "NO_PROXY",
  "API_TIMEOUT_MS",
  "BASH_DEFAULT_TIMEOUT_MS",
  "BASH_MAX_TIMEOUT_MS",
  "BASH_MAX_OUTPUT_LENGTH",
  "CLAUDE_CODE_MAX_OUTPUT_TOKENS",
  "CLAUDE_CODE_MAX_TURNS",
  "CLAUDE_CODE_MAX_RETRIES",
  "MAX_THINKING_TOKENS",
  "MCP_TIMEOUT",
  "MCP_TOOL_TIMEOUT",
  "MCP_CONNECT_TIMEOUT_MS",
];

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/`([^`]+)`/g, "$1")              // `code` → code
    .replace(/\*\*([^*]+)\*\*/g, "$1")        // **bold** → bold
    .replace(/\*([^*]+)\*/g, "$1")            // *italic* → italic
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(text: string): string {
  return text
    .replace(/<a[^>]*>([^<]*)<\/a>/gi, "$1")
    .replace(/<code>([^<]*)<\/code>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sortByPriority(vars: EnvVar[]): EnvVar[] {
  const priorityMap = new Map(PRIORITY.map((name, i) => [name, i]));
  return vars.sort((a, b) => {
    const pa = priorityMap.get(a.name) ?? 9999;
    const pb = priorityMap.get(b.name) ?? 9999;
    if (pa !== pb) return pa - pb;
    // Group VERTEX_REGION_* and DISABLE_* together alphabetically after priority vars
    return a.name.localeCompare(b.name);
  });
}

async function fetchEnvVars(): Promise<EnvVar[]> {
  console.log(`Fetching: ${DOCS_URL}`);
  const res = await fetch(DOCS_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const vars: EnvVar[] = [];
  const seen = new Set<string>();

  // Parse HTML table rows
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    cellPattern.lastIndex = 0;
    while ((cellMatch = cellPattern.exec(rowMatch[1])) !== null) {
      cells.push(stripHtml(cellMatch[1]));
    }
    if (cells.length >= 2 && /^[A-Z][A-Z0-9_]{2,}$/.test(cells[0])) {
      const name = cells[0];
      if (!seen.has(name)) {
        seen.add(name);
        vars.push({ name, description: cells[1] });
      }
    }
  }

  // Fallback: try markdown table format (pipe-delimited)
  if (vars.length < 5) {
    console.log("HTML table parse yielded few results, trying markdown table...");
    const mdRowPattern = /^\|\s*`?([A-Z][A-Z0-9_]{2,})`?\s*\|\s*(.+?)\s*\|/gm;
    let mdMatch: RegExpExecArray | null;
    while ((mdMatch = mdRowPattern.exec(html)) !== null) {
      const name = mdMatch[1];
      const description = stripMarkdown(mdMatch[2]);
      if (!seen.has(name) && description && description !== "---") {
        seen.add(name);
        vars.push({ name, description });
      }
    }
  }

  return vars;
}

async function main() {
  try {
    const vars = await fetchEnvVars();
    if (vars.length < 10) {
      console.warn(
        `Only found ${vars.length} vars — docs page structure may have changed. Keeping existing file.`
      );
      process.exit(0);
    }
    const sorted = sortByPriority(vars);
    const lines = sorted.map((v) => "  " + JSON.stringify(v));
    writeFileSync(OUTPUT, "[\n" + lines.join(",\n") + "\n]\n");
    console.log(`Wrote ${sorted.length} env vars to ${OUTPUT}`);
  } catch (err) {
    console.error("sync-envs failed:", err);
    console.error("Keeping existing env-vars.json");
    process.exit(1);
  }
}

main();
