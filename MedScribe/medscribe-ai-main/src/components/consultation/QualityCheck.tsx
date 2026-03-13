"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, XCircle, Loader2, ShieldCheck } from "lucide-react";
import type { NoteSection, BillingCode } from "@/types";

interface QualityCheckProps {
  sections: NoteSection[];
  billingCodes: BillingCode[];
  transcriptText?: string;
  onCheckComplete?: (results: QualityResult[]) => void;
}

export interface QualityResult {
  id: string;
  category: "completeness" | "consistency" | "coding" | "safety";
  severity: "pass" | "warning" | "error";
  title: string;
  detail: string;
}

export function QualityCheck({ sections, billingCodes, transcriptText, onCheckComplete }: QualityCheckProps) {
  const [results, setResults] = useState<QualityResult[]>([]);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runCheck = useCallback(() => {
    setRunning(true);
    const checks: QualityResult[] = [];
    const sectionMap = new Map(sections.map((s) => [s.title.toLowerCase(), s.content]));

    const subjective = sectionMap.get("subjective") || sectionMap.get("history of present illness") || "";
    const objective = sectionMap.get("objective") || sectionMap.get("physical examination") || "";
    const assessment = sectionMap.get("assessment") || sectionMap.get("assessment & plan") || "";
    const plan = sectionMap.get("plan") || sectionMap.get("assessment & plan") || "";

    // 1. Check for missing SOAP sections
    const requiredSections = ["subjective", "objective", "assessment", "plan"];
    const presentSections = sections.map((s) => s.title.toLowerCase());
    const combinedPresent = presentSections.some((s) => s.includes("assessment") && s.includes("plan"));

    for (const req of requiredSections) {
      if (req === "assessment" && combinedPresent) continue;
      if (req === "plan" && combinedPresent) continue;
      const found = presentSections.some((s) => s.toLowerCase().includes(req));
      if (!found) {
        checks.push({
          id: `missing_${req}`,
          category: "completeness",
          severity: "error",
          title: `Missing ${req.charAt(0).toUpperCase() + req.slice(1)} section`,
          detail: `SOAP documentation requires a ${req} section. This may impact E/M coding.`,
        });
      }
    }

    // 2. Check for empty sections
    for (const section of sections) {
      if (!section.content || section.content.trim().length < 10) {
        checks.push({
          id: `empty_${section.title}`,
          category: "completeness",
          severity: "warning",
          title: `${section.title} section is very brief`,
          detail: "Content under 10 characters may indicate incomplete documentation.",
        });
      }
    }

    // 3. Check for [?] placeholders
    const placeholderCount = sections.reduce(
      (count, s) => count + (s.content.match(/\[\?\]/g) || []).length,
      0
    );
    if (placeholderCount > 0) {
      checks.push({
        id: "placeholders",
        category: "completeness",
        severity: "warning",
        title: `${placeholderCount} unresolved placeholder(s) [?]`,
        detail: "AI-generated sections with [?] markers need physician review before finalization.",
      });
    }

    // 4. Check assessment mentions symptoms from subjective
    if (subjective && assessment) {
      const symptomKeywords = subjective
        .toLowerCase()
        .split(/[.,;!?\n]+/)
        .filter((s) => s.trim().length > 5)
        .slice(0, 10);

      const assessmentLower = assessment.toLowerCase();
      const unaddressed = symptomKeywords.filter(
        (kw) => !assessmentLower.includes(kw.trim().substring(0, 8))
      );

      if (unaddressed.length > symptomKeywords.length * 0.6 && symptomKeywords.length > 2) {
        checks.push({
          id: "assessment_gaps",
          category: "consistency",
          severity: "warning",
          title: "Assessment may not address all documented symptoms",
          detail:
            "Several symptom phrases from the Subjective section do not appear referenced in the Assessment. Review for completeness.",
        });
      }
    }

    // 5. Check plan items have corresponding assessment
    if (plan && !assessment.toLowerCase().includes(plan.toLowerCase().substring(0, 20))) {
      const planLines = plan.split("\n").filter((l) => l.trim().length > 3);
      if (planLines.length > 0 && assessment.trim().length < 20) {
        checks.push({
          id: "plan_no_assessment",
          category: "consistency",
          severity: "error",
          title: "Plan items without documented Assessment",
          detail: "There are plan items but the Assessment section is minimal. Each plan item should link to an assessed diagnosis.",
        });
      }
    }

    // 6. Check billing codes exist
    if (billingCodes.length === 0) {
      checks.push({
        id: "no_billing",
        category: "coding",
        severity: "warning",
        title: "No billing codes assigned",
        detail: "Consultation has no ICD-10 or CPT codes. This may delay billing.",
      });
    }

    // 7. Check for accepted billing codes
    const acceptedCodes = billingCodes.filter((c) => c.accepted);
    if (billingCodes.length > 0 && acceptedCodes.length === 0) {
      checks.push({
        id: "no_accepted_codes",
        category: "coding",
        severity: "warning",
        title: "No billing codes accepted",
        detail: "All suggested codes are pending review. Accept or reject each code before finalization.",
      });
    }

    // 8. Check if medications are mentioned but no prescription
    const medKeywords = ["prescribe", "medication", "mg", "tablet", "capsule", "inhaler", "injection", "dose"];
    const hasMedMention = medKeywords.some(
      (kw) => plan.toLowerCase().includes(kw) || assessment.toLowerCase().includes(kw)
    );
    if (hasMedMention) {
      checks.push({
        id: "med_reminder",
        category: "safety",
        severity: "warning",
        title: "Medications mentioned — ensure prescription is generated",
        detail: "The note references medications. Confirm a prescription has been created or is not needed.",
      });
    }

    // 9. Check for allergy documentation
    const hasAllergyMention = sections.some(
      (s) =>
        s.content.toLowerCase().includes("allerg") || s.content.toLowerCase().includes("nkda")
    );
    if (!hasAllergyMention) {
      checks.push({
        id: "no_allergies",
        category: "safety",
        severity: "warning",
        title: "No allergy documentation found",
        detail: "Consider documenting allergies or NKDA (No Known Drug Allergies) per NPSG standards.",
      });
    }

    // If all pass
    if (checks.length === 0) {
      checks.push({
        id: "all_pass",
        category: "completeness",
        severity: "pass",
        title: "All quality checks passed",
        detail: "Documentation appears complete and consistent. Safe to finalize.",
      });
    }

    setTimeout(() => {
      setResults(checks);
      setRunning(false);
      setHasRun(true);
      onCheckComplete?.(checks);
    }, 600);
  }, [sections, billingCodes, onCheckComplete]);

  const errorCount = results.filter((r) => r.severity === "error").length;
  const warningCount = results.filter((r) => r.severity === "warning").length;
  const passCount = results.filter((r) => r.severity === "pass").length;

  const severityIcon = {
    pass: <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
    error: <XCircle className="h-4 w-4 text-red-500 shrink-0" />,
  };

  const severityBg = {
    pass: "bg-green-50 border-green-200",
    warning: "bg-amber-50 border-amber-200",
    error: "bg-red-50 border-red-200",
  };

  return (
    <Card className="border-indigo-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            Quality Check
          </CardTitle>
          <Button
            onClick={runCheck}
            disabled={running}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {running ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking...
              </span>
            ) : hasRun ? (
              "Re-run Check"
            ) : (
              "Run Quality Check"
            )}
          </Button>
        </div>
        <p className="text-[10px] text-medical-muted">
          AMA CPT E/M documentation compliance &middot; CMS Correct Coding &middot; Patient safety
        </p>
      </CardHeader>

      <CardContent className="space-y-2 pt-0">
        {!hasRun && !running && (
          <p className="text-xs text-medical-muted text-center py-4">
            Run the quality check before finalizing to catch documentation gaps, coding mismatches, and safety issues.
          </p>
        )}

        {hasRun && results.length > 0 && (
          <>
            {/* Summary bar */}
            <div className="flex items-center gap-3 text-xs">
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <XCircle className="h-3 w-3" /> {errorCount} error{errorCount > 1 ? "s" : ""}
                </span>
              )}
              {warningCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <AlertTriangle className="h-3 w-3" /> {warningCount} warning{warningCount > 1 ? "s" : ""}
                </span>
              )}
              {passCount > 0 && errorCount === 0 && warningCount === 0 && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> All passed
                </span>
              )}
            </div>

            {/* Results list */}
            <div className="space-y-1.5">
              {results.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 ${severityBg[r.severity]}`}
                >
                  {severityIcon[r.severity]}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-medical-text">{r.title}</p>
                    <p className="text-[10px] text-medical-muted leading-relaxed">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
