import React, { useEffect, useRef } from "react";
import { Console, Decode } from "console-feed";
import { useIsDarkTheme } from "@/components/theme-provider";
import { InputWithHistory } from "./InputWithHistory";

type Message = ReturnType<typeof Decode>;

interface ConsolePanelProps {
  messages: Message[];
  onCommand: (command: string) => void;
}

export function ConsolePanel({ messages, onCommand }: ConsolePanelProps) {
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  const isDarkTheme = useIsDarkTheme()

  // Auto-scroll console to bottom when new messages arrive
  useEffect(() => {
    if (consoleContainerRef.current) {
      const container = consoleContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full font-mono">
      <div ref={consoleContainerRef} className="flex-1 overflow-auto">
        <Console
          logs={messages as any[]}
          variant={isDarkTheme ? "dark" : undefined}
          styles={{
            fontFamily: "monospace",
          }}
        />
      </div>
      <div className="border-t bg-background px-1 py-0.5">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-blue-500 font-mono font-bold select-none ml-2 mr-3">&gt;</span>
          <InputWithHistory
            className="flex-1 bg-transparent border-none p-0 font-mono text-xs focus-visible:ring-0 focus-visible:outline-none min-h-[16px]"
            placeholder="Console JavaScript here"
            onCommand={(command) => {
              onCommand(command);
            }}
          />
        </div>
      </div>
    </div>
  );
}
