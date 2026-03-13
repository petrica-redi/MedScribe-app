"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ComplianceScorecard } from "@/components/consultation/ComplianceScorecard";
import {
  FileText,
  BookOpen,
  CalendarPlus,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";

interface VisitSummary {
  id: string;
  summary_text: string;
  medications: Array<{ name: string; dosage: string; frequency: string; instructions: string }>;
  instructions: string;
  follow_up_date: string | null;
}

interface EducationMaterial {
  id: string;
  title: string;
  content_text: string;
  category: string;
}

interface ConsultationMeta {
  patient_id: string | null;
  patient_name: string;
  visit_type: string;
  status: string;
  consent_given: boolean;
  consent_timestamp: string | null;
  metadata: Record<string, unknown>;
}

type DischargeStep = "summary" | "education" | "followup" | "review";

export default function DischargePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const consultationId = params?.id;
  const supabase = createClient();

  const [step, setStep] = useState<DischargeStep>("summary");
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<ConsultationMeta | null>(null);
  const [summary, setSummary] = useState<VisitSummary | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [education, setEducation] = useState<EducationMaterial[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<Set<string>>(new Set());
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTitle, setFollowUpTitle] = useState("");
  const [followUpCreated, setFollowUpCreated] = useState(false);
  const [returnPrecautions, setReturnPrecautions] = useState("");
  const [portalShared, setPortalShared] = useState(false);
  const [error, setError] = useState("");

  // Compliance state
  const [noteFinalized, setNoteFinalized] = useState(false);
  const [prescriptionCreated, setPrescriptionCreated] = useState(false);
  const [billingCodesAccepted, setBillingCodesAccepted] = useState(false);
  const [qualityCheckPassed, setQualityCheckPassed] = useState(false);

  useEffect(() => {
    if (!consultationId) return;

    const load = async () => {
      try {
        const [
          { data: consData },
          { data: noteData },
          { data: prescData },
          { data: existingSummary },
        ] = await Promise.all([
          supabase.from("consultations").select("*").eq("id", consultationId).single(),
          supabase
            .from("clinical_notes")
            .select("status, billing_codes")
            .eq("consultation_id", consultationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("consultation_documents")
            .select("id")
            .eq("consultation_id", consultationId)
            .eq("document_type", "prescription")
            .maybeSingle(),
          supabase
            .from("visit_summaries")
            .select("*")
            .eq("consultation_id", consultationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (consData) {
          const meta = (consData.metadata || {}) as Record<string, unknown>;
          setConsultation({
            patient_id: consData.patient_id,
            patient_name: (meta.patient_name as string) || "Patient",
            visit_type: consData.visit_type || "General",
            status: consData.status,
            consent_given: consData.consent_given,
            consent_timestamp: consData.consent_timestamp,
            metadata: meta,
          });

          if (meta.quality_check_passed) setQualityCheckPassed(true);
          if (meta.return_precautions) setReturnPrecautions(meta.return_precautions as string);
        }

        if (noteData) {
          setNoteFinalized(noteData.status === "finalized");
          const codes = (noteData.billing_codes || []) as Array<{ accepted?: boolean }>;
          setBillingCodesAccepted(codes.some((c) => c.accepted));
        }

        if (prescData) setPrescriptionCreated(true);
        if (existingSummary) setSummary(existingSummary as VisitSummary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load discharge data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [consultationId, supabase]);

  const generateSummary = useCallback(async () => {
    if (!consultationId || !consultation?.patient_id) return;
    setGeneratingSummary(true);
    setError("");

    try {
      const { data: noteData } = await supabase
        .from("clinical_notes")
        .select("sections")
        .eq("consultation_id", consultationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const sections = (noteData?.sections || []) as Array<{ title: string; content: string }>;

      const res = await fetch("/api/visit-summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultation_id: consultationId,
          patient_id: consultation.patient_id,
          clinical_note_sections: sections,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate patient summary");
      const data = await res.json();
      setSummary(data);

      if (data.follow_up_date) {
        setFollowUpDate(data.follow_up_date);
        setFollowUpTitle(`Follow-up: ${consultation.visit_type}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summary generation failed");
    } finally {
      setGeneratingSummary(false);
    }
  }, [consultationId, consultation, supabase]);

  const loadEducation = useCallback(async () => {
    try {
      const res = await fetch("/api/education?language=en");
      if (res.ok) {
        const { data } = await res.json();
        setEducation(data || []);
      }
    } catch {
      /* best effort */
    }
  }, []);

  useEffect(() => {
    if (step === "education" && education.length === 0) {
      loadEducation();
    }
  }, [step, education.length, loadEducation]);

  const createFollowUp = useCallback(async () => {
    if (!consultationId || !consultation?.patient_id || !followUpDate || !followUpTitle) return;
    setError("");

    try {
      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: consultation.patient_id,
          consultation_id: consultationId,
          type: "follow_up_visit",
          title: followUpTitle,
          description: `Follow-up from ${consultation.visit_type} on ${new Date().toLocaleDateString()}`,
          due_date: followUpDate,
          priority: "medium",
        }),
      });

      if (!res.ok) throw new Error("Failed to create follow-up");
      setFollowUpCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Follow-up creation failed");
    }
  }, [consultationId, consultation, followUpDate, followUpTitle]);

  const saveDischargeData = useCallback(async () => {
    if (!consultationId) return;

    await supabase
      .from("consultations")
      .update({
        status: "completed",
        metadata: {
          ...consultation?.metadata,
          discharge_summary_generated: !!summary,
          education_materials_sent: Array.from(selectedEducation),
          follow_up_scheduled: followUpCreated,
          return_precautions: returnPrecautions || null,
          portal_shared: portalShared,
          discharged_at: new Date().toISOString(),
        },
      })
      .eq("id", consultationId);
  }, [
    consultationId,
    consultation,
    summary,
    selectedEducation,
    followUpCreated,
    returnPrecautions,
    portalShared,
    supabase,
  ]);

  const handleComplete = async () => {
    await saveDischargeData();
    router.push("/");
  };

  const steps: { key: DischargeStep; label: string; icon: React.ReactNode }[] = [
    { key: "summary", label: "Patient Summary", icon: <FileText className="h-4 w-4" /> },
    { key: "education", label: "Education", icon: <BookOpen className="h-4 w-4" /> },
    { key: "followup", label: "Follow-Up", icon: <CalendarPlus className="h-4 w-4" /> },
    { key: "review", label: "Review & Close", icon: <ClipboardList className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
          <p className="text-medical-muted">Loading discharge flow...</p>
        </div>
      </div>
    );
  }

  const identityVerified = !!(consultation?.metadata?.identity_verified);
  const modalityDocumented = !!(consultation?.metadata?.consultation_mode);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/consultation/${consultationId}/note`)}
            className="mb-2 -ml-2 text-xs text-medical-muted"
          >
            <ArrowLeft className="h-3 w-3 mr-1" /> Back to Clinical Note
          </Button>
          <h1 className="text-2xl font-bold text-medical-text">Patient Discharge</h1>
          <p className="text-sm text-medical-muted">
            {consultation?.patient_name} &middot; {consultation?.visit_type} &middot;{" "}
            {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              onClick={() => setStep(s.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                step === s.key
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-medical-muted hover:bg-gray-200"
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && <div className="mx-1 h-px w-4 bg-gray-300" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Patient Summary */}
          {step === "summary" && (
            <>
              {summary ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-brand-600" />
                      Visit Summary (Patient-Friendly)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-medical-text whitespace-pre-wrap leading-relaxed">
                      {summary.summary_text}
                    </div>

                    {summary.medications.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-medical-muted mb-2">
                          Your Medications
                        </h4>
                        <div className="space-y-2">
                          {summary.medications.map((med, i) => (
                            <div key={i} className="rounded-lg border border-medical-border bg-white p-3">
                              <p className="text-sm font-medium text-medical-text">{med.name} — {med.dosage}</p>
                              <p className="text-xs text-medical-muted">
                                {med.frequency} &middot; {med.instructions}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {summary.instructions && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase text-medical-muted mb-2">
                          Home Instructions
                        </h4>
                        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-medical-text whitespace-pre-wrap">
                          {summary.instructions}
                        </div>
                      </div>
                    )}

                    {/* Return precautions */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-amber-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Return Precautions
                      </h4>
                      <textarea
                        value={returnPrecautions}
                        onChange={(e) => setReturnPrecautions(e.target.value)}
                        placeholder="Describe conditions under which the patient should return urgently..."
                        className="w-full min-h-[80px] rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setStep("education")}>
                        Next: Education Materials
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center gap-4 py-12">
                    <FileText className="h-10 w-10 text-gray-300" />
                    <p className="text-sm text-medical-muted text-center">
                      Generate a patient-friendly summary from the finalized clinical note
                    </p>
                    <Button
                      onClick={generateSummary}
                      disabled={generatingSummary}
                      variant="primary"
                      size="md"
                    >
                      {generatingSummary ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating Summary...
                        </span>
                      ) : (
                        "Generate Patient Summary"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* STEP 2: Education */}
          {step === "education" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-600" />
                  Patient Education Materials
                </CardTitle>
                <p className="text-[10px] text-medical-muted">
                  Select relevant materials to share with the patient (ACA Section 1311 health literacy)
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {education.length === 0 ? (
                  <p className="text-sm text-medical-muted text-center py-8">
                    No education materials available. You can add materials in the Admin Panel.
                  </p>
                ) : (
                  education.map((mat) => (
                    <label
                      key={mat.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        selectedEducation.has(mat.id)
                          ? "border-brand-300 bg-brand-50"
                          : "border-medical-border bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEducation.has(mat.id)}
                        onChange={(e) => {
                          const next = new Set(selectedEducation);
                          e.target.checked ? next.add(mat.id) : next.delete(mat.id);
                          setSelectedEducation(next);
                        }}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-medical-text">{mat.title}</p>
                        <p className="text-xs text-medical-muted">{mat.category}</p>
                      </div>
                    </label>
                  ))
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setStep("summary")}>
                    Back
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setStep("followup")}>
                    Next: Follow-Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Follow-Up */}
          {step === "followup" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarPlus className="h-4 w-4 text-brand-600" />
                  Follow-Up Scheduling
                </CardTitle>
                <p className="text-[10px] text-medical-muted">
                  NHS GP Access Standards require follow-up within defined timeframes
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {followUpCreated ? (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Follow-up scheduled</p>
                      <p className="text-xs text-green-700">
                        {followUpTitle} — {followUpDate}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-medical-text">Follow-up title</label>
                      <Input
                        value={followUpTitle}
                        onChange={(e) => setFollowUpTitle(e.target.value)}
                        placeholder="e.g., Blood pressure review"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-medical-text">Suggested date</label>
                      <Input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="text-sm"
                      />
                      {summary?.follow_up_date && !followUpDate && (
                        <p className="text-[10px] text-brand-600">
                          AI suggested: {summary.follow_up_date}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={createFollowUp}
                      disabled={!followUpDate || !followUpTitle}
                      variant="primary"
                      size="sm"
                    >
                      Schedule Follow-Up
                    </Button>
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setStep("education")}>
                    Back
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setStep("review")}>
                    Next: Review & Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 4: Review & Close */}
          {step === "review" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-brand-600" />
                    Discharge Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {[
                      { label: "Patient Summary", done: !!summary },
                      {
                        label: "Education Materials",
                        done: selectedEducation.size > 0,
                        optional: true,
                      },
                      { label: "Follow-Up Scheduled", done: followUpCreated },
                      {
                        label: "Return Precautions",
                        done: returnPrecautions.trim().length > 0,
                        optional: true,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        {item.done ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300" />
                        )}
                        <span
                          className={
                            item.done ? "text-green-800" : "text-medical-muted"
                          }
                        >
                          {item.label}
                          {item.optional && !item.done && (
                            <span className="ml-1 text-[10px]">(optional)</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Share to portal */}
                  <label className="flex items-center gap-3 rounded-lg border border-medical-border bg-white p-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={portalShared}
                      onChange={(e) => setPortalShared(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600"
                    />
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-brand-500" />
                      <span className="text-sm text-medical-text">
                        Share summary & instructions to Patient Portal
                      </span>
                    </div>
                  </label>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setStep("followup")}>
                      Back
                    </Button>
                    <Button variant="primary" size="md" onClick={handleComplete} className="flex-1">
                      Complete Discharge & Close Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Right sidebar: Compliance Scorecard (1/3) */}
        <div className="space-y-4">
          <ComplianceScorecard
            consentGiven={consultation?.consent_given ?? false}
            consentTimestamp={consultation?.consent_timestamp ?? null}
            identityVerified={identityVerified}
            modalityDocumented={modalityDocumented}
            noteFinalized={noteFinalized}
            prescriptionCreated={prescriptionCreated}
            billingCodesAccepted={billingCodesAccepted}
            qualityCheckPassed={qualityCheckPassed}
            dischargeSummaryGenerated={!!summary}
            followUpScheduled={followUpCreated}
          />
        </div>
      </div>
    </div>
  );
}
