import ts from "typescript";
import { CDN_ORIGIN } from "./constants";

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

function createRewriteTransformer(ESM_CDN: string): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    function rewriteSpecifier(specifier: string): string {
      if (specifier.startsWith("npm:")) return specifier.replace(/^npm:/, ESM_CDN + "/");
      if (isBareSpecifier(specifier)) {
        return new URL(specifier, ESM_CDN).toString();
      }
      return specifier;
    }

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
}

// Check if code uses JSX but missing React import
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
      if (specifier === "react" || 
          /^react@/.test(specifier) || 
          specifier.endsWith("/react") || 
          /\/react@/.test(specifier)) {
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
    ts.factory.createImportClause(
      false,
      ts.factory.createIdentifier("React"),
      undefined
    ),
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

export function rewriteBareImport(code: string): string {
  try {
    // Parse code to AST
    let sourceFile = ts.createSourceFile("temp.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    
    // Add React import if needed
    if (needsReactImport(sourceFile)) {
      sourceFile = addReactImport(sourceFile);
    }
    
    // Transform bare imports
    const transformer = createRewriteTransformer(CDN_ORIGIN);
    const result = ts.transform(sourceFile, [transformer]);

    // Generate code
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    });

    const transformedCode = printer.printFile(result.transformed[0]);

    // Cleanup
    result.dispose();

    // Transpile to JS
    return ts.transpile(transformedCode, {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.ESNext,
      noCheck: true,
      declaration: false,
      jsx: ts.JsxEmit.React,
    });
    // .replaceAll(
    //   `import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";`,
    //   `import { jsx as _jsx, jsxs as _jsxs } from "https://esm.sh/react/jsx-runtime";`
    // )
    // .replaceAll(
    //   `import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";`,
    //   `import { jsxDEV as _jsxDEV } from "https://esm.sh/react/jsx-dev-runtime";`
    // );
  } catch (error) {
    console.warn("Failed to parse code with TypeScript AST, returning original:", error);
    return code;
  }
}
