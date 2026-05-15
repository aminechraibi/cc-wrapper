import { checkbox, input } from "@inquirer/prompts";
import { maskValue } from "../utils/mask.js";
import type { EnvVar } from "../types/index.js";

export async function promptEnvSelection(
  envVars: EnvVar[],
  existing: Record<string, string> = {}
): Promise<Record<string, string>> {
  const selected = await checkbox({
    message: "Select env vars (SPACE to toggle, ENTER to confirm):",
    choices: envVars.map((v) => ({
      name: `${v.name}${existing[v.name] ? ` [${maskValue(existing[v.name])}]` : ""}`,
      value: v.name,
      checked: v.name in existing,
      description: v.description,
    })),
    pageSize: 15,
  });

  const result: Record<string, string> = {};
  for (const name of selected) {
    const current = existing[name];
    const hint = current ? ` (current: ${maskValue(current)}, leave blank to keep)` : "";
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
    message: "Default claude args (space-separated):",
    default: existing.join(" "),
  });
  return raw.trim() ? raw.trim().split(/\s+/) : [];
}
