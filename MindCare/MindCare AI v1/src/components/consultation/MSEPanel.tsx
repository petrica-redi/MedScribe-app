'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_MSE, type MSEFields } from '@/lib/demo-data';

interface MSEPanelProps {
  onApply?: (mse: MSEFields) => void;
}

const MSE_FIELDS: { key: keyof MSEFields; label: string }[] = [
  { key: 'appearance', label: 'Appearance' },
  { key: 'behavior', label: 'Behavior' },
  { key: 'speech', label: 'Speech' },
  { key: 'mood', label: 'Mood' },
  { key: 'affect', label: 'Affect' },
  { key: 'thoughtProcess', label: 'Thought Process' },
  { key: 'thoughtContent', label: 'Thought Content' },
  { key: 'perception', label: 'Perception' },
  { key: 'cognition', label: 'Cognition' },
  { key: 'insight', label: 'Insight' },
  { key: 'judgment', label: 'Judgment' },
];

export function MSEPanel({ onApply }: MSEPanelProps) {
  const [mse, setMse] = useState<MSEFields>(DEMO_MSE);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setMse(DEMO_MSE);
      setGenerating(false);
      setGenerated(true);
    }, 1500);
  };

  const handleFieldChange = (key: keyof MSEFields, value: string) => {
    setMse(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Mental Status Examination</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Auto-generated from consultation transcript</p>
          </div>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            variant={generated ? 'outline' : 'primary'}
          >
            {generating ? '🔄 Generating...' : generated ? '🔄 Regenerate MSE' : '🧠 Auto-Fill MSE'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!generated && !generating ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-3xl mb-2">🧠</p>
            <p className="text-sm">Click &quot;Auto-Fill MSE&quot; to generate a Mental Status Exam from the consultation transcript.</p>
          </div>
        ) : generating ? (
          <div className="text-center py-8">
            <div className="animate-pulse space-y-3">
              {MSE_FIELDS.slice(0, 5).map(f => (
                <div key={f.key} className="h-12 bg-gray-100 rounded-lg" />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">Analyzing transcript for MSE indicators...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {MSE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
                <textarea
                  value={mse[key]}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[60px] resize-none"
                  rows={2}
                />
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => onApply?.(mse)}>
                Apply to Note
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
