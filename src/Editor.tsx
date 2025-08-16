import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useIsDarkTheme } from "@/components/theme-provider";
import type { PrismEditor } from "prism-code-editor";
import type { EditorTheme } from "prism-code-editor/themes";
import { basicEditor, type SetupOptions } from "prism-code-editor/setups";

// Importing Prism grammars
import "prism-code-editor/prism/languages/markup";
import "prism-code-editor/prism/languages/jsx";
import "prism-code-editor/prism/languages/css-extras";

export interface EditorRef {
  setValue: (value: string) => void;
}

export const Editor = forwardRef<
  EditorRef,
  Partial<SetupOptions> & {
    initValue?: string;
    onLoad?: VoidFunction;
  } & React.HTMLAttributes<HTMLDivElement>
>(({ initValue = "", language = "html", onUpdate, onLoad, ...props }, forwardedRef) => {
  const divRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<
    PrismEditor<{
      theme: EditorTheme;
    }>
  >(null);
  const isDarkTheme = useIsDarkTheme();
  const theme = isDarkTheme ? "github-dark" : "github-light";

  useImperativeHandle(
    forwardedRef,
    () => ({
      setValue: (value: string) => {
        const editor = editorRef.current;
        if (editor) {
          editor.setOptions({ value });
        }
      },
    }),
    []
  );

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;
    const editor = basicEditor(
      div,
      {
        value: initValue,
        language,
        theme,
        onUpdate,
      },
      onLoad
    );

    editorRef.current = editor;
    return () => editor.remove();
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.setOptions({
      theme,
      language,
    });
  }, [theme, language]);

  return <div ref={divRef} {...props}></div>;
});
