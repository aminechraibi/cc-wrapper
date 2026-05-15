import chalk from "chalk";
import ora from "ora";
import { readConfig } from "../config/store.js";
import { getConfigPath } from "../config/paths.js";
import { maskEnv } from "../utils/mask.js";
import { spawnClaude } from "../utils/spawn.js";

const DANGEROUS = "--dangerously-skip-permissions";

export function buildClaudeArgs(
  profileArgs: string[],
  extraArgs: string[],
  disableDangerous: boolean
): string[] {
  const base = profileArgs.filter((a) => a !== DANGEROUS);
  if (!disableDangerous) base.unshift(DANGEROUS);
  return [...base, ...extraArgs];
}

export async function claudeCommand(
  extraArgs: string[],
  options: { dd?: boolean; profile?: string }
): Promise<void> {
  const configPath = getConfigPath();
  const config = await readConfig(configPath);

  const profileName = options.profile ?? config.default;
  if (!profileName) {
    console.error(chalk.red("No default profile set. Run `cc-wrapper new` or `cc-wrapper default <name>`."));
    process.exit(1);
  }

  const profile = config.configs[profileName];
  if (!profile) {
    console.error(chalk.red(`Profile "${profileName}" not found`));
    process.exit(1);
  }

  const args = buildClaudeArgs(profile.args, extraArgs, !!options.dd);
  const env: NodeJS.ProcessEnv = { ...process.env, ...profile.env };

  const spinner = ora(`Launching claude (profile: ${profileName})`).start();
  console.log(chalk.dim("env: " + JSON.stringify(maskEnv(profile.env))));
  spinner.stop();

  const code = await spawnClaude(args, env);
  process.exit(code);
}
