import "./index.css";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Decode } from "console-feed";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DownloadIcon,
  BanIcon,
  PanelTopOpenIcon,
  PanelTopCloseIcon,
  Share2Icon,
  PlayIcon,
  BugPlayIcon,
  ExternalLinkIcon,
  Link2Icon,
} from "lucide-react";
import { rewriteHTML, rewriteScript } from "./utils/rewriteHTML";
import { downloadFile, utoa, copy } from "./utils/utils";
import { Editor } from "./Editor";
import { ConsolePanel } from "./ConsolePanel";
import { URLShorten } from "./URLShorten";

type Message = ReturnType<typeof Decode>;

export function App({ initialHTML = "" }: { initialHTML?: string }) {
  const [htmlCode, setHtmlCode] = useState(initialHTML);
  const rewrittenCode = useMemo(() => rewriteHTML(htmlCode), [htmlCode]);
  const [consoleMessages, setConsoleMessages] = useState<Message[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const [showUrlShorten, setShowUrlShorten] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const clearConsole = () => {
    setConsoleMessages([]);
  };

  const getIframeDoc = () => {
    if (!iframeRef.current) return null;
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    return iframeDoc;
  };

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
      // Set location hash to encoded HTML
      const encoded = utoa(htmlCode);
      window.location.hash = encoded;
    }, 500);

    return () => clearTimeout(timer);
  }, [htmlCode]);

  const downloadCode = () => downloadFile("index.html", rewrittenCode, "text/html");

  const shareCode = () => {
    const encoded = utoa(rewrittenCode);
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    copy(url);
    toast.success("Link copied to clipboard!");
  };

  const open = () => {
    const hash = window.location.hash.slice(1);
    window.open(`${window.location.origin}${window.location.pathname}#~${hash}`, "_blank");
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

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted/80 transition-colors"
            onClick={shareCode}
            title="Share Code"
          >
            <Share2Icon className="h-3.5 w-3.5" />
          </Button>

          <Dialog open={showUrlShorten} onOpenChange={setShowUrlShorten}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted/80 transition-colors"
                title="Shorten URL"
              >
                <Link2Icon className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>URL Shortener</DialogTitle>
              </DialogHeader>
              <URLShorten 
                url={`${window.location.origin}${window.location.pathname}#${utoa(rewrittenCode)}`} 
              />
            </DialogContent>
          </Dialog>

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
