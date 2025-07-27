import React, { useRef, type KeyboardEvent } from "react";

interface InputWithHistoryProps {
  className?: string;
  onCommand?: (command: string) => void;
  placeholder?: string;
}

export function InputWithHistory({ className, onCommand, placeholder }: InputWithHistoryProps) {
  const commandHistoryRef = useRef<string[]>([]);
  const commandHistoryIndexRef = useRef(0);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const input = e.target as HTMLInputElement;
      const command = input.value.trim();
      if (command) {
        commandHistoryRef.current.push(command);
        commandHistoryIndexRef.current = commandHistoryRef.current.length;
        onCommand?.(command);
      }
      input.value = "";
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
  };

  return <input className={className} placeholder={placeholder} onKeyDown={handleKeyDown} />;
}
