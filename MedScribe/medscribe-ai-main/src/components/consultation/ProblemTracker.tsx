"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Clock, Tag, ChevronDown, ChevronUp } from "lucide-react";

export interface TrackedProblem {
  id: string;
  label: string;
  icd10?: string;
  startedAt: number;
  totalSeconds: number;
  isActive: boolean;
}

interface ProblemTrackerProps {
  isRecording: boolean;
  duration: number;
  onProblemsChange: (problems: TrackedProblem[]) => void;
}

export function ProblemTracker({ isRecording, duration, onProblemsChange }: ProblemTrackerProps) {
  const [problems, setProblems] = useState<TrackedProblem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const lastTickRef = useRef(duration);

  useEffect(() => {
    if (!isRecording) return;

    const elapsed = duration - lastTickRef.current;
    lastTickRef.current = duration;
    if (elapsed <= 0) return;

    setProblems((prev) => {
      const updated = prev.map((p) =>
        p.isActive ? { ...p, totalSeconds: p.totalSeconds + elapsed } : p
      );
      return updated;
    });
  }, [duration, isRecording]);

  useEffect(() => {
    onProblemsChange(problems);
  }, [problems, onProblemsChange]);

  const addProblem = () => {
    const label = newLabel.trim();
    if (!label) return;
    const problem: TrackedProblem = {
      id: `prob_${Date.now()}`,
      label,
      startedAt: duration,
      totalSeconds: 0,
      isActive: true,
    };
    setProblems((prev) => {
      const deactivated = prev.map((p) => ({ ...p, isActive: false }));
      return [...deactivated, problem];
    });
    setNewLabel("");
  };

  const toggleProblem = (id: string) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : { ...p, isActive: false }))
    );
  };

  const removeProblem = (id: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateICD10 = (id: string, code: string) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, icd10: code } : p))
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const mdmLevel = useCallback(() => {
    const count = problems.length;
    const totalTime = problems.reduce((s, p) => s + p.totalSeconds, 0);
    if (count >= 4 || totalTime >= 2400) return { level: "High", color: "text-red-600 bg-red-50" };
    if (count >= 3 || totalTime >= 1800) return { level: "Moderate", color: "text-amber-600 bg-amber-50" };
    if (count >= 2 || totalTime >= 900) return { level: "Low", color: "text-blue-600 bg-blue-50" };
    return { level: "Straightforward", color: "text-gray-600 bg-gray-50" };
  }, [problems]);

  const mdm = mdmLevel();

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-purple-600" />
            Problem Tracker
            {problems.length > 0 && (
              <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-medium">
                {problems.length}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${mdm.color}`}>
              MDM: {mdm.level}
            </span>
            {collapsed ? (
              <ChevronDown className="h-3 w-3 text-gray-400" />
            ) : (
              <ChevronUp className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-3 pt-0">
          {/* Add problem */}
          <div className="flex gap-2">
            <Input
              placeholder="Add problem (e.g., Hypertension)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addProblem()}
              className="text-xs h-8"
            />
            <Button onClick={addProblem} variant="outline" size="sm" className="h-8 px-2">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Problem list */}
          {problems.length === 0 ? (
            <p className="text-[11px] text-medical-muted text-center py-2">
              Tag problems as they are discussed to track time per problem for E/M coding
            </p>
          ) : (
            <div className="space-y-1.5">
              {problems.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                    p.isActive
                      ? "border-purple-300 bg-purple-50"
                      : "border-medical-border bg-white"
                  }`}
                >
                  <button
                    onClick={() => toggleProblem(p.id)}
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      p.isActive ? "bg-purple-500 animate-pulse" : "bg-gray-300"
                    }`}
                  />
                  <span className="flex-1 font-medium text-medical-text truncate">{p.label}</span>
                  <input
                    placeholder="ICD-10"
                    value={p.icd10 || ""}
                    onChange={(e) => updateICD10(p.id, e.target.value)}
                    className="w-20 rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-500"
                  />
                  <span className="flex items-center gap-1 text-[10px] text-medical-muted whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {formatTime(p.totalSeconds)}
                  </span>
                  <button onClick={() => removeProblem(p.id)} className="text-gray-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* MDM Summary */}
          {problems.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-2 text-[10px] text-medical-muted">
              <strong>E/M Complexity:</strong> {problems.length} problem(s) addressed,{" "}
              {formatTime(problems.reduce((s, p) => s + p.totalSeconds, 0))} total time →{" "}
              <span className={`font-semibold ${mdm.color.split(" ")[0]}`}>{mdm.level} MDM</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
