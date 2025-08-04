import { useEffect, useRef } from "react";
import { useIsDarkTheme } from "@/components/theme-provider";
import type { PrismEditor } from "prism-code-editor";
import type { EditorTheme } from "prism-code-editor/themes";
import { basicEditor, type SetupOptions } from "prism-code-editor/setups";

// Importing Prism grammars
import "prism-code-editor/prism/languages/markup";
import "prism-code-editor/prism/languages/jsx";
import "prism-code-editor/prism/languages/css-extras";

export function Editor({
  value = "",
  language = "html",
  onUpdate,
  onLoad,
  className,
}: Partial<SetupOptions> & {
  onLoad?: VoidFunction;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<
    PrismEditor<{
      theme: EditorTheme;
    }>
  >(null);
  const isDarkTheme = useIsDarkTheme();
  const theme = isDarkTheme ? "github-dark" : "github-light";

  useEffect(() => {
    const div = ref.current;
    if (!div) return;
    const editor = basicEditor(
      div,
      {
        value,
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
      value,
    });
  }, [value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.setOptions({
      theme,
    });
  }, [theme]);

  return <div ref={ref} className={className}></div>;
}
