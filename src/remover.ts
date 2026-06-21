import { type SourceFile } from "ts-morph";
import type { Project } from "ts-morph";
import { findCandidateByUnused } from "./resolver";
import type { FixResult, TypeCandidate, TypeDeclarationNode, UnusedType } from "./types";

function removeLeadingComments(node: TypeDeclarationNode): void {
  const sourceFile = node.getSourceFile();
  const fullStart = node.getFullStart();
  const start = node.getStart();

  if (fullStart < start) {
    sourceFile.removeText(fullStart, start);
  }
}

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

    let touched = false;

    for (const candidate of sorted) {
      const node = candidate.node;
      const sourceFile = node.getSourceFile();

      if (sourceFile.isDeclarationFile() || sourceFile.getFilePath().endsWith(".d.ts")) {
        continue;
      }

      removeLeadingComments(node);
      node.remove();
      removedCount++;
      touched = true;
    }

    if (touched) {
      const sourceFile = sorted[0]!.node.getSourceFile();
      collapseExtraBlankLines(sourceFile);
      filesTouched++;
    }
  }

  project.saveSync();

  return { removedCount, filesTouched };
}
