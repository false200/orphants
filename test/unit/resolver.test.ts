import { describe, expect, it } from "vitest";
import { resolveScanRoot } from "../../src/glob";
import { resolveUnusedTypes } from "../../src/resolver";
import { scanSourceFiles } from "../../src/scanner";
import { loadProject, getScannableSourceFiles } from "../../src/project";
import { fixturePath } from "../helpers";

describe("resolver", () => {
  it("marks exported types as used by default", () => {
    const { project, context, scanRoot } = loadProject({
      path: fixturePath("exported-unused/src"),
    });
    const files = getScannableSourceFiles(project, scanRoot, context);
    const candidates = scanSourceFiles(files);
    const unused = resolveUnusedTypes(candidates, project, context);

    expect(unused).toHaveLength(0);
  });

  it("flags exported types when includeExported is enabled", () => {
    const { project, context, scanRoot } = loadProject({
      path: fixturePath("exported-unused/src"),
      includeExported: true,
    });
    const files = getScannableSourceFiles(project, scanRoot, context);
    const candidates = scanSourceFiles(files);
    const unused = resolveUnusedTypes(candidates, project, { ...context, includeExported: true });

    expect(unused.map((u) => u.name)).toEqual(["PublicUnused"]);
  });

  it("throws for missing scan paths", () => {
    expect(() => resolveScanRoot("missing-path-orphants")).toThrow(/does not exist/);
  });
});
