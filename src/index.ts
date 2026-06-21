import { loadProject, getScannableSourceFiles } from "./project";
import { scanSourceFiles, countUniqueFiles } from "./scanner";
import { resolveUnusedTypes } from "./resolver";
import { removeUnusedTypes as removeTypes } from "./remover";
import { buildStats } from "./reporter";
import type { FixResult, OrphantsOptions, OrphantsResult } from "./types";

export async function findUnusedTypes(options: OrphantsOptions = {}): Promise<OrphantsResult> {
  const { project, context, scanRoot } = loadProject({
    path: options.path,
    project: options.project,
    ignore: options.ignore,
    includeExported: options.includeExported,
  });

  const sourceFiles = getScannableSourceFiles(project, scanRoot, context);
  const candidates = scanSourceFiles(sourceFiles);
  const unused = resolveUnusedTypes(candidates, project, context);

  return {
    stats: buildStats(candidates.length, countUniqueFiles(candidates), unused),
    unused,
    candidates,
  };
}

export async function removeUnusedTypes(
  options: OrphantsOptions = {},
): Promise<{ result: OrphantsResult; fixResult: FixResult }> {
  const { project, context, scanRoot } = loadProject({
    path: options.path,
    project: options.project,
    ignore: options.ignore,
    includeExported: options.includeExported,
  });

  const sourceFiles = getScannableSourceFiles(project, scanRoot, context);
  const candidates = scanSourceFiles(sourceFiles);
  const unused = resolveUnusedTypes(candidates, project, context);
  const fixResult = removeTypes(project, candidates, unused);

  const result: OrphantsResult = {
    stats: buildStats(candidates.length, countUniqueFiles(candidates), unused),
    unused,
    candidates,
  };

  return { result, fixResult };
}

export type {
  OrphantsOptions,
  OrphantsResult,
  OrphantsStats,
  UnusedType,
  FixResult,
  TypeKind,
} from "./types";

export { loadProject, getScannableSourceFiles } from "./project";
export { scanSourceFiles } from "./scanner";
export { resolveUnusedTypes } from "./resolver";
export { formatHumanReport, formatJsonReport, formatFixReport } from "./reporter";
