import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../src/data/env-vars.json");
const DOCS_URL = "https://docs.anthropic.com/en/docs/claude-code/settings#environment-variables";

interface EnvVar {
  name: string;
  description: string;
}

async function fetchEnvVars(): Promise<EnvVar[]> {
  console.log(`Fetching: ${DOCS_URL}`);
  const res = await fetch(DOCS_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const vars: EnvVar[] = [];
  const rowPattern = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
  const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  const rows = html.match(rowPattern) ?? [];
  for (const row of rows) {
    const cells: string[] = [];
    let m: RegExpExecArray | null;
    cellPattern.lastIndex = 0;
    while ((m = cellPattern.exec(row)) !== null) {
      cells.push(m[1].replace(/<[^>]+>/g, "").trim());
    }
    if (cells.length >= 2 && /^[A-Z][A-Z0-9_]{2,}$/.test(cells[0])) {
      vars.push({ name: cells[0], description: cells[1] });
    }
  }

  return vars;
}

async function main() {
  try {
    const vars = await fetchEnvVars();
    if (vars.length < 5) {
      console.warn(`Only found ${vars.length} vars — docs page structure may have changed. Keeping existing file.`);
      process.exit(0);
    }
    writeFileSync(OUTPUT, JSON.stringify(vars, null, 2) + "\n");
    console.log(`Wrote ${vars.length} env vars to ${OUTPUT}`);
  } catch (err) {
    console.error("sync-envs failed:", err);
    console.error("Keeping existing env-vars.json");
    process.exit(1);
  }
}

main();
