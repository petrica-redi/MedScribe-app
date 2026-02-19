'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEMO_PATIENTS } from '@/lib/demo-data';

export function RiskOverviewPanel() {
  const highRisk = DEMO_PATIENTS.filter(p => p.riskLevel === 'high');
  const mediumRisk = DEMO_PATIENTS.filter(p => p.riskLevel === 'medium');
  const lowRisk = DEMO_PATIENTS.filter(p => p.riskLevel === 'low');

  const groups = [
    { label: 'High Risk', patients: highRisk, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
    { label: 'Medium Risk', patients: mediumRisk, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
    { label: 'Low Risk', patients: lowRisk, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', dot: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <CardTitle>Risk Overview</CardTitle>
          </div>
          <div className="flex gap-2">
            {groups.map(g => (
              <span key={g.label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${g.badge}`}>
                <span className={`h-2 w-2 rounded-full ${g.dot}`} />
                {g.patients.length} {g.label.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.map(group => (
            group.patients.length > 0 && (
              <div key={group.label}>
                <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${group.text}`}>{group.label} ({group.patients.length})</h4>
                <div className="space-y-2">
                  {group.patients.map(patient => (
                    <div key={patient.id} className={`rounded-lg border ${group.border} ${group.bg} p-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${group.dot}`} />
                          <span className="font-medium text-sm text-gray-900">{patient.name}</span>
                          <span className="text-xs text-gray-500 font-mono">{patient.mrn}</span>
                        </div>
                        <span className="text-xs text-gray-500">{patient.icd10}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-5">{patient.diagnosis}</p>
                      {patient.riskFlags.length > 0 && (
                        <div className="mt-1.5 ml-5 flex flex-wrap gap-1">
                          {patient.riskFlags.map((flag, i) => (
                            <span key={i} className="inline-flex items-center rounded-full bg-white/80 border border-gray-200 px-2 py-0.5 text-[10px] text-gray-600">
                              {flag.type.replace(/_/g, ' ')} • {flag.severity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
