import { describe, it, expect } from "vitest";
import { maskValue, maskEnv } from "../../src/utils/mask.js";

describe("maskValue", () => {
  it("masks string longer than 4 chars", () => {
    expect(maskValue("sk-ant-abc123")).toBe("sk-a*****");
  });

  it("masks short string fully", () => {
    expect(maskValue("abc")).toBe("*****");
  });

  it("masks empty string", () => {
    expect(maskValue("")).toBe("*****");
  });
});

describe("maskEnv", () => {
  it("masks token/key/secret vars, leaves others", () => {
    const env = {
      ANTHROPIC_API_KEY: "sk-ant-secret",
      ANTHROPIC_AUTH_TOKEN: "tok-abc",
      ANTHROPIC_BASE_URL: "http://localhost:8787",
      AWS_SECRET_ACCESS_KEY: "mysecret",
      HTTP_PROXY: "http://proxy:3128",
    };
    const masked = maskEnv(env);
    expect(masked.ANTHROPIC_API_KEY).toMatch(/\*+/);
    expect(masked.ANTHROPIC_AUTH_TOKEN).toMatch(/\*+/);
    expect(masked.AWS_SECRET_ACCESS_KEY).toMatch(/\*+/);
    expect(masked.ANTHROPIC_BASE_URL).toBe("http://localhost:8787");
    expect(masked.HTTP_PROXY).toBe("http://proxy:3128");
  });
});
