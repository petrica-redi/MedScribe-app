'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressData {
  date: string;
  phq9: number;
  gad7: number;
  mood: number;
}

// Demo data for patient progress
const DEMO_PROGRESS: ProgressData[] = [
  { date: '2025-10-01', phq9: 22, gad7: 18, mood: 2 },
  { date: '2025-10-15', phq9: 20, gad7: 16, mood: 3 },
  { date: '2025-11-01', phq9: 18, gad7: 15, mood: 3 },
  { date: '2025-11-15', phq9: 16, gad7: 13, mood: 4 },
  { date: '2025-12-01', phq9: 15, gad7: 12, mood: 5 },
  { date: '2025-12-15', phq9: 14, gad7: 10, mood: 5 },
  { date: '2026-01-01', phq9: 12, gad7: 9, mood: 6 },
  { date: '2026-01-15', phq9: 18, gad7: 12, mood: 4 },
  { date: '2026-02-01', phq9: 16, gad7: 11, mood: 5 },
  { date: '2026-02-15', phq9: 14, gad7: 10, mood: 5 },
];

export function PatientProgressCharts() {
  const maxPHQ9 = 27;
  const maxGAD7 = 21;

  return (
    <div className="space-y-4">
      {/* PHQ-9 Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PHQ-9 Depression Score Trend</CardTitle>
          <p className="text-xs text-gray-500">Lower is better (0-4: minimal, 5-9: mild, 10-14: moderate, 15-19: moderately severe, 20-27: severe)</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {DEMO_PROGRESS.map((d, i) => {
              const pct = (d.phq9 / maxPHQ9) * 100;
              const color = d.phq9 >= 20 ? 'bg-red-500' : d.phq9 >= 15 ? 'bg-orange-500' : d.phq9 >= 10 ? 'bg-yellow-500' : d.phq9 >= 5 ? 'bg-blue-400' : 'bg-green-500';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <span className="text-[10px] text-gray-500">{d.phq9}</span>
                  <div className={`w-full rounded-t ${color}`} style={{ height: `${pct}%`, minHeight: '4px' }} />
                  <span className="text-[9px] text-gray-400">{d.date.substring(5)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* GAD-7 Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">GAD-7 Anxiety Score Trend</CardTitle>
          <p className="text-xs text-gray-500">Lower is better (0-4: minimal, 5-9: mild, 10-14: moderate, 15-21: severe)</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {DEMO_PROGRESS.map((d, i) => {
              const pct = (d.gad7 / maxGAD7) * 100;
              const color = d.gad7 >= 15 ? 'bg-red-500' : d.gad7 >= 10 ? 'bg-orange-500' : d.gad7 >= 5 ? 'bg-yellow-500' : 'bg-green-500';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-gray-500">{d.gad7}</span>
                  <div className={`w-full rounded-t ${color}`} style={{ height: `${pct}%`, minHeight: '4px' }} />
                  <span className="text-[9px] text-gray-400">{d.date.substring(5)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mood Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Mood Self-Report</CardTitle>
          <p className="text-xs text-gray-500">Higher is better (1-10 scale)</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32">
            {DEMO_PROGRESS.map((d, i) => {
              const pct = (d.mood / 10) * 100;
              const color = d.mood >= 7 ? 'bg-green-500' : d.mood >= 4 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-gray-500">{d.mood}</span>
                  <div className={`w-full rounded-t ${color}`} style={{ height: `${pct}%`, minHeight: '4px' }} />
                  <span className="text-[9px] text-gray-400">{d.date.substring(5)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
