import envPaths from "env-paths";
import { join } from "node:path";

const paths = envPaths("cc-wrapper", { suffix: "" });

export function getConfigPath(): string {
  if (process.env["CC_WRAPPER_CONFIG_PATH"]) {
    return process.env["CC_WRAPPER_CONFIG_PATH"];
  }
  return join(paths.config, "config.json");
}
