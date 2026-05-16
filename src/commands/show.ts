import chalk from "chalk";
import { readConfig } from "../config/store.js";
import { getConfigPath } from "../config/paths.js";
import { maskEnv } from "../utils/mask.js";

export async function showCommand(name: string): Promise<void> {
  const config = await readConfig(getConfigPath());
  const profileName = name ?? config.default;

  if (!profileName) {
    console.error(chalk.red("No profile specified and no default set."));
    process.exit(1);
  }

  const profile = config.configs[profileName];
  if (!profile) {
    console.error(chalk.red(`Profile "${profileName}" not found.`));
    process.exit(1);
  }

  const isDefault = profileName === config.default;
  const tag = isDefault ? chalk.dim(" (default)") : "";
  console.log(chalk.bold.cyan("cc-wrapper") + chalk.dim(" › ") + chalk.bold(profileName) + tag);
  console.log();

  const masked = maskEnv(profile.env);
  const envEntries = Object.entries(masked);
  if (envEntries.length > 0) {
    console.log(chalk.dim("  env:"));
    const keyWidth = Math.max(...envEntries.map(([k]) => k.length));
    for (const [k, v] of envEntries) {
      console.log(
        chalk.dim("    " + k.padEnd(keyWidth, " ") + "  ") + chalk.yellow(v)
      );
    }
  } else {
    console.log(chalk.dim("  env: (none)"));
  }

  console.log();
  if (profile.args.length > 0) {
    console.log(chalk.dim("  args: ") + chalk.white(profile.args.join(" ")));
  } else {
    console.log(chalk.dim("  args: (none)"));
  }
}
