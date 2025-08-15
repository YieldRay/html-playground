import ts from "typescript";
import { CDN_ORIGIN } from "./constants";
import { createSourceFile, printSourceFile } from "./typescript";

/**
 * Check if an import specifier is a bare specifier (not relative/absolute or URL)
 */
function isBareSpecifier(specifier: string) {
  // check if is relative or absolute path
  if (specifier.match(/^\.*\//)) return false;

  try {
    // check if contains protocol
    new URL(specifier);
    return false;
  } catch {
    return true;
  }
}

/**
 * Create a transformer to rewrite bare imports to ESM CDN
 */
function createRewriteBareImportTransformer(ESM_CDN: string): ts.TransformerFactory<ts.SourceFile> {
  function rewriteSpecifier(specifier: string): string {
    if (specifier.startsWith("npm:")) return specifier.replace(/^npm:/, ESM_CDN + "/");
    if (isBareSpecifier(specifier)) {
      return new URL(specifier, ESM_CDN).toString();
    }
    return specifier;
  }

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context: ts.TransformationContext) => {
    function visitNode(node: ts.Node): ts.Node {
      // Static Import
      if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const newSpecifier = rewriteSpecifier(node.moduleSpecifier.text);
        if (newSpecifier !== node.moduleSpecifier.text) {
          return ts.factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            ts.factory.createStringLiteral(newSpecifier),
            node.assertClause
          );
        }
      }

      // Dynamic Import
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const firstArg = node.arguments[0];
        if (firstArg && ts.isStringLiteral(firstArg)) {
          const newSpecifier = rewriteSpecifier(firstArg.text);
          if (newSpecifier !== firstArg.text) {
            return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [
              ts.factory.createStringLiteral(newSpecifier),
              ...node.arguments.slice(1),
            ]);
          }
        }
      }

      // Export ... from
      if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const newSpecifier = rewriteSpecifier(node.moduleSpecifier.text);
        if (newSpecifier !== node.moduleSpecifier.text) {
          return ts.factory.updateExportDeclaration(
            node,
            node.modifiers,
            node.isTypeOnly,
            node.exportClause,
            ts.factory.createStringLiteral(newSpecifier),
            node.assertClause
          );
        }
      }

      return ts.visitEachChild(node, visitNode, context);
    }

    return (sourceFile: ts.SourceFile) => ts.visitNode(sourceFile, visitNode) as ts.SourceFile;
  };

  return transformer;
}

/**
 * Check if code uses JSX but missing React import
 */
function needsReactImport(sourceFile: ts.SourceFile): boolean {
  let hasJSX = false;
  let hasReactVariable = false;

  function visitNode(node: ts.Node): void {
    // Check JSX elements
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
      hasJSX = true;
    }

    // Check if React variable exists at module top level
    if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      if (node.importClause) {
        // Default import: import React from 'xxx'
        if (node.importClause.name?.text === "React") {
          hasReactVariable = true;
        }
        // Namespace import: import * as React from 'xxx'
        if (node.importClause.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
          if (node.importClause.namedBindings.name.text === "React") {
            hasReactVariable = true;
          }
        }
      }
    }

    // Check React variable declarations: const React = ...
    if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
      if (node.name.text === "React") {
        hasReactVariable = true;
      }
    }

    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);
  return hasJSX && !hasReactVariable;
}

// Add React import at module top
function addReactImport(sourceFile: ts.SourceFile): ts.SourceFile {
  // Find existing react import to use same specifier
  let reactSpecifier = "react";

  function findReactSpecifier(node: ts.Node): void {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      // Match: "react", "react@xxx", "*/react", "*/react@xxx"
      if (
        specifier === "react" ||
        /^react@/.test(specifier) ||
        specifier.endsWith("/react") ||
        /\/react@/.test(specifier)
      ) {
        reactSpecifier = specifier;
        return;
      }
    }
    ts.forEachChild(node, findReactSpecifier);
  }

  findReactSpecifier(sourceFile);

  // Create: import React from "react" (or found specifier);
  const reactImport = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier("React"), undefined),
    ts.factory.createStringLiteral(reactSpecifier),
    undefined
  );

  const statements = [reactImport, ...sourceFile.statements];

  return ts.factory.updateSourceFile(
    sourceFile,
    statements,
    sourceFile.isDeclarationFile,
    sourceFile.referencedFiles,
    sourceFile.typeReferenceDirectives,
    sourceFile.hasNoDefaultLib,
    sourceFile.libReferenceDirectives
  );
}

