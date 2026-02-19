'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ReferralLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  diagnosis?: string;
  noteSections?: { title: string; content: string }[];
}

export function ReferralLetterModal({ isOpen, onClose, patientName = 'Maria Popescu', diagnosis = 'F33.1 — Major Depressive Disorder, Recurrent', noteSections = [] }: ReferralLetterModalProps) {
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState('');

  const generateLetter = () => {
    setGenerating(true);
    setTimeout(() => {
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const chiefComplaint = noteSections.find(s => s.title.toLowerCase().includes('complaint'))?.content || 'Persistent depressive symptoms with suicidal ideation';
      const assessment = noteSections.find(s => s.title.toLowerCase().includes('assessment'))?.content || 'Patient presents with moderately severe major depressive disorder with passive suicidal ideation.';
      
      setLetter(`REFERRAL LETTER

Date: ${today}
From: Dr. Elena Stanescu, MD — Psychiatry
MindCare AI Mental Health Clinic

To: [Receiving Physician/Specialist]

RE: ${patientName}
Diagnosis: ${diagnosis}

Dear Colleague,

I am referring the above-named patient for [further evaluation/specialized treatment/second opinion] regarding their ongoing psychiatric condition.

REASON FOR REFERRAL:
${patientName} has been under my care since [date] for treatment of ${diagnosis}. Despite adequate trials of medication and psychotherapy, the patient's condition has shown [limited improvement/recent deterioration], warranting specialized consultation.

PRESENTING COMPLAINT:
${chiefComplaint}

CURRENT ASSESSMENT:
${assessment}

CURRENT TREATMENT:
- Sertraline 100mg daily (titrated from 50mg over 8 weeks)
- Weekly CBT sessions (12 sessions completed)
- Sleep hygiene counseling

RELEVANT HISTORY:
- PHQ-9 Score: 18 (moderately severe)
- GAD-7 Score: 12 (moderate)
- Previous medication trials: Fluoxetine (discontinued due to side effects)
- No history of inpatient psychiatric hospitalization

SPECIFIC QUESTIONS/REQUESTS:
1. Evaluation for treatment-resistant depression management
2. Consideration of augmentation strategies
3. Assessment for comorbid conditions

Please find enclosed the relevant clinical notes and assessment results. I would appreciate your evaluation and recommendations for ongoing management.

Thank you for your assistance in the care of this patient.

Sincerely,

Dr. Elena Stanescu, MD
Psychiatry
MindCare AI Mental Health Clinic
Tel: +40 21 xxx xxxx
Email: dr.stanescu@mindcare.ai`);
      setGenerating(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Generate Referral Letter</h2>
            <p className="text-xs text-gray-500">Auto-generated from session notes for {patientName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!letter && !generating ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📄</p>
              <p className="text-gray-700 font-medium">Generate a referral letter from this consultation</p>
              <p className="text-sm text-gray-500 mt-1">The letter will be pre-filled with patient details and clinical findings.</p>
              <Button className="mt-4" onClick={generateLetter}>Generate Referral Letter</Button>
            </div>
          ) : generating ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-500">Generating referral letter from clinical notes...</p>
            </div>
          ) : (
            <textarea
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              className="w-full min-h-[500px] font-mono text-sm border border-gray-200 rounded-lg p-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
            />
          )}
        </div>

        {letter && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <Button variant="outline" onClick={() => { setLetter(''); }}>Regenerate</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(letter);
              }}>Copy to Clipboard</Button>
              <Button onClick={() => {
                const blob = new Blob([letter], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `referral-${patientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}>Download</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
