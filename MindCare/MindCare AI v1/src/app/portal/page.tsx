'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEMO_MOOD_ENTRIES, DEMO_SESSION_SUMMARIES, DEMO_JOURNAL_ENTRIES } from '@/lib/demo-data';
import Link from 'next/link';

export default function PatientPortalPage() {
  const recentMoods = DEMO_MOOD_ENTRIES.slice(-7);
  const avgMood = Math.round(recentMoods.reduce((a, b) => a + b.score, 0) / recentMoods.length * 10) / 10;
  const lastSession = DEMO_SESSION_SUMMARIES[0];
  const todayMood = DEMO_MOOD_ENTRIES[DEMO_MOOD_ENTRIES.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, Maria</h1>
        <p className="text-gray-500 mt-1">Here&apos;s your wellness overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700">Today&apos;s Mood</p>
            <p className="text-3xl font-bold text-blue-900">{todayMood?.score}/10</p>
            <p className="text-xs text-blue-600 mt-1">{todayMood?.notes}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <p className="text-sm text-purple-700">7-Day Average</p>
            <p className="text-3xl font-bold text-purple-900">{avgMood}</p>
            <p className="text-xs text-purple-600 mt-1">{avgMood >= 5 ? '↑ Improving' : '↓ Needs attention'}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-green-700">Sessions Completed</p>
            <p className="text-3xl font-bold text-green-900">{DEMO_SESSION_SUMMARIES.length}</p>
            <p className="text-xs text-green-600 mt-1">Next: Tomorrow at 10:00</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-700">Journal Entries</p>
            <p className="text-3xl font-bold text-amber-900">{DEMO_JOURNAL_ENTRIES.length}</p>
            <p className="text-xs text-amber-600 mt-1">Last: {DEMO_JOURNAL_ENTRIES[0]?.date}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Mini Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mood This Week</CardTitle>
            <Link href="/portal/mood" className="text-sm text-blue-600 hover:underline">View All →</Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-32">
            {recentMoods.map((entry, idx) => {
              const d = new Date(entry.date);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-700">{entry.score}</span>
                  <div
                    className={`w-full rounded-t transition-all ${entry.score >= 7 ? 'bg-green-400' : entry.score >= 4 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    style={{ height: `${(entry.score / 10) * 100}%` }}
                  />
                  <span className="text-xs text-gray-500">{d.toLocaleDateString('en', { weekday: 'short' })}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Last Session */}
        {lastSession && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Last Session Summary</CardTitle>
                <Link href="/portal/sessions" className="text-sm text-blue-600 hover:underline">All Sessions →</Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{lastSession.date}</span>
                <span>•</span>
                <span>{lastSession.therapist}</span>
              </div>
              <p className="text-sm text-gray-700">{lastSession.summary}</p>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Action Points</p>
                <ul className="space-y-1">
                  {lastSession.actionPoints.map((ap, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {ap}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Journal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Journal</CardTitle>
              <Link href="/portal/journal" className="text-sm text-blue-600 hover:underline">Write Entry →</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_JOURNAL_ENTRIES.slice(0, 2).map(entry => (
              <div key={entry.id} className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">{entry.date}</span>
                  <span className="text-xs text-blue-600 font-medium">{entry.prompt}</span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{entry.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
