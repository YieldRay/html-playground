import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CopyIcon, CheckIcon, Share2Icon, Link2Icon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";
import { copy } from "./utils/copy";

const CopyButton = ({ url, title, className = "", size = "sm" as const }) => {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

  const handleCopy = async () => {
    await copy(url);
    toast.success("Link copied to clipboard!");
    setCopyStatus("copied");
    setTimeout(() => {
      setCopyStatus("idle");
    }, 2000);
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleCopy}
      title={copyStatus === "copied" ? "Copied!" : title}
      className={cn(`flex items-center gap-1.5`, className)}
    >
      {copyStatus === "copied" ? <CheckIcon className="h-3 w-3 text-green-600" /> : <CopyIcon className="h-3 w-3" />}
      <span className="text-xs">{copyStatus === "copied" ? "Copied!" : "Copy"}</span>
    </Button>
  );
};

async function shortenUrl(url: string) {
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

interface ShareModalProps {
  encodedHash: string;
  children: React.ReactNode;
}

export function ShareModal({ encodedHash, children }: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"view" | "preview">("view");
  const [shortenedUrls, setShortenedUrls] = useState<{ view?: string; preview?: string }>({});
  const [isShortening, setIsShortening] = useState<{ view: boolean; preview: boolean }>({
    view: false,
    preview: false,
  });

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const viewUrl = `${baseUrl}#${encodedHash}`;
  const previewUrl = `${baseUrl}#~${encodedHash}`;

  const handleShorten = async (type: "view" | "preview") => {
    setIsShortening((prev) => ({ ...prev, [type]: true }));
    try {
      const url = type === "view" ? viewUrl : previewUrl;
      const shortened = await shortenUrl(url);
      setShortenedUrls((prev) => ({ ...prev, [type]: shortened }));
    } catch (error) {
      console.error("Failed to shorten URL:", error);
      toast.error("Failed to shorten URL. Please try again.");
    } finally {
      setIsShortening((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleOpen = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when dialog closes
      setShortenedUrls({});
      setIsShortening({ view: false, preview: false });
    }
  };

  const handleTabChange = (tab: "view" | "preview") => {
    setActiveTab(tab);
  };

  const TabButton = ({ tab, label }: { tab: "view" | "preview"; label: string }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {label}
    </button>
  );

  const URLSection = ({ type, url }: { type: "view" | "preview"; url: string }) => {
    const shortened = shortenedUrls[type];
    const isLoading = isShortening[type];

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {type === "view" ? "Editor View URL:" : "Preview URL:"}
            </label>
            <div className="flex gap-2">
              <CopyButton url={url} title="Copy URL" className="h-7" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpen(url)}
                title="Open URL"
                className="flex items-center gap-1.5 h-7"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                <span className="text-xs">Open</span>
              </Button>
            </div>
          </div>
          <div className="px-2 py-1 bg-muted/50 rounded-md text-xs font-mono break-all max-h-20 overflow-y-auto border text-muted-foreground">
            {url}
          </div>
        </div>

        <div className="border-t pt-3">
          {!shortened ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground">Shorten this URL:</div>
              <Button onClick={() => handleShorten(type)} disabled={isLoading} className="w-full" size="sm">
                <Link2Icon className="h-4 w-4 mr-2" />
                {isLoading ? "Shortening..." : "Shorten URL"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Shortened URL:</label>
                <div className="flex gap-2">
                  <CopyButton url={shortened} title="Copy shortened URL" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpen(shortened)}
                    title="Open shortened URL"
                    className="flex items-center gap-1.5 h-7"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                    <span className="text-xs">Open</span>
                  </Button>
                </div>
              </div>
              <div className="p-2 bg-muted/50 rounded-md text-xs font-mono break-all border text-foreground min-h-[2rem] flex items-center">
                {shortened}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2Icon className="h-4 w-4" />
            Share Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
            <TabButton tab="view" label="Editor View" />
            <TabButton tab="preview" label="Preview Only" />
          </div>

          <div className="text-xs text-muted-foreground">
            {activeTab === "view"
              ? "Share the code with the editor visible for collaboration"
              : "Share a clean preview without the editor interface"}
          </div>

          {activeTab === "view" && <URLSection type="view" url={viewUrl} />}
          {activeTab === "preview" && <URLSection type="preview" url={previewUrl} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
