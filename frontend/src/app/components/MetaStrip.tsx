"use client";

import React from "react";
import { CheckCircle, Circle, Clock, FileIcon } from "lucide-react";
import type { TodoItem } from "@/app/types/types";
import { cn } from "@/lib/utils";

export const getStatusIcon = (
  status: TodoItem["status"],
  className?: string
) => {
  switch (status) {
    case "completed":
      return (
        <CheckCircle
          size={16}
          className={cn("text-green-500", className)}
        />
      );
    case "in_progress":
      return (
        <Clock
          size={16}
          className={cn("text-amber-500", className)}
        />
      );
    default:
      return (
        <Circle
          size={16}
          className={cn("text-muted-foreground/50", className)}
        />
      );
  }
};

/** Collapsed tasks/files summary above the composer. */
export function MetaStrip({
  todos,
  pendingCount,
  fileCount,
  metaOpen,
  setMetaOpen,
}: {
  todos: TodoItem[];
  pendingCount: number;
  fileCount: number;
  metaOpen: "tasks" | "files" | null;
  setMetaOpen: React.Dispatch<React.SetStateAction<"tasks" | "files" | null>>;
}) {
  const total = todos.length;
  const done = total - pendingCount;
  const activeTask = todos.find((t) => t.status === "in_progress");
  const allDone = pendingCount === 0;

  const toggle = (panel: "tasks" | "files") =>
    setMetaOpen((prev) => (prev === panel ? null : panel));

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center">
      {total > 0 && (
        <button
          type="button"
          onClick={() => toggle("tasks")}
          className="grid w-full cursor-pointer grid-cols-[auto_auto_1fr] items-center gap-3 px-[18px] py-3 text-left"
          aria-expanded={metaOpen === "tasks"}
        >
          {allDone ? (
            <>
              <CheckCircle
                size={16}
                className="text-green-500"
              />
              <span className="ml-[1px] min-w-0 truncate text-sm">
                All tasks completed
              </span>
            </>
          ) : (
            <>
              <div>{getStatusIcon(activeTask?.status ?? "pending")}</div>
              <span className="ml-[1px] min-w-0 truncate text-sm">
                Task {done} of {total}
              </span>
              {activeTask && (
                <span className="min-w-0 gap-2 truncate text-sm text-muted-foreground">
                  {activeTask.content}
                </span>
              )}
            </>
          )}
        </button>
      )}

      {fileCount > 0 && (
        <button
          type="button"
          onClick={() => toggle("files")}
          className="flex flex-shrink-0 cursor-pointer items-center gap-2 px-[18px] py-3 text-left text-sm"
          aria-expanded={metaOpen === "files"}
        >
          <FileIcon size={16} />
          Files (State)
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
            {fileCount}
          </span>
        </button>
      )}
    </div>
  );
}
