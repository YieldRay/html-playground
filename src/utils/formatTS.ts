import ts from "typescript";

export function formatTS(code: string, options: Partial<ts.FormatCodeSettings> = {}): string {
  try {
    const sourceFile = ts.createSourceFile("temp.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    const defaultFormatOptions: ts.FormatCodeSettings = {
      indentSize: 2,
      tabSize: 2,
      convertTabsToSpaces: true,
      insertSpaceAfterCommaDelimiter: true,
      insertSpaceAfterSemicolonInForStatements: true,
      insertSpaceBeforeAndAfterBinaryOperators: true,
      insertSpaceAfterKeywordsInControlFlowStatements: true,
      insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
      placeOpenBraceOnNewLineForFunctions: false,
      placeOpenBraceOnNewLineForControlBlocks: false,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
      insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
      insertSpaceBeforeFunctionParenthesis: false,
      newLineCharacter: "\n",
    };
    const formatOptions: ts.FormatCodeSettings = { ...defaultFormatOptions, ...options };

    const compilerHost: ts.CompilerHost = {
      getSourceFile: (fileName) => {
        if (fileName === "temp.tsx") return sourceFile;
        return undefined;
      },
      writeFile: () => {},
      getCurrentDirectory: () => "",
      getDirectories: () => [],
      fileExists: () => true,
      readFile: () => "",
      getCanonicalFileName: (fileName) => fileName,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => "\n",
      getDefaultLibFileName: () => "lib.d.ts",
    };

    const program = ts.createProgram(
      ["temp.tsx"],
      {
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
      },
      compilerHost
    );

    const languageServiceHost: ts.LanguageServiceHost = {
      getCompilationSettings: () => program.getCompilerOptions(),
      getNewLine: () => "\n",
      getProjectVersion: () => "1",
      getScriptFileNames: () => ["temp.tsx"],
      getScriptKind: () => ts.ScriptKind.TSX,
      getScriptVersion: () => "1",
      getScriptSnapshot: (fileName) => {
        if (fileName === "temp.tsx") {
          return ts.ScriptSnapshot.fromString(code);
        }
        return undefined;
      },
      getCurrentDirectory: () => "",
      getDefaultLibFileName: () => "lib.d.ts",
      fileExists: () => true,
      readFile: () => "",
      readDirectory: () => [],
      getDirectories: () => [],
    };

    const languageService = ts.createLanguageService(languageServiceHost);

    const textChanges = languageService.getFormattingEditsForDocument("temp.tsx", formatOptions);

    let formattedCode = code;

    textChanges
      .sort((a, b) => b.span.start - a.span.start)
      .forEach((change) => {
        const { span, newText } = change;
        formattedCode = formattedCode.slice(0, span.start) + newText + formattedCode.slice(span.start + span.length);
      });

    return formattedCode;
  } catch (error) {
    console.warn("Failed to format code with TypeScript formatter, returning original:", error);
    return code;
  }
}
