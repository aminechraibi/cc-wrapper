export interface Profile {
  env: Record<string, string>;
  args: string[];
}

export interface Config {
  default: string | null;
  configs: Record<string, Profile>;
}

export interface EnvVar {
  name: string;
  description: string;
  default?: string;
}
