import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fixturePath } from "./helpers.ts";

const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");
const cliScript = resolve(process.cwd(), "src/cli.ts");

describe("cli v0.1.2 flags", () => {
  it("prints version", () => {
    const output = execFileSync(process.execPath, [tsxCli, cliScript, "--version"], {
      encoding: "utf8",
    });
    expect(output.trim()).toBe("0.1.2");
  });

  it("prints stats-only output", () => {
    const output = execFileSync(
      process.execPath,
      [tsxCli, cliScript, fixturePath("basic-unused/src"), "--stats-only"],
      { encoding: "utf8" },
    );
    expect(output.trim()).toMatch(/^unused=1 types=/);
  });
});
