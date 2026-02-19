'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_DETECTED_SYMPTOMS, type DetectedSymptom } from '@/lib/demo-data';

interface SymptomSidePanelProps {
  onConfirm?: (symptom: DetectedSymptom) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  mood: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Mood' },
  anxiety: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Anxiety' },
  psychotic: { bg: 'bg-red-100', text: 'text-red-700', label: 'Psychotic' },
  cognitive: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Cognitive' },
  behavioral: { bg: 'bg-green-100', text: 'text-green-700', label: 'Behavioral' },
  somatic: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Somatic' },
};

export function SymptomSidePanel({ onConfirm, isOpen, onToggle }: SymptomSidePanelProps) {
  const [symptoms, setSymptoms] = useState<DetectedSymptom[]>(DEMO_DETECTED_SYMPTOMS);

  const handleConfirm = (idx: number) => {
    setSymptoms(prev => prev.map((s, i) => i === idx ? { ...s, confirmed: !s.confirmed } : s));
    if (onConfirm) onConfirm(symptoms[idx]);
  };

  const confirmedCount = symptoms.filter(s => s.confirmed).length;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-indigo-500 text-white px-2 py-4 rounded-l-lg shadow-lg hover:bg-indigo-600 transition z-40 writing-mode-vertical"
        style={{ writingMode: 'vertical-lr' }}
      >
        🔍 Symptoms ({symptoms.length})
      </button>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Detected Symptoms</h3>
          <p className="text-xs text-gray-500">{confirmedCount}/{symptoms.length} confirmed</p>
        </div>
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="p-3 space-y-2">
        {symptoms.map((symptom, idx) => {
          const cat = CATEGORY_COLORS[symptom.category] || CATEGORY_COLORS.mood;
          return (
            <div
              key={idx}
              className={`rounded-lg border p-3 transition cursor-pointer ${
                symptom.confirmed 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50'
              }`}
              onClick={() => handleConfirm(idx)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{symptom.symptom}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cat.bg} ${cat.text}`}>{cat.label}</span>
                  </div>
                  <span className="text-xs font-mono text-indigo-600">{symptom.icd10}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${symptom.confidence >= 0.85 ? 'bg-green-500' : symptom.confidence >= 0.7 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${symptom.confidence * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500">{Math.round(symptom.confidence * 100)}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1 italic">{symptom.source}</p>
              {symptom.confirmed && (
                <span className="inline-flex items-center text-[10px] text-green-700 font-medium mt-1">✓ Confirmed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
