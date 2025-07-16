import { basicEditor, type SetupOptions } from "prism-code-editor/setups";
// Importing Prism grammars
import "prism-code-editor/prism/languages/markup";

import { useEffect, useRef } from "react";
type PrismEditor = ReturnType<typeof basicEditor>;

export function Editor({
  value = "",
  language = "html",
  theme = "github-light",
  onLoad,
  className,
  ...props
}: Partial<SetupOptions> & {
  onLoad?: VoidFunction;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<PrismEditor>(null);

  useEffect(() => {
    const div = ref.current;
    if (!div) return;
    editorRef.current = basicEditor(
      div,
      {
        value,
        language,
        theme,
        ...props,
      },
      onLoad
    );
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.setOptions({
      value,
    });
  }, [value]);

  return <div ref={ref} className={className}></div>;
}
