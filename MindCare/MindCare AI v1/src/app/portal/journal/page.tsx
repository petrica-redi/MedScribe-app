'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DEMO_JOURNAL_ENTRIES, JOURNAL_PROMPTS } from '@/lib/demo-data';

export default function JournalPage() {
  const [entries, setEntries] = useState(DEMO_JOURNAL_ENTRIES);
  const [showForm, setShowForm] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(JOURNAL_PROMPTS[0]);
  const [content, setContent] = useState('');

  const handleSave = () => {
    if (!content.trim()) return;
    const newEntry = {
      id: `j${entries.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      prompt: selectedPrompt,
      content: content.trim(),
    };
    setEntries(prev => [newEntry, ...prev]);
    setContent('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guided Journal</h1>
          <p className="text-gray-500 mt-1">Reflect on your thoughts and feelings with guided prompts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '✍️ New Entry'}
        </Button>
      </div>

      {/* Write Form */}
      {showForm && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="pt-6 space-y-4">
            {/* Prompt Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose a prompt</label>
              <div className="flex flex-wrap gap-2">
                {JOURNAL_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setSelectedPrompt(prompt)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      selectedPrompt === prompt
                        ? 'bg-purple-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Display */}
            <div className="rounded-lg bg-white border border-purple-200 p-4">
              <p className="text-lg font-medium text-purple-900">{selectedPrompt}</p>
            </div>

            {/* Text Area */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 min-h-[200px] leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{content.length} characters</span>
              <Button onClick={handleSave} disabled={!content.trim()}>Save Entry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries */}
      <div className="space-y-4">
        {entries.map(entry => (
          <Card key={entry.id}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">{entry.date}</span>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{entry.prompt}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">📝</p>
            <p>No journal entries yet. Start writing!</p>
          </div>
        )}
      </div>
    </div>
  );
}
