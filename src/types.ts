import type {
  EnumDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
} from "ts-morph";

export type TypeKind = "type" | "interface" | "enum";

export type TypeDeclarationNode =
  | TypeAliasDeclaration
  | InterfaceDeclaration
  | EnumDeclaration;

export interface TypeCandidate {
  name: string;
  kind: TypeKind;
  filePath: string;
  line: number;
  node: TypeDeclarationNode;
  isExported: boolean;
}

export interface UnusedType {
  name: string;
  kind: TypeKind;
  filePath: string;
  line: number;
}

export interface OrphantsStats {
  totalTypes: number;
  totalFiles: number;
  unusedCount: number;
  unusedByKind: Record<TypeKind, number>;
}

export interface OrphantsResult {
  stats: OrphantsStats;
  unused: UnusedType[];
  candidates: TypeCandidate[];
}

export interface FixResult {
  removedCount: number;
  filesTouched: number;
}

export interface OrphantsOptions {
  path?: string;
  project?: string;
  fix?: boolean;
  json?: boolean;
  statsOnly?: boolean;
  ignore?: string[];
  includeExported?: boolean;
  ci?: boolean;
}

export interface OrphantsContext {
  rootPath: string;
  tsConfigFilePath: string;
  ignorePatterns: string[];
  includeExported: boolean;
}
