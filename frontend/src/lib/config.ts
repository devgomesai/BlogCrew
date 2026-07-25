export interface StandaloneConfig {
  deploymentUrl: string;
  assistantId: string;
  langsmithApiKey?: string;
}

export function getConfig(): StandaloneConfig | null {
  const deploymentUrl = process.env.NEXT_PUBLIC_DEPLOYMENT_URL;
  const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID;

  if (!deploymentUrl || !assistantId) return null;

  return {
    deploymentUrl,
    assistantId,
    langsmithApiKey: process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || undefined,
  };
}
