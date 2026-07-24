"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/format"
import { CheckCircle2, Mail } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LeadCaptureProps = {
  annualSavings: number
  wantsConsultation: boolean
  onSubmitted: (lead: { name: string; email: string; company: string }) => void
}

export function LeadCapture({
  annualSavings,
  wantsConsultation,
  onSubmitted,
}: LeadCaptureProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError("Enter a valid work email address.")
      return
    }
    setEmailError(null)
    const lead = { name: name.trim(), email: email.trim(), company: company.trim() }
    onSubmitted(lead)
    setSubmitted(true)
    toast.success(
      wantsConsultation
        ? "Thanks! A Credex specialist will reach out to schedule your consultation."
        : "Your detailed savings report is on its way to your inbox.",
    )
  }

  if (submitted) {
    return (
      <Card className="border-primary/30 bg-accent/30">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </span>
          <CardTitle className="text-xl">You&apos;re all set, {name || "there"}</CardTitle>
          <CardDescription className="max-w-md text-pretty">
            We&apos;ve saved your audit{wantsConsultation ? " and a specialist will email you within one business day to book your consultation" : " and sent your detailed report"}.
            Keep an eye on <span className="font-medium text-foreground">{email}</span>.
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="lead-capture" className="scroll-mt-24 border-primary/25">
      <CardHeader>
        <CardTitle className="text-xl text-balance">
          {wantsConsultation
            ? "Book your free Credex consultation"
            : "Get your detailed savings report"}
        </CardTitle>
        <CardDescription className="text-pretty">
          {wantsConsultation
            ? `We\u2019ll map out how to capture your ${formatCurrency(annualSavings)}/yr in savings. Drop your details and a specialist will be in touch.`
            : `Send yourself a line-by-line breakdown of the ${formatCurrency(annualSavings)}/yr opportunity, plus vendor negotiation benchmarks.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="lead-name">Full name</FieldLabel>
                <Input
                  id="lead-name"
                  autoComplete="name"
                  placeholder="Jordan Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="lead-company">Company</FieldLabel>
                <Input
                  id="lead-company"
                  autoComplete="organization"
                  placeholder="Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </Field>
            </div>
            <Field data-invalid={!!emailError}>
              <FieldLabel htmlFor="lead-email">Work email</FieldLabel>
              <Input
                id="lead-email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={!!emailError}
                placeholder="jordan@acme.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError(null)
                }}
              />
              <FieldError>{emailError}</FieldError>
            </Field>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Mail data-icon="inline-start" />
              {wantsConsultation ? "Request my consultation" : "Email me the report"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
