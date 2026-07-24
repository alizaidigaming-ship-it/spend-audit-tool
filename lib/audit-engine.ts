import {
  CATEGORY_LABELS,
  getPlan,
  TOOLS,
  TOOLS_BY_ID,
  type Category,
} from "./audit-config"

// Per-tool line item captured by the spend form.
export type ToolEntry = {
  enabled: boolean
  planId: string
  seats: number
  // Optional: monthly billing pays a premium vs. annual commitment.
  billing: "monthly" | "annual"
}

export type AuditState = Record<string, ToolEntry>

export type RecommendationType = "consolidate" | "rightsize" | "billing"

export type Recommendation = {
  id: string
  type: RecommendationType
  title: string
  detail: string
  monthlySavings: number
  // Tool ids this recommendation touches.
  tools: string[]
}

export type ActiveTool = {
  id: string
  name: string
  category: Category
  planName: string
  seats: number
  perSeat: number
  monthlyCost: number
}

export type AuditResult = {
  activeTools: ActiveTool[]
  currentMonthly: number
  optimizedMonthly: number
  monthlySavings: number
  annualSavings: number
  savingsPercent: number
  recommendations: Recommendation[]
}

// Deterministic tuning constants for the savings model.
const OVERLAP_ELIMINATION = 0.5 // share of redundant seats that are pure duplicates
const MIGRATION_FACTOR = 0.4 // remaining redundant seats that must move to the primary tool
const UNDERUTILIZED_SEATS = 0.25 // share of premium seats that can drop to a free/lower tier
const ANNUAL_DISCOUNT = 0.15 // savings from committing to annual billing

const currency = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`

export function createInitialState(): AuditState {
  const state: AuditState = {}
  for (const tool of TOOLS) {
    state[tool.id] = {
      enabled: false,
      planId: tool.defaultPlanId,
      seats: 5,
      billing: "monthly",
    }
  }
  return state
}

export function getActiveTools(state: AuditState): ActiveTool[] {
  const active: ActiveTool[] = []
  for (const tool of TOOLS) {
    const entry = state[tool.id]
    if (!entry?.enabled) continue
    const seats = Math.max(0, Math.floor(entry.seats || 0))
    if (seats <= 0) continue
    const plan = getPlan(tool.id, entry.planId)
    if (!plan) continue
    active.push({
      id: tool.id,
      name: tool.name,
      category: tool.category,
      planName: plan.name,
      seats,
      perSeat: plan.pricePerSeat,
      monthlyCost: plan.pricePerSeat * seats,
    })
  }
  return active
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function runAudit(state: AuditState): AuditResult {
  const activeTools = getActiveTools(state)
  const currentMonthly = round2(
    activeTools.reduce((sum, t) => sum + t.monthlyCost, 0),
  )

  const recommendations: Recommendation[] = []

  // --- Rule 1: Consolidate redundant tools within a category ---
  const categories: Category[] = ["coding", "assistant"]
  for (const category of categories) {
    const inCategory = activeTools
      .filter((t) => t.category === category && t.monthlyCost > 0)
      .sort((a, b) => b.monthlyCost - a.monthlyCost)

    if (inCategory.length < 2) continue

    const primary = inCategory[0]
    const redundant = inCategory.slice(1)

    let categorySavings = 0
    for (const tool of redundant) {
      // Seats that migrate to the primary tool at the primary's per-seat rate.
      const migratingSeats = tool.seats * MIGRATION_FACTOR
      const migrationCost = migratingSeats * primary.perSeat
      const saved = Math.max(0, tool.monthlyCost - migrationCost)
      categorySavings += saved
    }
    categorySavings = round2(categorySavings)

    if (categorySavings > 0) {
      const redundantNames = redundant.map((t) => t.name).join(", ")
      recommendations.push({
        id: `consolidate-${category}`,
        type: "consolidate",
        title: `Consolidate your ${CATEGORY_LABELS[category].toLowerCase()}`,
        detail: `Your team runs ${inCategory.length} overlapping tools here. Standardize on ${primary.name} and migrate active users off ${redundantNames}. About half of those seats are duplicate users already covered by ${primary.name}.`,
        monthlySavings: categorySavings,
        tools: [primary.id, ...redundant.map((t) => t.id)],
      })
    }
  }

  // --- Rule 2: Right-size over-provisioned premium seats ---
  for (const tool of activeTools) {
    if (tool.perSeat <= 0 || tool.seats < 4) continue
    const reclaimable = Math.floor(tool.seats * UNDERUTILIZED_SEATS)
    if (reclaimable <= 0) continue
    const saved = round2(reclaimable * tool.perSeat)
    if (saved <= 0) continue
    recommendations.push({
      id: `rightsize-${tool.id}`,
      type: "rightsize",
      title: `Right-size ${tool.name} seats`,
      detail: `Usage data typically shows ~25% of ${tool.name} ${tool.planName} seats are inactive or light users. Downgrade an estimated ${reclaimable} seat${reclaimable > 1 ? "s" : ""} to a free tier.`,
      monthlySavings: saved,
      tools: [tool.id],
    })
  }

  // --- Rule 3: Switch monthly billing to annual commitments ---
  const monthlyBilledSpend = activeTools
    .filter((t) => (state[t.id]?.billing ?? "monthly") === "monthly")
    .reduce((sum, t) => sum + t.monthlyCost, 0)
  const annualSwitchSaving = round2(monthlyBilledSpend * ANNUAL_DISCOUNT)
  if (annualSwitchSaving > 0) {
    recommendations.push({
      id: "billing-annual",
      type: "billing",
      title: "Move month-to-month plans to annual",
      detail: `You have ${currency(monthlyBilledSpend)}/mo on month-to-month billing. Committing annually captures a typical ${Math.round(
        ANNUAL_DISCOUNT * 100,
      )}% discount across those tools.`,
      monthlySavings: annualSwitchSaving,
      tools: [],
    })
  }

  // Cap total savings so it can never exceed current spend.
  const rawSavings = recommendations.reduce(
    (sum, r) => sum + r.monthlySavings,
    0,
  )
  const monthlySavings = round2(Math.min(rawSavings, currentMonthly))
  const optimizedMonthly = round2(Math.max(0, currentMonthly - monthlySavings))
  const annualSavings = round2(monthlySavings * 12)
  const savingsPercent =
    currentMonthly > 0 ? Math.round((monthlySavings / currentMonthly) * 100) : 0

  recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings)

  return {
    activeTools,
    currentMonthly,
    optimizedMonthly,
    monthlySavings,
    annualSavings,
    savingsPercent,
    recommendations,
  }
}

export { TOOLS_BY_ID }
