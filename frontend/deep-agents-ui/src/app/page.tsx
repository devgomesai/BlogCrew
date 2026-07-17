"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useQueryState } from "nuqs";
import { getConfig, saveConfig, StandaloneConfig } from "@/lib/config";
import { ConfigDialog } from "@/app/components/ConfigDialog";
import { Button } from "@/components/ui/button";
import { Assistant } from "@langchain/langgraph-sdk";
import { ClientProvider, useClient } from "@/providers/ClientProvider";
import Link from "next/link";
import { Settings, MessagesSquare, SquarePen, Sun, Moon, BookOpen } from "lucide-react";
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

function GeometricLogo() {
  return (
    <div className="flex items-center gap-1">
      <span className="block w-3 h-3 rounded-full bg-[#D02020]" />
      <span className="block w-3 h-3 bg-[#1040C0]" />
      <span
        className="block w-0 h-0"
        style={{
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: "12px solid #F0C020",
        }}
      />
    </div>
  );
}

function BauhausDecoSquares() {
  return (
    <div className="flex gap-1.5">
      <span className="block w-2 h-2 bg-[#D02020]" />
      <span className="block w-2 h-2 bg-[#1040C0]" />
      <span className="block w-2 h-2 bg-[#F0C020]" />
    </div>
  );
}

interface HomePageInnerProps {
  config: StandaloneConfig;
  configDialogOpen: boolean;
  setConfigDialogOpen: (open: boolean) => void;
  handleSaveConfig: (config: StandaloneConfig) => void;
}

