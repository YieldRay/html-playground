import ts from "typescript";
import { FILE_NAME, createSourceFile } from "./typescript";

export function formatTS(code: string, options: Partial<ts.FormatCodeSettings> = {}): string {
  try {
    const sourceFile = createSourceFile(code);

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
        if (fileName === FILE_NAME) return sourceFile;
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
      [FILE_NAME],
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
      getScriptFileNames: () => [FILE_NAME],
      getScriptKind: () => ts.ScriptKind.TSX,
      getScriptVersion: () => "1",
      getScriptSnapshot: (fileName) => {
        if (fileName === FILE_NAME) {
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

    const textChanges = languageService.getFormattingEditsForDocument(FILE_NAME, formatOptions);

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
