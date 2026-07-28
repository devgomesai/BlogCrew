"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useQueryState } from "nuqs";
import { getConfig, StandaloneConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Assistant } from "@langchain/langgraph-sdk";
import { ClientProvider, useClient } from "@/providers/ClientProvider";
import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { MessagesSquare, SquarePen, Sun, Moon, BookOpen } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ThreadList } from "@/app/components/ThreadList";
import { ChatProvider } from "@/providers/ChatProvider";
import { ChatInterface } from "@/app/components/ChatInterface";
import { useTheme } from "@/providers/ThemeProvider";

const SUGGESTED_TOPICS = [
  "Explain machine learning in simple terms for beginners",
  "The future of remote work in 2026",
  "How to build a personal brand as a developer",
  "Why Rust is gaining popularity among systems programmers",
  "Climate tech startups to watch this year",
  "A practical guide to Kubernetes for small teams",
];

function WorkshopPageInner({ config }: { config: StandaloneConfig }) {
  const client = useClient();
  const [threadId, setThreadId] = useQueryState("threadId");
  const [sidebar, setSidebar] = useQueryState("sidebar", { defaultValue: "1" });

  const [mutateThreads, setMutateThreads] = useState<(() => void) | null>(null);
  const [interruptCount, setInterruptCount] = useState(0);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const fetchAssistant = useCallback(async () => {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        config.assistantId
      );

    // No fake-Assistant fallback: a misconfigured NEXT_PUBLIC_ASSISTANT_ID used
    // to look fine here and only fail on the first message. Surface it now.
    try {
      if (isUUID) {
        setAssistant(await client.assistants.get(config.assistantId));
        return;
      }
      const assistants = await client.assistants.search({
        graphId: config.assistantId,
        limit: 100,
      });
      const defaultAssistant = assistants.find(
        (assistant) => assistant.metadata?.["created_by"] === "system"
      );
      if (!defaultAssistant) {
        throw new Error(`No assistant found for graph "${config.assistantId}"`);
      }
      setAssistant(defaultAssistant);
    } catch (error) {
      console.error("Failed to load assistant:", error);
      setAssistantError(
        error instanceof Error ? error.message : "Failed to load assistant"
      );
    }
  }, [client, config.assistantId]);

  useEffect(() => {
    fetchAssistant();
  }, [fetchAssistant]);

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background px-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Logo height={24} />
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebar(sidebar ? null : "1")}
            aria-pressed={!!sidebar}
          >
            <MessagesSquare className="mr-1.5 h-4 w-4" />
            Threads
            {interruptCount > 0 && (
              <span className="ml-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                {interruptCount}
              </span>
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
            aria-label={
              mounted
                ? theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
                : "Toggle theme"
            }
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <span className="block h-4 w-4 rounded bg-muted-foreground/20" />
            )}
          </button>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            Blogs
          </Link>
          <div className="h-5 w-px bg-border" />
          <Button
            variant="default"
            size="sm"
            onClick={() => setThreadId(null)}
            disabled={!threadId}
          >
            <SquarePen className="mr-1.5 h-4 w-4" />
            New Thread
          </Button>
        </div>
      </header>

      {assistantError && (
        <div
          role="alert"
          className="border-b border-destructive/40 bg-destructive/10 px-5 py-2 text-sm text-destructive"
        >
          Could not load assistant <code>{config.assistantId}</code>:{" "}
          {assistantError}. Check <code>NEXT_PUBLIC_ASSISTANT_ID</code> and that
          the backend is running.
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId="standalone-chat"
        >
          {sidebar && (
            <>
              <ResizablePanel
                id="thread-history"
                order={1}
                defaultSize={25}
                minSize={20}
                className="relative min-w-[380px] border-r border-border"
              >
                <ThreadList
                  onThreadSelect={async (id) => {
                    await setThreadId(id);
                  }}
                  onMutateReady={(fn) => setMutateThreads(() => fn)}
                  onClose={() => setSidebar(null)}
                  onInterruptCountChange={setInterruptCount}
                />
              </ResizablePanel>
              <ResizableHandle className="w-px bg-border" />
            </>
          )}

          <ResizablePanel
            id="chat"
            className="relative flex flex-col"
            order={2}
          >
            <ChatProvider
              activeAssistant={assistant}
              onHistoryRevalidate={() => mutateThreads?.()}
            >
              <ChatInterface
                assistant={assistant}
                suggestedTopics={SUGGESTED_TOPICS}
              />
            </ChatProvider>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

function WorkshopPageContent() {
  const [assistantId, setAssistantId] = useQueryState("assistantId");
  const config = getConfig();

  useEffect(() => {
    if (config && !assistantId) {
      setAssistantId(config.assistantId);
    }
  }, [config, assistantId, setAssistantId]);

  if (!config) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md px-6 text-center">
          <Link
            href="/blogs"
            className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
          >
            <Logo height={28} />
          </Link>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            A Multi-Agent Press
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            BlogCrew
          </h1>
          <p className="mt-3 text-muted-foreground">
            Research, write, edit &amp; illustrate — end to end.
          </p>
          <p className="mt-1 text-sm text-destructive">
            Missing configuration. Set <code>NEXT_PUBLIC_DEPLOYMENT_URL</code>{" "}
            and <code>NEXT_PUBLIC_ASSISTANT_ID</code> in <code>.env</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClientProvider deploymentUrl={config.deploymentUrl}>
      <WorkshopPageInner config={config} />
    </ClientProvider>
  );
}

export default function WorkshopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-lg font-bold text-primary">BC</span>
            </div>
            <p className="text-sm text-muted-foreground">Loading BlogCrew...</p>
          </div>
        </div>
      }
    >
      <WorkshopPageContent />
    </Suspense>
  );
}
