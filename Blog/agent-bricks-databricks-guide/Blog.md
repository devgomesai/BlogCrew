## Agent Bricks, reviewed honestly: where Databricks' agent platform wins, where it costs you, and how to choose


AstraZeneca parsed more than 400,000 clinical trial documents in under an hour. No code. No fine-tuning. That single line from Databricks' June 2025 launch made Agent Bricks the most talked about addition to the Mosaic AI stack, and the most argued about.

If you build AI agents for a living, you've probably heard two opposing takes in the same week. Some teams say Agent Bricks shipped them into production faster than anything they've used. Others say it's a platform play dressed up as productivity, and the lock-in will sting later. Both reactions are real. The product is genuinely useful for a specific shape of problem, and genuinely mediocre for everything else.

This guide is for the engineer or architect who has to make the call. What Agent Bricks actually does, how it stacks up against LangChain, AWS Bedrock, Azure AI Foundry, and Vertex AI Agents, and where the trade-offs will bite.

## What Agent Bricks actually is

Agent Bricks is Databricks' no-code-to-low-code service for building production agents over data that already lives in the Lakehouse. You describe the task in plain language and point at the data. The service then generates evaluation benchmarks, often using synthetic data and LLM judges, and searches across optimization techniques. You pick the quality-versus-cost tradeoff you can live with.

At launch in June 2025, four agent types shipped: Information Extraction, Knowledge Assistant, Supervisor (multi-agent orchestration), and Custom LLM. The Supervisor Agent reached general availability in February 2026; the others are still in beta as of early 2026.

The architectural family matters because it shapes what Agent Bricks can and cannot do. It sits on top of Mosaic AI, the generative AI stack Databricks inherited from the 2023 MosaicML acquisition. Under the hood, it uses Vector Search, Mosaic AI Model Serving, Unity Catalog for governance, MLflow 3.0 for evaluation, and AI Gateway for rate limiting and routing. If your data lives in those systems already, the integration tax is near zero. If it doesn't, you're paying the Lakehouse tax before you write your first agent.

The pricing model is part of the picture. Databricks bills in two layers: DBUs for the platform layer, and your cloud provider's bill for VMs, storage, and egress. Knowledge Assistant agents cost roughly $0.15 per answer at list. A small GPU endpoint running Model Serving costs about $0.78 per hour if you forget to scale it down. Agent Bricks endpoints auto-shut down after three days of inactivity. Model Serving endpoints do not, unless you configure that explicitly. Several early users reported unexpectedly large bills before learning this the hard way.

## What it does well

Three things separate Agent Bricks from rolling your own with LangChain or LlamaIndex.

**1. Evaluation is the product.** The platform generates synthetic test sets and uses task-aware LLM judges to score every iteration. This is the gap that kills most agent projects in production. Teams ship a demo, then stall for months trying to build an eval harness. Agent Bricks gives you one out of the box, tied to your data.

**2. Governance is built in, not bolted on.** Every interaction flows through Unity Catalog. The Supervisor Agent supports On-Behalf-Of authentication, the MCP Catalog, and attribute-based access control. If your security team has spent the last year saying "we can't ship agents because we can't audit them," this is the answer they were waiting for.

**3. Optimization is automated.** You don't pick a model and tune prompts by hand. Agent Bricks searches the configuration space and shows you the quality-versus-cost frontier, then lets you pick the point on the curve you want. For teams without a dedicated ML engineer, this is the difference between shipping and not shipping.

The numbers from named customers back this up. Hawaiian Electric built a Regulatory Chat Tool over 40,000 legal documents and reported that Agent Bricks beat their prior LangChain-based implementation on both LLM-as-judge and human evaluation scores. Flo Health doubled medical accuracy over standard commercial LLMs. North Dakota University System saved 30 days of manual trial-and-error optimization on a legislative-calendar extraction task.

## Where it falls short

Two trade-offs matter most.

**You give up fine-grained control.** Agent Bricks abstracts away the orchestration layer. If you need custom routing logic, exotic tool integrations, or unusual model behaviors, you'll hit a wall. Databricks knows this, which is why they keep Agent Framework (the programmatic, Python-friendly path) alive alongside it. The Databricks Solutions Architect blog puts it bluntly: "Choose Agent Framework when requirements exceed product rails." Translation: Agent Bricks is for the 70% of agent use cases that fit the templates, not the long tail.

