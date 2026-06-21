import {
  Node,
  type Node as MorphNode,
  type Project,
} from "ts-morph";
import type { OrphantsContext, TypeCandidate, UnusedType } from "./types";

function isSameNode(a: MorphNode, b: MorphNode): boolean {
  return a === b || (a.getStart() === b.getStart() && a.getSourceFile() === b.getSourceFile());
}

function isInsideExportDeclaration(node: MorphNode): boolean {
  let current: MorphNode | undefined = node;

  while (current) {
    if (Node.isExportDeclaration(current)) {
      return true;
    }
    current = current.getParent();
  }

  return false;
}

function isDeclarationNode(node: MorphNode, declaration: MorphNode): boolean {
  if (isSameNode(node, declaration)) {
    return true;
  }

  if (Node.isIdentifier(node) && node.getParent() === declaration) {
    return true;
  }

  return false;
}

function getRealReferences(candidate: TypeCandidate): MorphNode[] {
  const declaration = candidate.node;
  const allRefs = declaration.findReferencesAsNodes();

  return allRefs.filter((ref) => {
    if (isDeclarationNode(ref, declaration)) {
      return false;
    }

    if (isInsideExportDeclaration(ref)) {
      return false;
    }

    return true;
  });
}

function getExternalReferences(candidate: TypeCandidate, refs: MorphNode[]): MorphNode[] {
  const declarationFile = candidate.node.getSourceFile();

  return refs.filter((ref) => ref.getSourceFile() !== declarationFile);
}

function hasReExportReference(candidate: TypeCandidate): boolean {
  const declaration = candidate.node;
  const allRefs = declaration.findReferencesAsNodes();

  return allRefs.some((ref) => {
    if (isDeclarationNode(ref, declaration)) {
      return false;
    }
    return isInsideExportDeclaration(ref);
  });
}

function hasDeclarationMerge(candidate: TypeCandidate, project: Project): boolean {
  const name = candidate.name;
  const file = candidate.node.getSourceFile();
  let count = 0;

  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.isDeclarationFile()) {
      continue;
    }

    for (const interfaceDecl of sourceFile.getInterfaces()) {
      if (interfaceDecl.getName() === name) {
        count++;
      }
    }

    for (const moduleDecl of sourceFile.getModules()) {
      if (moduleDecl.getName() === name) {
        count++;
      }
    }

    for (const enumDecl of sourceFile.getEnums()) {
      if (enumDecl.getName() === name && enumDecl !== candidate.node) {
        count++;
      }
    }

    for (const typeAlias of sourceFile.getTypeAliases()) {
      if (typeAlias.getName() === name && typeAlias !== candidate.node) {
        count++;
      }
    }
  }

  if (count > 1) {
    return true;
  }

  if (candidate.kind === "interface") {
    const sameFileInterfaces = file
      .getInterfaces()
      .filter((i) => i.getName() === name);
    if (sameFileInterfaces.length > 1) {
      return true;
    }
  }

  return false;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isUsedInJsDoc(candidate: TypeCandidate, project: Project): boolean {
  const namePattern = new RegExp(
    `(?:@param\\s*\\{[^}]*\\b${escapeRegExp(candidate.name)}\\b|` +
      `@returns?\\s*\\{[^}]*\\b${escapeRegExp(candidate.name)}\\b|` +
      `@type\\s*\\{[^}]*\\b${escapeRegExp(candidate.name)}\\b|` +
      `@typedef\\s+\\{[^}]*\\}\\s+${escapeRegExp(candidate.name)}\\b|` +
      `\\{@link\\s+${escapeRegExp(candidate.name)}\\b)`,
  );

  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.isDeclarationFile()) {
      continue;
    }

    const fullText = sourceFile.getFullText();
    if (namePattern.test(fullText)) {
      return true;
    }
  }

  return false;
}

export function resolveUnusedTypes(
  candidates: TypeCandidate[],
  project: Project,
  context: OrphantsContext,
): UnusedType[] {
  const unused: UnusedType[] = [];

  for (const candidate of candidates) {
    if (!context.includeExported && candidate.isExported) {
      continue;
    }

    if (hasDeclarationMerge(candidate, project)) {
      continue;
    }

    if (hasReExportReference(candidate)) {
      continue;
    }

    if (isUsedInJsDoc(candidate, project)) {
      continue;
    }

    const realRefs = getRealReferences(candidate);

    if (context.includeExported && candidate.isExported) {
      const externalRefs = getExternalReferences(candidate, realRefs);
      if (externalRefs.length === 0) {
        unused.push(toUnusedType(candidate));
      }
      continue;
    }

    if (realRefs.length === 0) {
      unused.push(toUnusedType(candidate));
    }
  }

  return unused.sort((a, b) => {
    if (a.filePath !== b.filePath) {
      return a.filePath.localeCompare(b.filePath);
    }
    return a.line - b.line;
  });
}

function toUnusedType(candidate: TypeCandidate): UnusedType {
  return {
    name: candidate.name,
    kind: candidate.kind,
    filePath: candidate.filePath,
    line: candidate.line,
  };
}

export function findCandidateByUnused(
  candidates: TypeCandidate[],
  unused: UnusedType,
): TypeCandidate | undefined {
  return candidates.find(
    (c) =>
      c.name === unused.name &&
      c.filePath === unused.filePath &&
      c.line === unused.line,
  );
}
