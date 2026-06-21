import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { findNearestTsConfig, resolveScanRoot } from "../../src/glob";
import { loadProject, getScannableSourceFiles } from "../../src/project";
import { fixturePath } from "../helpers.js";

describe("project bootstrap", () => {
  it("finds nearest tsconfig from a subdirectory", () => {
    const tsconfig = findNearestTsConfig(fixturePath("basic-unused/src"));
    expect(tsconfig.endsWith("basic-unused\\tsconfig.json") || tsconfig.endsWith("basic-unused/tsconfig.json")).toBe(true);
  });

  it("throws when path does not exist", () => {
    expect(() => resolveScanRoot("definitely-not-a-path")).toThrow(/does not exist/);
  });

  it("loads project and filters scannable files", () => {
    const { project, context, scanRoot } = loadProject({
      path: fixturePath("ignore-glob"),
      ignore: ["**/legacy/**"],
    });

    const files = getScannableSourceFiles(project, scanRoot, context);
    const paths = files.map((f) => f.getFilePath());
    expect(paths.some((p) => p.includes("legacy"))).toBe(false);
    expect(paths.some((p) => p.includes("src"))).toBe(true);
  });

  it("scopes scanning to a single file path", () => {
    const filePath = fixturePath("basic-unused/src/index.ts");
    const { project, context, scanRoot } = loadProject({
      path: filePath,
    });

    const files = getScannableSourceFiles(project, scanRoot, context);
    expect(files).toHaveLength(1);
    expect(resolve(files[0]?.getFilePath() ?? "")).toBe(resolve(filePath));
  });
});
