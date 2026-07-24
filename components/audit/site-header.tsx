import { Badge } from "@/components/ui/badge"
import { Gauge } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gauge className="size-4.5" aria-hidden="true" />
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">Credex</span>
            <span className="text-xs text-muted-foreground">AI Spend Audit</span>
          </div>
        </div>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Free instant audit
        </Badge>
      </div>
    </header>
  )
}
