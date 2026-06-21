import { type Project, type SourceFile } from "ts-morph";
import { findCandidateByUnused } from "./resolver";
import type { FixResult, TypeCandidate, UnusedType } from "./types";

function collapseExtraBlankLines(sourceFile: SourceFile): void {
  const text = sourceFile.getFullText();
  const collapsed = text.replace(/\n{3,}/g, "\n\n");

  if (collapsed !== text) {
    sourceFile.replaceText([0, text.length], collapsed);
  }
}

export function removeUnusedTypes(
  project: Project,
  candidates: TypeCandidate[],
  unused: UnusedType[],
): FixResult {
  const nodesToRemove = unused
    .map((item) => findCandidateByUnused(candidates, item))
    .filter((c): c is TypeCandidate => c !== undefined);

  const byFile = new Map<string, TypeCandidate[]>();

  for (const candidate of nodesToRemove) {
    const existing = byFile.get(candidate.filePath) ?? [];
    existing.push(candidate);
    byFile.set(candidate.filePath, existing);
  }

  let removedCount = 0;
  let filesTouched = 0;

  for (const [, fileCandidates] of byFile) {
    const sorted = [...fileCandidates].sort(
      (a, b) => b.node.getStart() - a.node.getStart(),
    );

    if (sorted.length === 0) {
      continue;
    }

    const sourceFile = sorted[0]!.node.getSourceFile();

    if (sourceFile.isDeclarationFile() || sourceFile.getFilePath().endsWith(".d.ts")) {
      continue;
    }

    for (const candidate of sorted) {
      candidate.node.remove();
      removedCount++;
    }

    collapseExtraBlankLines(sourceFile);
    filesTouched++;
  }

  project.saveSync();

  return { removedCount, filesTouched };
}
