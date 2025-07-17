import "./index.css";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Console, Decode } from "console-feed";
import { Button } from "./components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { DownloadIcon } from "lucide-react";
import { rewriteHTML, rewriteScript } from "./utils/rewriteHTML";
import { downloadFile } from "./utils/utils";
import { Editor } from "./Editor";
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
  const commandHistoryRef = useRef<string[]>([]);
  const commandHistoryIndexRef = useRef(0);
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
          <Button variant="secondary" size="icon" className="size-8" onClick={downloadCode}>
            <DownloadIcon />
          </Button>

          <Button size="sm" onClick={clearConsole}>
            Clear Console
          </Button>
          <Button size="sm" onClick={() => setShowConsole(!showConsole)}>
            {showConsole ? "Hide Console" : "Show Console"}
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
            {showConsole && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25}>
                  <div className="flex flex-col h-full font-mono">
                    <div className="flex-1 overflow-auto">
                      <Console
                        logs={consoleMessages as any[]}
                        // variant="dark"
                        styles={{
                          fontFamily: "monospace",
                        }}
                      />
                    </div>
                    <div className="p-[2px]">
                      <Input
                        className="p-1 h-6 rounded-sm focus-visible:ring-[1px]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            const textarea = e.target as HTMLTextAreaElement;
                            const command = textarea.value.trim();
                            if (command) {
                              commandHistoryRef.current.push(command);
                              commandHistoryIndexRef.current = commandHistoryRef.current.length;
                              setConsoleMessages((prev) => [
                                ...prev,
                                {
                                  method: "command",
                                  data: [command],
                                  timestamp: "",
                                },
                              ]);
                              evalConsole(command);
                            }
                            textarea.value = "";
                          }

                          if (e.key === "ArrowUp") {
                            e.preventDefault();
                            if (commandHistoryRef.current.length === 0) return;
                            if (commandHistoryIndexRef.current > 0) {
                              commandHistoryIndexRef.current--;
                            }
                            const command = commandHistoryRef.current[commandHistoryIndexRef.current];
                            (e.target as HTMLInputElement).value = command || "";
                          }

                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            if (commandHistoryRef.current.length === 0) return;
                            if (commandHistoryIndexRef.current < commandHistoryRef.current.length) {
                              commandHistoryIndexRef.current++;
                            }
                            const command = commandHistoryRef.current[commandHistoryIndexRef.current];
                            (e.target as HTMLInputElement).value = command || "";
                          }
                        }}
                      />
                    </div>
                  </div>
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
