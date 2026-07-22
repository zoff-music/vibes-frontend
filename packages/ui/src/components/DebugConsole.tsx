import { isTruthyFlag } from '@vibes/shared';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from './Button';

type LogLevel = 'log' | 'error' | 'warn' | 'info' | 'debug';

interface LogMessage {
  id: string;
  content: unknown;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  messages: LogMessage[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

interface Props {
  enabled?: boolean;
}

const envDebugEnabled = isTruthyFlag(import.meta.env.VITE_DEBUG);

export const DebugConsole: React.FC<Props> = ({ enabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!envDebugEnabled) return;
    // Check for debug flag in URL OR if enabled prop is true
    const searchParams = new URLSearchParams(window.location.search);
    const debug = searchParams.get('debug') === 'true';

    if (!debug && !enabled) return;

    setIsVisible(true);

    // Patch console methods
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    const addLog = (level: LogLevel, args: unknown[]) => {
      const entry: LogEntry = {
        id: generateId(),
        timestamp: new Date().toLocaleTimeString(),
        level,
        messages: args.map((arg) => ({
          id: generateId(),
          content: arg,
        })),
      };
      setLogs((prev) => [...prev, entry]); // Keep all logs, maybe limit later
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      addLog('log', args);
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog('error', args);
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog('warn', args);
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      addLog('info', args);
    };

    console.debug = (...args) => {
      originalConsole.debug(...args);
      addLog('debug', args);
    };

    // Cleanup
    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
    };
  }, [enabled]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isVisible]); // Add isVisible dependency to ensure scroll on show

  if (!envDebugEnabled || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-[9999] flex h-[50vh] w-full flex-col overflow-hidden border-[#333] border-t-2 bg-black/90 font-mono text-white text-xs">
      <div className="pointer-events-auto flex select-none justify-between bg-[#333] p-1">
        <strong>Debug Console</strong>
        <Button
          onClick={() => setLogs([])}
          variant="destructive"
          className="px-2 py-0.5"
        >
          Clear
        </Button>
      </div>
      <div
        ref={scrollRef}
        className="pointer-events-auto flex-1 overflow-y-auto p-2"
      >
        {logs.map((log) => (
          <div
            key={log.id}
            className={`mb-1 border-[#222] border-b pb-0.5 ${
              log.level === 'error'
                ? 'text-[#ff5555]'
                : log.level === 'warn'
                  ? 'text-[#ffcc00]'
                  : 'text-[#ccc]'
            }`}
          >
            <span className="mr-2 text-[#666]">[{log.timestamp}]</span>
            <span className="mr-2 font-bold uppercase">{log.level}</span>
            <span>
              {log.messages.map((msg) => (
                <span key={msg.id} className="mr-1">
                  {typeof msg.content === 'object'
                    ? JSON.stringify(msg.content, null, 2)
                    : String(msg.content)}
                </span>
              ))}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-[#666] italic">Waiting for logs...</div>
        )}
      </div>
    </div>
  );
};
