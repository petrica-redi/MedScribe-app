'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEMO_SESSION_SUMMARIES } from '@/lib/demo-data';

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
        <p className="text-gray-500 mt-1">Simplified summaries and action points from your therapy sessions</p>
      </div>

      <div className="space-y-4">
        {DEMO_SESSION_SUMMARIES.map(session => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{session.therapist}</CardTitle>
                <span className="text-sm text-gray-500">{session.date}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mood Before/After */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                  <span className="text-gray-500">Before:</span>
                  <span className={`font-bold ${session.moodBefore >= 5 ? 'text-green-600' : 'text-red-600'}`}>{session.moodBefore}/10</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm">
                  <span className="text-gray-500">After:</span>
                  <span className={`font-bold ${session.moodAfter >= 5 ? 'text-green-600' : 'text-amber-600'}`}>{session.moodAfter}/10</span>
                </div>
                {session.moodAfter > session.moodBefore && (
                  <span className="text-green-500 text-sm font-medium">↑ +{session.moodAfter - session.moodBefore}</span>
                )}
              </div>

              {/* Summary */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Session Summary</p>
                <p className="text-sm text-gray-700 leading-relaxed">{session.summary}</p>
              </div>

              {/* Action Points */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Action Points</p>
                <div className="space-y-2">
                  {session.actionPoints.map((ap, i) => (
                    <label key={i} className="flex items-start gap-3 rounded-lg bg-blue-50 px-4 py-2.5 cursor-pointer hover:bg-blue-100 transition">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">{ap}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
