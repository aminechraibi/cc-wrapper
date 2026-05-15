const SECRET_PATTERN = /key|token|secret|password|credential/i;

export function maskValue(value: string): string {
  if (value.length <= 4) return "*****";
  return value.slice(0, 4) + "*****";
}

export function maskEnv(env: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => [k, SECRET_PATTERN.test(k) ? maskValue(v) : v])
  );
}
