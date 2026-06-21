import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  findNearestTsConfig,
  isPathWithinRoot,
  matchGlob,
  resolveScanRoot,
  shouldIgnoreFile,
  toPosixPath,
} from "../../src/glob";
import { fixturePath } from "../helpers";

describe("glob", () => {
  it("matches single segment wildcards", () => {
    expect(matchGlob("*.ts", "index.ts")).toBe(true);
    expect(matchGlob("*.ts", "src/index.ts")).toBe(false);
  });

  it("matches double-star patterns", () => {
    expect(matchGlob("**/legacy/**", "legacy/old.ts")).toBe(true);
    expect(matchGlob("**/legacy/**", "src/index.ts")).toBe(false);
  });

  it("matches question mark patterns", () => {
    expect(matchGlob("file?.ts", "file1.ts")).toBe(true);
    expect(matchGlob("file?.ts", "file10.ts")).toBe(false);
  });

  it("matches bare double-star pattern", () => {
    expect(matchGlob("**", "anything/at/all.ts")).toBe(true);
  });

  it("matches prefix and suffix double-star patterns", () => {
    expect(matchGlob("src/**/index.ts", "src/nested/index.ts")).toBe(true);
    expect(matchGlob("src/**/index.ts", "lib/index.ts")).toBe(false);
  });

  it("matches inline wildcards inside segments", () => {
    expect(matchGlob("file*.ts", "file-test.ts")).toBe(true);
  });

  it("ignores files based on patterns", () => {
    const root = "D:/project";
    expect(shouldIgnoreFile("D:/project/legacy/old.ts", ["**/legacy/**"], root)).toBe(true);
    expect(shouldIgnoreFile("D:/project/src/index.ts", ["**/legacy/**"], root)).toBe(false);
    expect(shouldIgnoreFile("D:/project/src/index.ts", [], root)).toBe(false);
  });

  it("finds tsconfig from a file path", () => {
    const tsconfig = findNearestTsConfig(fixturePath("basic-unused/src/index.ts"));
    expect(tsconfig).toContain("basic-unused");
  });

  it("throws when tsconfig cannot be found", () => {
    const tempDir = mkdtempSync(join(tmpdir(), "orphants-no-tsconfig-"));
    try {
      expect(() => findNearestTsConfig(tempDir)).toThrow(/Could not find tsconfig.json/);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("throws when start path does not exist", () => {
    expect(() => findNearestTsConfig("missing-orphants-path")).toThrow(/does not exist/);
  });

  it("resolves default scan root to cwd", () => {
    expect(resolveScanRoot(undefined)).toBe(process.cwd());
  });

  it("checks path containment and posix conversion", () => {
    const root = fixturePath("basic-unused");
    const file = fixturePath("basic-unused/src/index.ts");
    expect(isPathWithinRoot(file, root)).toBe(true);
    expect(isPathWithinRoot(root, root)).toBe(true);
    expect(toPosixPath("src\\index.ts")).toBe("src/index.ts");
    expect(toPosixPath(fixturePath("basic-unused"))).toContain("/");
  });
});
