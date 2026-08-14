// Deterministic catalog of AI tools, their plans and per-seat monthly pricing.
// Prices are list prices in USD per seat / month.

export type Category = "coding" | "assistant"

export type Plan = {
  id: string
  name: string
  pricePerSeat: number
}

export type Tool = {
  id: string
  name: string
  vendor: string
  category: Category
  description: string
  plans: Plan[]
  // Default plan selected when a tool is enabled.
  defaultPlanId: string
}

export const CATEGORY_LABELS: Record<Category, string> = {
  coding: "AI Coding Assistants",
  assistant: "AI Chat & Writing Assistants",
}

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    category: "coding",
    description: "AI-native code editor",
    defaultPlanId: "pro",
    plans: [
      { id: "hobby", name: "Hobby (Free)", pricePerSeat: 0 },
      { id: "pro", name: "Pro", pricePerSeat: 20 },
      { id: "business", name: "Business", pricePerSeat: 40 },
    ],
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    vendor: "GitHub",
    category: "coding",
    description: "In-IDE code completion",
    defaultPlanId: "business",
    plans: [
      { id: "free", name: "Free", pricePerSeat: 0 },
      { id: "pro", name: "Pro", pricePerSeat: 10 },
      { id: "business", name: "Business", pricePerSeat: 19 },
      { id: "enterprise", name: "Enterprise", pricePerSeat: 39 },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    vendor: "Codeium",
    category: "coding",
    description: "Agentic AI IDE",
    defaultPlanId: "pro",
    plans: [
      { id: "free", name: "Free", pricePerSeat: 0 },
      { id: "pro", name: "Pro", pricePerSeat: 15 },
      { id: "teams", name: "Teams", pricePerSeat: 30 },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    category: "assistant",
    description: "Reasoning & writing assistant",
    defaultPlanId: "pro",
    plans: [
      { id: "free", name: "Free", pricePerSeat: 0 },
      { id: "pro", name: "Pro", pricePerSeat: 20 },
      { id: "team", name: "Team", pricePerSeat: 30 },
      { id: "max", name: "Max", pricePerSeat: 100 },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    category: "assistant",
    description: "General-purpose assistant",
    defaultPlanId: "plus",
    plans: [
      { id: "free", name: "Free", pricePerSeat: 0 },
      { id: "plus", name: "Plus", pricePerSeat: 20 },
      { id: "team", name: "Team", pricePerSeat: 30 },
      { id: "pro", name: "Pro", pricePerSeat: 200 },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    category: "assistant",
    description: "Workspace-integrated assistant",
    defaultPlanId: "aipro",
    plans: [
      { id: "free", name: "Free", pricePerSeat: 0 },
      { id: "aipro", name: "AI Pro", pricePerSeat: 20 },
      { id: "business", name: "Business", pricePerSeat: 20 },
      { id: "aiultra", name: "AI Ultra", pricePerSeat: 250 },
    ],
  },
]

export const TOOLS_BY_ID: Record<string, Tool> = Object.fromEntries(
  TOOLS.map((t) => [t.id, t]),
)

export function getPlan(toolId: string, planId: string): Plan | undefined {
  return TOOLS_BY_ID[toolId]?.plans.find((p) => p.id === planId)
}

// Threshold (monthly savings) above which we surface the consultation CTA.
export const CONSULTATION_THRESHOLD = 500

export const STORAGE_KEY = "SpendAudit-ai-spend-audit-v1"
