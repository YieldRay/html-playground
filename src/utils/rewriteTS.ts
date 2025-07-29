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

export function rewriteBareImport(code: string): string {
  try {
    // Parse the code
    const sourceFile = ts.createSourceFile("temp.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    // Transform the AST
    const transformer = createRewriteTransformer(CDN_ORIGIN);
    const result = ts.transform(sourceFile, [transformer]);

    // Generate the code
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      removeComments: false,
    });

    const transformedCode = printer.printFile(result.transformed[0]);

    // Cleanup
    result.dispose();

    // Transpile TSX
    return ts.transpile(transformedCode, {
      target: ts.ScriptTarget.Latest,
      noCheck: true,
      declaration: false,
      jsx: ts.JsxEmit.React,
    });
  } catch (error) {
    console.warn("Failed to parse code with TypeScript AST, returning original:", error);
    return code;
  }
}
