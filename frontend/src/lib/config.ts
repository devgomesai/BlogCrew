export interface StandaloneConfig {
  deploymentUrl: string;
  assistantId: string;
}

// ponytail: no API key here on purpose. Anything NEXT_PUBLIC_* ships to the
// browser in plaintext. `langgraph dev` needs no auth; if this is ever pointed
// at a deployed LangGraph, proxy it through a route handler that reads
// process.env.LANGSMITH_API_KEY server-side.
export function getConfig(): StandaloneConfig | null {
  const deploymentUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_URL;
  const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID;

  if (!deploymentUrl || !assistantId) return null;

  return { deploymentUrl, assistantId };
}
