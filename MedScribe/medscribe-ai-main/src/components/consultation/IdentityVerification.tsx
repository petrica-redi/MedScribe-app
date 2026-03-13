"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Wifi, MapPin, CheckCircle2, XCircle } from "lucide-react";

interface IdentityVerificationProps {
  patientName?: string;
  patientDOB?: string | null;
  consultationId?: string;
  onVerified: (data: VerificationData) => void;
}

export interface VerificationData {
  identity_verified: boolean;
  identity_method: string;
  connection_quality_score: number;
  visit_modality: string;
  patient_location: string;
  verified_at: string;
}

type ConnectionQuality = "checking" | "excellent" | "good" | "fair" | "poor";

export function IdentityVerification({
  patientName,
  patientDOB,
  onVerified,
}: IdentityVerificationProps) {
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [dobConfirmed, setDobConfirmed] = useState(false);
  const [dobInput, setDobInput] = useState("");
  const [patientLocation, setPatientLocation] = useState("");
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>("checking");
  const [connectionScore, setConnectionScore] = useState(0);
  const [allChecked, setAllChecked] = useState(false);

  const assessConnection = useCallback(async () => {
    setConnectionQuality("checking");

    const start = performance.now();
    try {
      await fetch("/api/health", { cache: "no-store" });
    } catch {
      // even if the endpoint doesn't exist, we measure round-trip time
    }
    const latency = performance.now() - start;

    let quality: ConnectionQuality;
    let score: number;
    if (latency < 150) {
      quality = "excellent";
      score = 100;
    } else if (latency < 400) {
      quality = "good";
      score = 80;
    } else if (latency < 800) {
      quality = "fair";
      score = 60;
    } else {
      quality = "poor";
      score = 30;
    }
    setConnectionQuality(quality);
    setConnectionScore(score);
  }, []);

  useEffect(() => {
    assessConnection();
  }, [assessConnection]);

  useEffect(() => {
    const identityOk = nameConfirmed && (patientDOB ? dobConfirmed : true);
    const locationOk = patientLocation.trim().length >= 2;
    const connectionOk = connectionQuality !== "checking" && connectionQuality !== "poor";
    setAllChecked(identityOk && locationOk && connectionOk);
  }, [nameConfirmed, dobConfirmed, patientDOB, patientLocation, connectionQuality]);

  const handleVerify = () => {
    onVerified({
      identity_verified: true,
      identity_method: patientDOB ? "name_dob" : "name_verbal",
      connection_quality_score: connectionScore,
      visit_modality: "video",
      patient_location: patientLocation.trim(),
      verified_at: new Date().toISOString(),
    });
  };

  const qualityColor: Record<ConnectionQuality, string> = {
    checking: "text-gray-400",
    excellent: "text-green-600",
    good: "text-green-500",
    fair: "text-amber-500",
    poor: "text-red-600",
  };

  const qualityLabel: Record<ConnectionQuality, string> = {
    checking: "Checking...",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair — may cause audio issues",
    poor: "Poor — consider rescheduling",
  };

  return (
    <Card className="w-full max-w-md border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          Telemedicine Identity & Tech Check
        </CardTitle>
        <p className="text-xs text-medical-muted">
          Required for CMS telehealth compliance and CQC remote consultation standards
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Identity Verification */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Patient Identity</p>

          <label className="flex items-center gap-3 rounded-lg bg-white p-3 border border-medical-border cursor-pointer">
            <input
              type="checkbox"
              checked={nameConfirmed}
              onChange={(e) => setNameConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <div className="flex-1 text-sm">
              <span className="text-medical-text">Patient confirmed name verbally</span>
              {patientName && (
                <span className="ml-1 text-xs text-medical-muted">({patientName})</span>
              )}
            </div>
            {nameConfirmed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-300" />
            )}
          </label>

          {patientDOB && (
            <div className="rounded-lg bg-white p-3 border border-medical-border space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dobConfirmed}
                  onChange={(e) => setDobConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-medical-text">Date of birth confirmed</span>
                {dobConfirmed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-300" />
                )}
              </label>
              {!dobConfirmed && (
                <Input
                  type="text"
                  placeholder="Enter DOB stated by patient (DD/MM/YYYY)"
                  value={dobInput}
                  onChange={(e) => {
                    setDobInput(e.target.value);
                    if (patientDOB && e.target.value === new Date(patientDOB).toLocaleDateString("en-GB")) {
                      setDobConfirmed(true);
                    }
                  }}
                  className="text-sm"
                />
              )}
            </div>
          )}
        </div>

        {/* Patient Location */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            <MapPin className="inline h-3 w-3 mr-1" />
            Patient Location
          </p>
          <Input
            placeholder="City, State/Country (required for cross-border compliance)"
            value={patientLocation}
            onChange={(e) => setPatientLocation(e.target.value)}
            className="text-sm bg-white"
          />
          <p className="text-[10px] text-medical-muted">
            Required by state medical boards for interstate telemedicine
          </p>
        </div>

        {/* Connection Quality */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            <Wifi className="inline h-3 w-3 mr-1" />
            Connection Quality
          </p>
          <div className="flex items-center justify-between rounded-lg bg-white p-3 border border-medical-border">
            <span className={`text-sm font-medium ${qualityColor[connectionQuality]}`}>
              {qualityLabel[connectionQuality]}
            </span>
            {connectionQuality !== "checking" && (
              <span className="text-xs text-medical-muted">Score: {connectionScore}/100</span>
            )}
          </div>
          {connectionQuality === "poor" && (
            <p className="text-xs text-red-600 font-medium">
              Connection quality is below recommended threshold. Consider rescheduling or switching to audio-only.
            </p>
          )}
          <button
            onClick={assessConnection}
            className="text-xs text-blue-600 hover:underline"
          >
            Re-check connection
          </button>
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={!allChecked}
          variant="primary"
          size="sm"
          className="w-full"
        >
          {allChecked ? "Identity & Tech Verified — Continue" : "Complete all checks to continue"}
        </Button>
      </CardContent>
    </Card>
  );
}