**Lock-in is real and growing.** Unity Catalog, Vector Search, Model Serving, MLflow, AI Gateway, and now Agent Bricks all reinforce each other. A Reddit user summarized the concern in June 2025: "We love how fast we can launch agents, but the platform's all-in-one approach means you're stuck with Databricks even for things a simpler tool could handle." That's a fair read. The all-in-one experience is the reason the bills add up and the reason migration gets harder with every quarter you stay.

There's also the beta caveat. Most of Agent Bricks is still beta as of early 2026. Regional feature availability is uneven. During beta, the `system.billing.usage` table returned NULL for `product_features.agent_bricks.problem_type`, which meant customers couldn't see granular per-agent consumption. That has improved, but billing visibility for a production agent platform is not something you want to be debugging in month one.

## How it compares to the alternatives

The honest comparison depends on what you're optimizing for.

**vs. LangChain / LangGraph.** If you want maximum control and a framework that works anywhere, LangGraph 1.0 (released October 2025) is the most mature open-source option. You'll write more code and own the eval pipeline. You won't be tied to a single cloud or vendor. Hawaiian Electric's win with Agent Bricks came precisely because they had a prior LangChain build to beat. If your team has strong ML engineers and your data isn't already in a lakehouse, LangGraph is probably the right starting point.

**vs. Azure AI Foundry.** Foundry hit general availability in May 2025 with multi-agent orchestration (Connected Agents and Multi-Agent Workflows) and the Agent2Agent protocol. Its strength is the Microsoft stack: 1,400+ Logic Apps connectors, native integration with SharePoint, Bing, and Microsoft Fabric, and access to OpenAI, Llama, Mistral, Hugging Face, and Phi models in one place. If your enterprise is Microsoft-shaped and your agents need to reach into Office, Foundry is the path of least resistance. The catch is the same all-in-one lock-in, just on a different vendor's terms.

**vs. AWS Bedrock AgentCore.** AgentCore is the most explicitly modular option. Nine separate services (Runtime, Memory, Gateway, Identity, Code Interpreter, Browser, Observability, Payments, plus Harness) that work with any framework and any foundation model. At re:Invent 2025, AWS added agent boundary guardrails and short- and long-term agent memory. Bedrock is the right pick when your architecture is AWS-native and you want to mix frameworks without rewriting the orchestration layer.

**vs. Google Vertex AI Agents.** Vertex AI Agent Engine pairs with the open-source Agent Development Kit (ADK), released April 2025. Google is the steward of the Agent2Agent protocol and contributed it to the Linux Foundation in June 2025, which now has 150+ organizational supporters. If interoperability across agent systems is a top requirement and you're already on Google Cloud, this is the most protocol-forward choice. Vertex AI is also where Gemini 2.5 Pro and Flash live as native models.

The pattern across hyperscalers is converging: every major cloud now offers a managed agent runtime, a multi-agent orchestration layer, and A2A/MCP support. The differences are ecosystem (Microsoft fabricates, AWS modularizes, Google standardizes) and model access. Agent Bricks' distinct move is treating evaluation and automated optimization as the core product, not the deployment layer.

## When Agent Bricks is the right call

Use Agent Bricks when three conditions hold.

Your data already lives in the Databricks Lakehouse, or you're willing to move it there. Your team has more domain experts than ML engineers. And your agent use cases fit one of the four templates: document extraction, internal knowledge Q&A, supervised multi-agent workflows, or custom LLM tuning.

Skip it if you need fine-grained orchestration control, you're optimizing for vendor portability, your data lives outside Databricks and won't move, or your agents require unusual tool integrations that don't map to Unity Catalog.

A useful litmus test: if you would otherwise build a LangChain agent and a custom eval harness in a quarter, Agent Bricks will probably beat that timeline. If you would otherwise build a LangGraph stateful orchestration system with custom routing, Agent Bricks will be a constraint.

## The honest bottom line

Agent Bricks is the most opinionated agent platform on the market. That is both the appeal and the cost. For teams already deep in the Databricks stack, with strong domain expertise and a queue of internal-knowledge or document-extraction problems, it's the fastest path from idea to production that exists today. For everyone else, the lock-in tax will eventually come due, and the abstraction will get in the way of the 20% of work that doesn't fit the template.

The product will keep improving. MLflow 3.0 is GA, the Supervisor Agent is GA, and the rest of the beta features will likely follow in 2026. But the fundamental tradeoff, automated optimization in exchange for architectural control, won't change. Make sure you know which side of that tradeoff you're on before you commit.