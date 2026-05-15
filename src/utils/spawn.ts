import spawn from "cross-spawn";

export function spawnClaude(args: string[], env: NodeJS.ProcessEnv): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, {
      stdio: "inherit",
      shell: true,
      env,
    });
    child.on("close", (code) => resolve(code ?? 0));
    child.on("error", reject);
  });
}
