"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CONSULTATION_THRESHOLD } from "@/lib/audit-config"
import type { AuditResult, RecommendationType } from "@/lib/audit-engine"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  CalendarCheck,
  Layers,
  PiggyBank,
  ReceiptText,
  Sparkles,
  TrendingDown,
} from "lucide-react"

const TYPE_META: Record<
  RecommendationType,
  { label: string; icon: typeof Layers }
> = {
  consolidate: { label: "Consolidate", icon: Layers },
  rightsize: { label: "Right-size", icon: TrendingDown },
  billing: { label: "Billing", icon: ReceiptText },
}

type AuditResultsProps = {
  result: AuditResult
  onEdit: () => void
  onBookConsultation: () => void
}

export function AuditResults({
  result,
  onEdit,
  onBookConsultation,
}: AuditResultsProps) {
  const {
    currentMonthly,
    optimizedMonthly,
    monthlySavings,
    annualSavings,
    savingsPercent,
    recommendations,
  } = result

  const qualifies = monthlySavings > CONSULTATION_THRESHOLD

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="w-fit">
            <Sparkles data-icon="inline-start" />
            Your audit is ready
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-balance">
            We found {formatCurrency(annualSavings)} in annual savings
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onEdit} className="shrink-0">
          <ArrowLeft data-icon="inline-start" />
          Edit inputs
        </Button>
      </div>

      {/* Headline savings */}
      <Card className="overflow-hidden border-primary/30 bg-primary text-primary-foreground">
        <CardContent className="flex flex-col gap-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
              <PiggyBank className="size-4" aria-hidden="true" />
              Potential monthly savings
            </span>
            <span className="font-mono text-5xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(monthlySavings)}
            </span>
            <span className="text-sm text-primary-foreground/80">
              {formatCurrency(annualSavings)} per year &middot; {savingsPercent}% of
              current spend
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-primary-foreground/15 text-center">
            <div className="flex flex-col gap-0.5 bg-primary px-5 py-4">
              <span className="text-xs text-primary-foreground/70">Today</span>
              <span className="font-mono text-lg font-semibold tabular-nums">
                {formatCurrency(currentMonthly)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 bg-primary px-5 py-4">
              <span className="text-xs text-primary-foreground/70">Optimized</span>
              <span className="font-mono text-lg font-semibold tabular-nums">
                {formatCurrency(optimizedMonthly)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-muted-foreground">
          Recommendations ({recommendations.length})
        </h3>
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Your stack already looks lean. Add more tools or seats to surface
              consolidation opportunities.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {recommendations.map((rec) => {
              const meta = TYPE_META[rec.type]
              const Icon = meta.icon
              return (
                <Card key={rec.id} className="gap-0 py-0">
                  <CardContent className="flex items-start gap-4 py-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold leading-tight">
                          {rec.title}
                        </span>
                        <Badge variant="outline">{meta.label}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {rec.detail}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <span className="font-mono text-base font-semibold tabular-nums text-primary">
                        {formatCurrency(rec.monthlySavings)}
                      </span>
                      <span className="text-xs text-muted-foreground">/mo</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Consultation CTA */}
      {qualifies && (
        <Card className="border-primary/30 bg-accent/40">
          <CardHeader>
            <Badge className="w-fit">
              <CalendarCheck data-icon="inline-start" />
              You qualify for a free consultation
            </Badge>
            <CardTitle className="text-xl text-balance">
              Capture {formatCurrency(annualSavings)}/yr with a SpendAudit specialist
            </CardTitle>
            <CardDescription className="text-pretty">
              Your savings exceed {formatCurrency(CONSULTATION_THRESHOLD)}/mo. Book a
              30-minute consultation and we&apos;ll build a consolidation and
              negotiation plan tailored to your stack &mdash; typically capturing
              these savings within one billing cycle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={onBookConsultation} className="w-full sm:w-auto">
              <CalendarCheck data-icon="inline-start" />
              Book SpendAudit Consultation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
