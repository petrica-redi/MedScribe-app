'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_MOOD_ENTRIES } from '@/lib/demo-data';

export default function MoodTrackingPage() {
  const [entries, setEntries] = useState(DEMO_MOOD_ENTRIES);
  const [newScore, setNewScore] = useState(5);
  const [newNotes, setNewNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setEntries(prev => [...prev, { date: today, score: newScore, notes: newNotes }]);
    setNewNotes('');
    setNewScore(5);
    setShowForm(false);
  };

  const last30 = entries.slice(-30);
  const last7 = entries.slice(-7);
  const avg7 = Math.round(last7.reduce((a, b) => a + b.score, 0) / last7.length * 10) / 10;
  const avg30 = Math.round(last30.reduce((a, b) => a + b.score, 0) / last30.length * 10) / 10;

  const moodEmoji = (score: number) => {
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  const moodColor = (score: number) => {
    if (score >= 7) return 'bg-green-400';
    if (score >= 4) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mood Tracking</h1>
          <p className="text-gray-500 mt-1">Track how you&apos;re feeling each day</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Log Today\'s Mood'}
        </Button>
      </div>

      {/* Add Mood Form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling? {moodEmoji(newScore)} <span className="text-2xl font-bold text-blue-600">{newScore}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Very Low</span>
                <span>Neutral</span>
                <span>Great</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
              />
            </div>
            <Button onClick={handleAdd}>Save Mood Entry</Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">7-Day Average</p>
            <p className="text-3xl font-bold text-blue-600">{avg7}</p>
            <p className="text-lg">{moodEmoji(avg7)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">30-Day Average</p>
            <p className="text-3xl font-bold text-purple-600">{avg30}</p>
            <p className="text-lg">{moodEmoji(avg30)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-gray-500">Entries Logged</p>
            <p className="text-3xl font-bold text-green-600">{entries.length}</p>
            <p className="text-xs text-gray-400 mt-1">Keep it up! 🎯</p>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Chart */}
      <Card>
        <CardHeader><CardTitle>30-Day Mood History</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {last30.map((entry, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                <div
                  className={`w-full rounded-t transition-all hover:opacity-80 cursor-pointer ${moodColor(entry.score)}`}
                  style={{ height: `${(entry.score / 10) * 100}%`, minHeight: '4px' }}
                />
                <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  {entry.date}: {entry.score}/10
                  {entry.notes && <div className="text-gray-300">{entry.notes}</div>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{last30[0]?.date}</span>
            <span>{last30[last30.length - 1]?.date}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries List */}
      <Card>
        <CardHeader><CardTitle>Recent Entries</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[...entries].reverse().slice(0, 10).map((entry, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-2xl">{moodEmoji(entry.score)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{entry.score}/10</span>
                  <span className="text-xs text-gray-500">{entry.date}</span>
                </div>
                {entry.notes && <p className="text-sm text-gray-600 mt-0.5">{entry.notes}</p>}
              </div>
              <div className={`w-3 h-3 rounded-full ${moodColor(entry.score)}`} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
