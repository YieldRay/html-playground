import React, { useState } from "react";
import { HTML_TEMPLATES, type Template } from "@/utils/templates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";

interface TemplatePickerProps {
  onSelectTemplate: (code: string) => void;
}

export function TemplatePicker({ onSelectTemplate }: TemplatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template.code);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted/80 transition-colors"
          title="Load from Template"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a template to get started quickly with your HTML project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 overflow-y-auto max-h-[60vh]">
          {HTML_TEMPLATES.map((template, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleSelectTemplate(template)}
            >
              <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
              <p className="text-muted-foreground text-sm mb-3">
                {template.description}
              </p>
              <div className="bg-muted rounded p-2 text-xs font-mono overflow-hidden">
                <div className="line-clamp-3">
                  {template.code.substring(0, 150)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
