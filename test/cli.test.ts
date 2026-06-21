import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fixturePath } from "./helpers";

const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");
const cliScript = resolve(process.cwd(), "src/cli.ts");

function runCli(args: string[]): string {
  return execFileSync(process.execPath, [tsxCli, cliScript, ...args], {
    encoding: "utf8",
  });
}

describe("cli", () => {
  it("reports unused types from a fixture", () => {
    const output = runCli([fixturePath("basic-unused/src"), "--json"]);
    const parsed = JSON.parse(output) as { unused: Array<{ name: string }> };
    expect(parsed.unused.map((item) => item.name)).toEqual(["DeadType"]);
  });

  it("exits with code 1 in ci mode when unused types exist", () => {
    expect(() => {
      runCli([fixturePath("basic-unused/src"), "--ci"]);
    }).toThrow();
  });
});
