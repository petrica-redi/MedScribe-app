"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Shield } from "lucide-react";

interface ComplianceScorecardProps {
  consentGiven: boolean;
  consentTimestamp: string | null;
  identityVerified: boolean;
  modalityDocumented: boolean;
  noteFinalized: boolean;
  prescriptionCreated: boolean;
  billingCodesAccepted: boolean;
  qualityCheckPassed: boolean;
  dischargeSummaryGenerated: boolean;
  followUpScheduled: boolean;
  visitModality?: string;
}

interface ComplianceItem {
  label: string;
  passed: boolean;
  requirement: string;
  authority: string;
}

export function ComplianceScorecard(props: ComplianceScorecardProps) {
  const items: ComplianceItem[] = useMemo(
    () => [
      {
        label: "Patient consent obtained",
        passed: props.consentGiven,
        requirement: "Informed consent with timestamp",
        authority: "HIPAA / CQC",
      },
      {
        label: "Identity verified",
        passed: props.identityVerified,
        requirement: "Name + DOB for telemedicine",
        authority: "CMS / State Medical Boards",
      },
      {
        label: "Visit modality documented",
        passed: props.modalityDocumented,
        requirement: "In-person / video / audio-only / async",
        authority: "CMS 2026 PFS",
      },
      {
        label: "Clinical note finalized",
        passed: props.noteFinalized,
        requirement: "Signed and locked clinical documentation",
        authority: "AMA CPT / GMC",
      },
      {
        label: "Billing codes accepted",
        passed: props.billingCodesAccepted,
        requirement: "ICD-10 + CPT codes reviewed and accepted",
        authority: "CMS CCI / NHS Clinical Coding",
      },
      {
        label: "Quality check completed",
        passed: props.qualityCheckPassed,
        requirement: "Pre-finalization documentation quality audit",
        authority: "AMA E/M Guidelines",
      },
      {
        label: "Discharge summary generated",
        passed: props.dischargeSummaryGenerated,
        requirement: "Patient-friendly visit summary",
        authority: "CMS Discharge CoP / NHS GP Access",
      },
      {
        label: "Follow-up scheduled",
        passed: props.followUpScheduled,
        requirement: "Next appointment or follow-up action documented",
        authority: "NICE CG138 / CMS",
      },
    ],
    [props]
  );

  const passedCount = items.filter((i) => i.passed).length;
  const total = items.length;
  const percentage = Math.round((passedCount / total) * 100);

  const ringColor =
    percentage === 100
      ? "text-green-500"
      : percentage >= 75
        ? "text-amber-500"
        : "text-red-500";

  const circumference = 2 * Math.PI * 20;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="border-emerald-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-600" />
          Compliance Scorecard
        </CardTitle>
        <p className="text-[10px] text-medical-muted">
          HIPAA &middot; CMS &middot; GDPR &middot; CQC &middot; AMA CPT
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Score ring */}
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#e5e7eb" strokeWidth="4" />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                className={ringColor}
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-medical-text">
              {percentage}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-medical-text">
              {passedCount}/{total} requirements met
            </p>
            <p className="text-[10px] text-medical-muted">
              {percentage === 100
                ? "Fully compliant — safe to close consultation"
                : "Address remaining items before closing"}
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.label}
              className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-xs ${
                item.passed ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              {item.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-gray-300 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <span className={`font-medium ${item.passed ? "text-green-800" : "text-medical-text"}`}>
                  {item.label}
                </span>
                <span className="ml-1 text-[9px] text-medical-muted">({item.authority})</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
