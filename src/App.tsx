import "./index.css";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Decode } from "console-feed";
import {
  DownloadIcon,
  BanIcon,
  PanelTopOpenIcon,
  PanelTopCloseIcon,
  Share2Icon,
  PlayIcon,
  BugPlayIcon,
  ExternalLinkIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import { rewriteHTML, rewriteScript } from "./utils/rewriteHTML";
import { downloadFile, debounce } from "./utils/utils";
import { useEncodedState } from "./hooks/useEncodedState";
import { Editor } from "./Editor";
import { ConsolePanel } from "./ConsolePanel";
import { ShareModal } from "./ShareModal";

type Message = ReturnType<typeof Decode>;

export function App({ initialHTML = "" }: { initialHTML?: string }) {
  // State management
  const [htmlCode, setHtmlCode, encodedHash] = useEncodedState(initialHTML);
  const rewrittenCode = useMemo(() => rewriteHTML(htmlCode), [htmlCode]);
  const [consoleMessages, setConsoleMessages] = useState<Message[]>([]);
  const [showConsole, setShowConsole] = useState(true);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Memoized values and callbacks
  const debouncedSetHtmlCode = useMemo(() => debounce((value: string) => setHtmlCode(value), 500), [setHtmlCode]);

  // Utility functions
  const clearConsole = () => setConsoleMessages([]);

  const getIframeDoc = () => {
    if (!iframeRef.current) return null;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    return iframeDoc;
  };

  // Core functionality
  const runCode = () => {
    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;

    clearConsole();

    // Write to iframe
    iframeDoc.open();
    iframeDoc.write(rewrittenCode);
    iframeDoc.close();
  };

  const evalConsole = (js: string) => {
    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;

    iframeDoc.defaultView?.eval(rewriteScript(js));
  };

  // Action handlers
  const downloadCode = () => downloadFile("index.html", rewrittenCode, "text/html");

  const open = () => {
    window.open(`${window.location.origin}${window.location.pathname}#~${encodedHash}`, "_blank");
  };

  const runEruda = async () => {
    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;

    await iframeDoc.defaultView?.eval(/*js*/ `pkg2head("eruda").then(() => {
      eruda.init();
      eruda.show();
    })`);

    setShowConsole(false);
  };

  // Effects
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

  // Auto-run code when rewrittenCode changes
  useEffect(() => {
    runCode();
  }, [rewrittenCode]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 py-1 min-h-[32px]">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <h1 className="text-sm font-semibold text-foreground/90">HTML Playground</h1>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted/80 transition-colors"
            onClick={() => setShowConsole(!showConsole)}
            title={showConsole ? "Hide Console" : "Show Console"}
          >
            {showConsole ? <PanelTopOpenIcon className="h-3.5 w-3.5" /> : <PanelTopCloseIcon className="h-3.5 w-3.5" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted/80 transition-colors"
            onClick={runEruda}
            title="Run Eruda"
          >
            <BugPlayIcon className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted/80 transition-colors"
            onClick={downloadCode}
            title="Download HTML"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
          </Button>

          <ShareModal encodedHash={encodedHash}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted/80 transition-colors"
              title="Share Code"
            >
              <Share2Icon className="h-3.5 w-3.5" />
            </Button>
          </ShareModal>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted/80 transition-colors"
            onClick={open}
            title="Open in New Tab"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </Button>

          <div className="w-px h-3.5 bg-border mx-0.5"></div>

          <Button
            variant="default"
            size="sm"
            className="h-6 px-2.5 bg-primary hover:bg-primary/90 transition-colors"
            onClick={runCode}
            title="Run Code"
          >
            <PlayIcon className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs font-medium">Run</span>
          </Button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50}>
          <Editor value={htmlCode} onUpdate={debouncedSetHtmlCode} className="w-full h-full overflow-auto" />
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

                <div className="flex items-center justify-between border-b px-1 py-0.5 bg-muted/30 min-h-[20px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:text-gray-400"
                    onClick={clearConsole}
                    title="Clear Console"
                  >
                    <BanIcon className="h-2.5 w-2.5" />
                  </Button>

                  <span className="text-[10px] text-muted-foreground">Console</span>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0   hover:text-gray-400"
                    onClick={() => setShowConsole(!showConsole)}
                    title={showConsole ? "Hide Console" : "Show Console"}
                  >
                    {showConsole ? (
                      <PanelTopOpenIcon className="h-2.5 w-2.5" />
                    ) : (
                      <PanelTopCloseIcon className="h-2.5 w-2.5" />
                    )}
                  </Button>
                </div>

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
