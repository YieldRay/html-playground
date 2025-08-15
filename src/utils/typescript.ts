import ts from "typescript";

export const FILE_NAME = "temp.tsx";

export function createSourceFile(code: string) {
  return ts.createSourceFile(FILE_NAME, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

export function printSourceFile(sourceFile: ts.SourceFile): string {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
  });
  const code: string = printer.printFile(sourceFile);
  // Transpile to JS
  return ts.transpile(code, {
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
}
