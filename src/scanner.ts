import {
  Node,
  SyntaxKind,
  type SourceFile,
} from "ts-morph";
import type { TypeCandidate, TypeKind } from "./types";

function getKind(node: { getKind: () => SyntaxKind }): TypeKind {
  switch (node.getKind()) {
    case SyntaxKind.TypeAliasDeclaration:
      return "type";
    case SyntaxKind.InterfaceDeclaration:
      return "interface";
    case SyntaxKind.EnumDeclaration:
      return "enum";
    default:
      return "type";
  }
}

export function scanSourceFiles(sourceFiles: SourceFile[]): TypeCandidate[] {
  const candidates: TypeCandidate[] = [];

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();

    for (const typeAlias of sourceFile.getTypeAliases()) {
      if (!Node.isReferenceFindable(typeAlias)) {
        continue;
      }

      candidates.push({
        name: typeAlias.getName(),
        kind: getKind(typeAlias),
        filePath,
        line: typeAlias.getStartLineNumber(),
        node: typeAlias,
        isExported: Node.isExportable(typeAlias) ? typeAlias.isExported() : false,
      });
    }

    for (const interfaceDecl of sourceFile.getInterfaces()) {
      if (!Node.isReferenceFindable(interfaceDecl)) {
        continue;
      }

      candidates.push({
        name: interfaceDecl.getName(),
        kind: getKind(interfaceDecl),
        filePath,
        line: interfaceDecl.getStartLineNumber(),
        node: interfaceDecl,
        isExported: Node.isExportable(interfaceDecl) ? interfaceDecl.isExported() : false,
      });
    }

    for (const enumDecl of sourceFile.getEnums()) {
      if (!Node.isReferenceFindable(enumDecl)) {
        continue;
      }

      candidates.push({
        name: enumDecl.getName(),
        kind: getKind(enumDecl),
        filePath,
        line: enumDecl.getStartLineNumber(),
        node: enumDecl,
        isExported: Node.isExportable(enumDecl) ? enumDecl.isExported() : false,
      });
    }
  }

  return candidates;
}

export function countUniqueFiles(candidates: TypeCandidate[]): number {
  return new Set(candidates.map((c) => c.filePath)).size;
}