/**
 * @type ts.TransformerFactory<ts.SourceFile>
 * Unused function that can remove export keywords and export statements.
 * Since it's valid to use export keyword in <script type="module">, this is not used.
 */
function removeExportsTransformer(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
  function visitNode(node: ts.Node): ts.Node | ts.Node[] | undefined {
    // Handle export function declarations
    if (ts.isFunctionDeclaration(node) && node.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      const isDefaultExport = node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.DefaultKeyword);

      if (isDefaultExport) {
        // export default function -> function default$Math.random
        const randomName = `default$${Math.random().toString(36).slice(2)}`;
        return ts.factory.createFunctionDeclaration(
          node.modifiers?.filter(
            (mod) => mod.kind !== ts.SyntaxKind.ExportKeyword && mod.kind !== ts.SyntaxKind.DefaultKeyword
          ),
          node.asteriskToken,
          ts.factory.createIdentifier(randomName),
          node.typeParameters,
          node.parameters,
          node.type,
          node.body
        );
      } else {
        // export function name(){} -> function name(){}
        return ts.factory.createFunctionDeclaration(
          node.modifiers?.filter((mod) => mod.kind !== ts.SyntaxKind.ExportKeyword),
          node.asteriskToken,
          node.name,
          node.typeParameters,
          node.parameters,
          node.type,
          node.body
        );
      }
    }

    // Handle export variable declarations
    if (ts.isVariableStatement(node) && node.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      return ts.factory.createVariableStatement(
        node.modifiers?.filter((mod) => mod.kind !== ts.SyntaxKind.ExportKeyword),
        node.declarationList
      );
    }

    // Handle export class declarations
    if (ts.isClassDeclaration(node) && node.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      const isDefaultExport = node.modifiers.some((mod) => mod.kind === ts.SyntaxKind.DefaultKeyword);

      if (isDefaultExport) {
        const randomName = `default$${Math.random().toString(36).slice(2)}`;
        return ts.factory.createClassDeclaration(
          node.modifiers?.filter(
            (mod) => mod.kind !== ts.SyntaxKind.ExportKeyword && mod.kind !== ts.SyntaxKind.DefaultKeyword
          ),
          ts.factory.createIdentifier(randomName),
          node.typeParameters,
          node.heritageClauses,
          node.members
        );
      } else {
        return ts.factory.createClassDeclaration(
          node.modifiers?.filter((mod) => mod.kind !== ts.SyntaxKind.ExportKeyword),
          node.name,
          node.typeParameters,
          node.heritageClauses,
          node.members
        );
      }
    }

    // Handle export {} - remove entirely
    if (ts.isExportDeclaration(node) && !node.moduleSpecifier) {
      return undefined;
    }

    // Handle export ... from "module" - remove entirely
    if (ts.isExportDeclaration(node)) {
      return undefined;
    }

    return ts.visitEachChild(node, visitNode, context);
  }

  return (sourceFile: ts.SourceFile) => {
    const visited = ts.visitNode(sourceFile, visitNode) as ts.SourceFile;
    // Filter out undefined nodes
    const statements = visited.statements.filter((stmt) => stmt !== undefined);
    return ts.factory.updateSourceFile(
      visited,
      statements,
      visited.isDeclarationFile,
      visited.referencedFiles,
      visited.typeReferenceDirectives,
      visited.hasNoDefaultLib,
      visited.libReferenceDirectives
    );
  };
}

export function rewriteBareImport(code: string): string {
  try {
    // Parse code to AST
    let sourceFile: ts.SourceFile = createSourceFile(code);

    // Add React import if needed
    if (needsReactImport(sourceFile)) {
      sourceFile = addReactImport(sourceFile);
    }

    // Transform
    const transformers: ts.TransformerFactory<ts.SourceFile>[] = [createRewriteBareImportTransformer(CDN_ORIGIN)];
    const result: ts.TransformationResult<ts.SourceFile> = ts.transform(sourceFile, transformers);
    const sourceFile2 = result.transformed[0];
    result.dispose();

    return printSourceFile(sourceFile2);
  } catch (error) {
    console.warn("Failed to parse code with TypeScript AST, returning original:", error);
    return code;
  }
}
