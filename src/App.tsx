import "./index.css";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Decode } from "console-feed";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { DownloadIcon, BanIcon, PanelTopOpenIcon, PanelTopCloseIcon } from "lucide-react";
import { rewriteHTML, rewriteScript } from "./utils/rewriteHTML";
import { downloadFile } from "./utils/utils";
import { Editor } from "./Editor";
import { ConsolePanel } from "./ConsolePanel";
type Message = ReturnType<typeof Decode>;

export function App() {
  const [htmlCode, setHtmlCode] = useState(/* html */ `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
  <button onclick="showConfetti()">Click me!</button>
</body>
<script type="module">
  import confetti from "canvas-confetti@1.6.0"
  globalThis.showConfetti = () => { confetti(); console.log("Confetti!"); }
</script>
</html>`);
  const rewrittenCode = useMemo(() => rewriteHTML(htmlCode), [htmlCode]);
  const [consoleMessages, setConsoleMessages] = useState<Message[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const clearConsole = () => {
    setConsoleMessages([]);
  };

  const runCode = () => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    clearConsole();

    // Write to iframe
    iframeDoc.open();
    iframeDoc.write(rewrittenCode);
    iframeDoc.close();
  };

  const evalConsole = (js: string) => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.defaultView?.eval(rewriteScript(js));
  };

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // check if the message is from the iframe
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (Array.isArray(event.data) && event.data.length > 0) {
        setConsoleMessages((prev) => [...prev, Decode(event.data)]);
      } else {
        // Logic here must sync with `rewriteScript`
        const { method, data } = event.data as { method: Message["method"]; data: any };
        setConsoleMessages((prev) => [
          ...prev,
          {
            method,
            data,
            timestamp: "",
          },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Auto-run code when it changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      runCode();
    }, 500);

    return () => clearTimeout(timer);
  }, [htmlCode]);

  const downloadCode = () => downloadFile("index.html", rewrittenCode, "text/html");

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between border-b p-1">
        <h1 className="text-xl font-bold">HTML Playground</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" className="size-8" onClick={() => setShowConsole(!showConsole)}>
            {showConsole ? <PanelTopOpenIcon /> : <PanelTopCloseIcon />}
          </Button>
          <Button variant="secondary" size="icon" className="size-8" onClick={downloadCode}>
            <DownloadIcon />
          </Button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50}>
          <Editor value={htmlCode} onUpdate={(value) => setHtmlCode(value)} className="w-full h-full overflow-auto" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75} minSize={25}>
              <iframe ref={iframeRef} className="w-full h-full" title="Preview" />
            </ResizablePanel>
            <div className="flex items-center justify-between border-b px-1 py-0.5 bg-muted/30 min-h-[20px]">
              <span className="text-[10px] text-muted-foreground">Console</span>
              <div className="flex gap-0.5">
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={clearConsole}>
                  <BanIcon className="h-2.5 w-2.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setShowConsole(!showConsole)}>
                  {showConsole ? (
                    <PanelTopOpenIcon className="h-2.5 w-2.5" />
                  ) : (
                    <PanelTopCloseIcon className="h-2.5 w-2.5" />
                  )}
                </Button>
              </div>
            </div>
            {showConsole && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25}>
                  <ConsolePanel
                    messages={consoleMessages}
                    onCommand={(command) => {
                      setConsoleMessages((prev) => [
                        ...prev,
                        {
                          method: "command",
                          data: [command],
                          timestamp: "",
                        },
                      ]);
                      evalConsole(command);
                    }}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;
