"use client"

import { AuditResults } from "@/components/audit/audit-results"
import { LeadCapture } from "@/components/audit/lead-capture"
import { SiteHeader } from "@/components/audit/site-header"
import { SpendForm } from "@/components/audit/spend-form"
import { Badge } from "@/components/ui/badge"
import { STORAGE_KEY, TOOLS } from "@/lib/audit-config"
import {
  createInitialState,
  runAudit,
  type AuditState,
  type ToolEntry,
} from "@/lib/audit-engine"
import { useLocalStorage } from "@/lib/use-local-storage"
import { ShieldCheck, Timer, Zap } from "lucide-react"
import { useMemo, useState } from "react"

// Ensure every tool in the catalog has an entry, even if storage is stale.
function normalize(state: AuditState): AuditState {
  const base = createInitialState()
  const merged: AuditState = { ...base }
  for (const tool of TOOLS) {
    if (state?.[tool.id]) merged[tool.id] = { ...base[tool.id], ...state[tool.id] }
  }
  return merged
}

export default function Page() {
  const [stored, setStored, hydrated] = useLocalStorage<AuditState>(
    STORAGE_KEY,
    createInitialState(),
  )
  const state = useMemo(() => normalize(stored), [stored])

  const [view, setView] = useState<"form" | "results">("form")
  const [wantsConsultation, setWantsConsultation] = useState(false)

  const result = useMemo(() => runAudit(state), [state])

  function handleEntryChange(toolId: string, patch: Partial<ToolEntry>) {
    setStored((prev) => {
      const current = normalize(prev)
      return { ...current, [toolId]: { ...current[toolId], ...patch } }
    })
  }

  function handleRunAudit() {
    setWantsConsultation(false)
    setView("results")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleBookConsultation() {
    setWantsConsultation(true)
    document
      .getElementById("lead-capture")
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        {view === "form" ? (
          <>
            <section className="mb-8 flex flex-col items-start gap-4">
              <Badge variant="secondary">
                <Zap data-icon="inline-start" />
                AI tooling cost optimization
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Audit your team&apos;s AI spend in 60 seconds
              </h1>
              <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
                Add the AI tools your team pays for and see exactly where budget is
                leaking. SpendAudit finds redundant seats, overlapping tools, and billing
                inefficiencies &mdash; then shows you what you could save.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Timer className="size-4 text-primary" aria-hidden="true" />
                  Instant results
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="size-4 text-primary" aria-hidden="true" />
                  Saved automatically
                </span>
              </div>
            </section>

            {hydrated && (
              <SpendForm
                state={state}
                onEntryChange={handleEntryChange}
                onRunAudit={handleRunAudit}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col gap-10">
            <AuditResults
              result={result}
              onEdit={() => setView("form")}
              onBookConsultation={handleBookConsultation}
            />
            <LeadCapture
              annualSavings={result.annualSavings}
              wantsConsultation={wantsConsultation}
              onSubmitted={() => {}}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto w-full max-w-3xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          <p>
            Credex AI Spend Audit &middot; Estimates use public list pricing and
            deterministic benchmarks for illustration.
          </p>
        </div>
      </footer>
    </div>
  )
}