function HomePageInner({
  config,
  configDialogOpen,
  setConfigDialogOpen,
  handleSaveConfig,
}: HomePageInnerProps) {
  const client = useClient();
  const [threadId, setThreadId] = useQueryState("threadId");
  const [sidebar, setSidebar] = useQueryState("sidebar");

  const [mutateThreads, setMutateThreads] = useState<(() => void) | null>(null);
  const [interruptCount, setInterruptCount] = useState(0);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const fetchAssistant = useCallback(async () => {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        config.assistantId
      );

    if (isUUID) {
      try {
        const data = await client.assistants.get(config.assistantId);
        setAssistant(data);
      } catch (error) {
        console.error("Failed to fetch assistant:", error);
        setAssistant({
          assistant_id: config.assistantId,
          graph_id: config.assistantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          config: {},
          metadata: {},
          version: 1,
          name: "Assistant",
          context: {},
        });
      }
    } else {
      try {
        const assistants = await client.assistants.search({
          graphId: config.assistantId,
          limit: 100,
        });
        const defaultAssistant = assistants.find(
          (assistant) => assistant.metadata?.["created_by"] === "system"
        );
        if (defaultAssistant === undefined) {
          throw new Error("No default assistant found");
        }
        setAssistant(defaultAssistant);
      } catch (error) {
        console.error(
          "Failed to find default assistant from graph_id: try setting the assistant_id directly:",
          error
        );
        setAssistant({
          assistant_id: config.assistantId,
          graph_id: config.assistantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          config: {},
          metadata: {},
          version: 1,
          name: config.assistantId,
          context: {},
        });
      }
    }
  }, [client, config.assistantId]);

  useEffect(() => {
    fetchAssistant();
  }, [fetchAssistant]);

  useEffect(() => {
    if (sidebar === null) {
      setSidebar("1");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onSave={handleSaveConfig}
        initialConfig={config}
      />
      <div className="flex h-screen flex-col">
        {/* Bauhaus Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b-4 border-black bg-white px-5 dark:bg-[#0a0a0a] dark:border-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <GeometricLogo />
              <h1 className="font-black text-xl uppercase tracking-tighter text-black dark:text-white">
                BlogCrew
              </h1>
              <BauhausDecoSquares />
            </div>
            <Button
              variant="outline"
              size="sm"
              shape="pill"
              onClick={() => setSidebar(sidebar ? null : "1")}
              aria-pressed={!!sidebar}
            >
              <MessagesSquare className="mr-1.5 h-4 w-4" />
              Newsroom
              {interruptCount > 0 && (
                <span className="ml-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#D02020] px-1 text-[10px] text-white font-bold">
                  {interruptCount}
                </span>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black hover:bg-gray-100 transition-colors dark:border-gray-400 dark:hover:bg-white/10"
              aria-label={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
            >
              {mounted ? (theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <span className="block w-3 h-3 bg-black/20 rounded-full dark:bg-white/20" />}
            </button>
            <Link
              href="/blogs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black hover:text-[#D02020] transition-colors dark:text-white dark:hover:text-[#D02020]"
            >
              <BookOpen className="h-4 w-4" />
              Blogs
            </Link>
            <div className="h-5 w-px bg-black dark:bg-gray-500" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfigDialogOpen(true)}
            >
              <Settings className="mr-1.5 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setThreadId(null)}
              disabled={!threadId}
            >
              <SquarePen className="mr-1.5 h-4 w-4" />
              New Story
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden border-black dark:border-gray-500">
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
                  className="relative min-w-[380px] border-r-4 border-black dark:border-gray-500"
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
                <ResizableHandle className="w-1 bg-black dark:bg-gray-500" />
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
    </>
  );
}

function HomePageContent() {
  const [config, setConfig] = useState<StandaloneConfig | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [assistantId, setAssistantId] = useQueryState("assistantId");

  useEffect(() => {
    const savedConfig = getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      if (!assistantId) {
        setAssistantId(savedConfig.assistantId);
      }
    } else {
      setConfigDialogOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (config && !assistantId) {
      setAssistantId(config.assistantId);
    }
  }, [config, assistantId, setAssistantId]);

  const handleSaveConfig = useCallback((newConfig: StandaloneConfig) => {
    saveConfig(newConfig);
    setConfig(newConfig);
  }, []);

  const langsmithApiKey =
    config?.langsmithApiKey || process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || "";

  if (!config) {
    return <BauhausWelcomeScreen
      configDialogOpen={configDialogOpen}
      setConfigDialogOpen={setConfigDialogOpen}
      handleSaveConfig={handleSaveConfig}
    />;
  }

  return (
    <ClientProvider
      deploymentUrl={config.deploymentUrl}
      apiKey={langsmithApiKey}
    >
      <HomePageInner
        config={config}
        configDialogOpen={configDialogOpen}
        setConfigDialogOpen={setConfigDialogOpen}
        handleSaveConfig={handleSaveConfig}
      />
    </ClientProvider>
  );
}

function BauhausWelcomeScreen({
  configDialogOpen,
  setConfigDialogOpen,
  handleSaveConfig,
}: {
  configDialogOpen: boolean;
  setConfigDialogOpen: (open: boolean) => void;
  handleSaveConfig: (config: StandaloneConfig) => void;
}) {
  return (
    <>
      <ConfigDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onSave={handleSaveConfig}
      />
      <div className="relative flex h-screen items-center justify-center bg-[#F0F0F0] overflow-hidden dark:bg-[#0a0a0a]">
        {/* Geometric background decoration */}
        <div className="absolute top-[-10vh] right-[-5vw] w-[50vmin] h-[50vmin] rounded-full border-8 border-black/10 dark:border-white/5" />
        <div className="absolute bottom-[-8vh] left-[-8vw] w-[40vmin] h-[40vmin] border-8 border-black/10 rotate-45 dark:border-white/5" />
        <div
          className="absolute top-[20vh] left-[10vw] w-0 h-0 opacity-10"
          style={{
            borderLeft: "8vmin solid transparent",
            borderRight: "8vmin solid transparent",
            borderBottom: "14vmin solid #121212",
          }}
        />

        <div className="relative text-center">
          <div className="flex justify-center gap-2 mb-6">
            <span className="block w-4 h-4 rounded-full bg-[#D02020]" />
            <span className="block w-4 h-4 bg-[#1040C0]" />
            <span
              className="block w-0 h-0"
              style={{
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: "16px solid #F0C020",
              }}
            />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/50 dark:text-white/50 mb-4">
            A Multi-Agent Press
          </p>
          <h1 className="text-[clamp(3rem,12vw,8rem)] font-black uppercase tracking-tighter leading-[0.85] text-black dark:text-white">
            BlogCrew
          </h1>
          <p className="mt-4 text-lg font-medium text-black/60 dark:text-white/60 max-w-md mx-auto">
            Research, write, edit &amp; illustrate — end to end.
          </p>
          <p className="mt-1 text-sm font-medium text-black/40 dark:text-white/40">
            Configure your LangGraph deployment to get started
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button
              onClick={() => setConfigDialogOpen(true)}
              variant="primary"
              size="lg"
            >
              Open Configuration
            </Button>
            <Link href="/blogs">
              <Button variant="outline" size="lg">
                <BookOpen className="mr-2 h-4 w-4" />
                Read Blogs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#F0F0F0] dark:bg-[#0a0a0a]">
          <div className="text-center">
            <div className="flex justify-center gap-1.5 mb-4">
              <span className="block w-3 h-3 rounded-full bg-[#D02020] animate-pulse" />
              <span className="block w-3 h-3 bg-[#1040C0] animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="block w-3 h-3 rounded-full bg-[#F0C020] animate-pulse" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-black/50 dark:text-white/50">
              Loading BlogCrew...
            </p>
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
