"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles, Globe, PenLine, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubAgent } from "@/app/types/types";

interface SubAgentIndicatorProps {
  subAgent: SubAgent;
  onClick: () => void;
  isExpanded?: boolean;
}

const PIPELINE_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  "planner-agent": {
    icon: Sparkles,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    label: "Planner",
  },
  "researcher-agent": {
    icon: Globe,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "Researcher",
  },
  "writer-agent": {
    icon: PenLine,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    label: "Writer",
  },
  "editor-agent": {
    icon: CheckSquare,
    color: "text-violet-700 dark:text-violet-300",
    bgColor: "bg-violet-200 dark:bg-violet-900/40",
    label: "Editor",
  },
  "humanizer-agent": {
    icon: PenLine,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    label: "Humanizer",
  },
};

const PIPELINE_ORDER = ["planner-agent", "researcher-agent", "writer-agent", "editor-agent", "humanizer-agent"];

export const SubAgentIndicator = React.memo<SubAgentIndicatorProps>(
  ({ subAgent, onClick, isExpanded = true }) => {
    const config = PIPELINE_CONFIG[subAgent.subAgentName] || {
      icon: Sparkles,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      label: subAgent.subAgentName,
    };
    const Icon = config.icon;

    const currentIndex = PIPELINE_ORDER.indexOf(subAgent.subAgentName);

    const isActive = subAgent.status === "active";
    const isCompleted = subAgent.status === "completed";

    return (
      <div className="w-full max-w-full overflow-hidden rounded-lg border border-border/60 bg-card shadow-xs outline-none">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          className="flex w-full items-center justify-between gap-2 border-none px-4 py-2.5 text-left shadow-none outline-none transition-colors duration-200 hover:bg-accent/50"
        >
          <div className="flex w-full items-center gap-3">
            {/* Pipeline indicator dots */}
            <div className="flex items-center gap-1.5">
              {PIPELINE_ORDER.map((agent, i) => {
                const agentConfig = PIPELINE_CONFIG[agent];
                const AgentIcon = agentConfig.icon;
                const isPast = i < currentIndex || (currentIndex === -1 && isCompleted);
                const isCurrent = i === currentIndex;
                const isFuture = i > currentIndex;
                return (
                  <div
                    key={agent}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300",
                      isPast && isCompleted ? "bg-green-500 text-white" : "",
                      isPast && !isCompleted ? "text-muted-foreground" : "",
                      isCurrent && isActive ? `${agentConfig.bgColor} ${agentConfig.color} ring-2 ring-offset-1 ring-offset-card` : "",
                      isCurrent && !isActive ? `${agentConfig.bgColor} ${agentConfig.color}` : "",
                      isFuture ? "bg-muted text-muted-foreground/40" : ""
                    )}
                  >
                    <AgentIcon className="h-3 w-3" />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-0.5", config.bgColor)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
                <span className={cn("text-xs font-semibold tracking-wide", config.color)}>
                  {config.label}
                </span>
              </div>
              {(isActive) && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2F6868]" />
                  Working...
                </span>
              )}
            </div>
          </div>

          {isExpanded ? (
            <ChevronUp size={14} className="shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
          )}
        </Button>
      </div>
    );
  }
);

SubAgentIndicator.displayName = "SubAgentIndicator";
