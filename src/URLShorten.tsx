import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link2Icon, CopyIcon, ExternalLinkIcon, CheckIcon } from "lucide-react";
import { copy } from "./utils/utils";

async function short(url: string) {
  const res = await fetch("https://shorta.link", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      url,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to shorten URL: ${res.status} ${res.statusText}`);
  }
  const result: string = await res.text();
  return result;
}

export function URLShorten({ url }: { url: string }) {
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const handleShorten = async () => {
    setIsLoading(true);
    try {
      const shortened = await short(url);
      setShortenedUrl(shortened);
    } catch (error) {
      console.error("Failed to shorten URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shortenedUrl) {
      copy(shortenedUrl);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  const handleOpen = () => {
    if (shortenedUrl) {
      window.open(shortenedUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Auto-shorten when URL changes
  useEffect(() => {
    setShortenedUrl("");
    setCopyStatus("idle");
    handleShorten();
  }, [url]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Original URL:</label>
        <div className="p-3 bg-muted/50 rounded-md text-xs font-mono break-all max-h-32 overflow-y-auto border text-muted-foreground">
          {url}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
            <Link2Icon className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Shortening URL...</span>
          </div>
        ) : shortenedUrl ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shortened URL:</label>
              <div className="space-y-2">
                <div className="p-3 bg-muted/50 rounded-md text-xs font-mono break-all border text-foreground min-h-[2.5rem] flex items-center">
                  {shortenedUrl}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    title={copyStatus === "copied" ? "Copied!" : "Copy shortened URL"}
                    className="flex items-center gap-1.5"
                  >
                    {copyStatus === "copied" ? (
                      <CheckIcon className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5" />
                    )}
                    <span className="text-xs">{copyStatus === "copied" ? "Copied!" : "Copy"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpen}
                    title="Open shortened URL"
                    className="flex items-center gap-1.5"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    <span className="text-xs">Open</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Button onClick={handleShorten} className="w-full" size="sm">
            <Link2Icon className="h-4 w-4 mr-2" />
            Shorten URL
          </Button>
        )}
      </div>
    </div>
  );
}
