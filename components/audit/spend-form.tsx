"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  CATEGORY_LABELS,
  getPlan,
  TOOLS,
  type Category,
  type Tool,
} from "@/lib/audit-config"
import { getActiveTools, type AuditState, type ToolEntry } from "@/lib/audit-engine"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ArrowRight, Code2, MessageSquare, Plus } from "lucide-react"

const CATEGORY_ICON: Record<Category, typeof Code2> = {
  coding: Code2,
  assistant: MessageSquare,
}

type SpendFormProps = {
  state: AuditState
  onEntryChange: (toolId: string, patch: Partial<ToolEntry>) => void
  onRunAudit: () => void
}

export function SpendForm({ state, onEntryChange, onRunAudit }: SpendFormProps) {
  const activeTools = getActiveTools(state)
  const currentMonthly = activeTools.reduce((s, t) => s + t.monthlyCost, 0)
  const activeCount = activeTools.length

  const categories: Category[] = ["coding", "assistant"]

  return (
    <div className="flex flex-col gap-6">
      {categories.map((category) => {
        const Icon = CATEGORY_ICON[category]
        const tools = TOOLS.filter((t) => t.category === category)
        return (
          <section key={category} className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold tracking-tight">
                {CATEGORY_LABELS[category]}
              </h3>
            </div>
            <div className="grid gap-3">
              {tools.map((tool) => (
                <ToolRow
                  key={tool.id}
                  tool={tool}
                  entry={state[tool.id]}
                  onEntryChange={onEntryChange}
                />
              ))}
            </div>
          </section>
        )
      })}

      <Card className="sticky bottom-4 border-primary/25 bg-card/95 shadow-lg backdrop-blur">
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">
              Current spend ({activeCount} tool{activeCount === 1 ? "" : "s"} selected)
            </span>
            <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(currentMonthly)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </span>
          </div>
          <Button
            size="lg"
            onClick={onRunAudit}
            disabled={activeCount === 0}
            className="w-full sm:w-auto"
          >
            Run my audit
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

type ToolRowProps = {
  tool: Tool
  entry: ToolEntry
  onEntryChange: (toolId: string, patch: Partial<ToolEntry>) => void
}

function ToolRow({ tool, entry, onEntryChange }: ToolRowProps) {
  const enabled = entry?.enabled ?? false
  const plan = getPlan(tool.id, entry?.planId ?? tool.defaultPlanId)
  const seats = entry?.seats ?? 0
  const lineTotal = (plan?.pricePerSeat ?? 0) * (enabled ? seats : 0)

  return (
    <Card
      data-active={enabled}
      className={cn(
        "gap-0 overflow-hidden py-0 transition-colors",
        enabled ? "border-primary/40 bg-primary/[0.03]" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={() => onEntryChange(tool.id, { enabled: !enabled })}
        aria-pressed={enabled}
        className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors focus-visible:bg-accent/40"
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md border text-xs font-semibold uppercase transition-colors",
            enabled
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-muted text-muted-foreground",
          )}
          aria-hidden="true"
        >
          {enabled ? "\u2713" : <Plus className="size-4" />}
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-sm font-medium leading-tight">{tool.name}</span>
          <span className="text-xs text-muted-foreground">
            {tool.vendor} &middot; {tool.description}
          </span>
        </span>
        {enabled ? (
          <span className="font-mono text-sm font-semibold tabular-nums">
            {formatCurrency(lineTotal)}
            <span className="text-xs font-normal text-muted-foreground">/mo</span>
          </span>
        ) : (
          <Badge variant="outline">Add</Badge>
        )}
      </button>

      {enabled && (
        <div className="grid grid-cols-1 gap-4 border-t border-border/60 bg-background/40 px-4 py-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor={`${tool.id}-plan`}>Plan</FieldLabel>
            <Select
              value={entry.planId}
              onValueChange={(value) =>
                onEntryChange(tool.id, { planId: value as string })
              }
            >
              <SelectTrigger id={`${tool.id}-plan`} className="w-full">
                <SelectValue>
                  {(value: string) =>
                    tool.plans.find((p) => p.id === value)?.name ?? "Select plan"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {tool.plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} &middot; {formatCurrency(p.pricePerSeat)}/seat
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor={`${tool.id}-seats`}>Seats</FieldLabel>
            <Input
              id={`${tool.id}-seats`}
              type="number"
              min={0}
              max={100000}
              inputMode="numeric"
              value={Number.isFinite(seats) ? seats : 0}
              onChange={(e) =>
                onEntryChange(tool.id, {
                  seats: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                })
              }
            />
          </Field>

          <Field>
            <FieldLabel>Billing</FieldLabel>
            <ToggleGroup
              value={[entry.billing]}
              onValueChange={(value) => {
                const next = (value[0] ?? entry.billing) as ToolEntry["billing"]
                onEntryChange(tool.id, { billing: next })
              }}
              variant="outline"
              spacing={0}
              className="w-full *:flex-1"
            >
              <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
              <ToggleGroupItem value="annual">Annual</ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </div>
      )}
    </Card>
  )
}
