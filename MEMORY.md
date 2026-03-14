# MEMORY.md — Long-Term Memory

## About Diana
- Name: Diana, pronouns: ea, timezone: Europe/Bucharest (GMT+2)
- Speaks Romanian natively, prefers full RO translation when locale is set to RO
- Uses colloquial expressions ("urși" = pornește/deschide)
- Prefers action over discussion — just fix things
- Uses Chrome for testing (Safari has cert issues with self-signed certs)

## MedScribe — Medical Scribe AI App
- **Purpose:** AI-powered medical scribe for doctors — transcription, clinical notes, consultation management
- **Stack:** Next.js 15 (App Router), Supabase (auth + DB), Deepgram Nova-3 (STT), Claude Sonnet 4 (LLM)
- **Repo:** `dip2017/MedScribe-app`, app in `MedScribe/medscribe-ai-main`
- **Vercel:** project `medscribe-app`, root dir `MedScribe/medscribe-ai-main`
- **Supabase:** project ref `oltonmgkzmfcmdbmyyuq`, West EU (Ireland)

## Key Features Built (as of Feb 2026)
- Real-time transcription (EN + RO) with speaker diarization
- AI clinical note generation (Claude Sonnet 4)
- AI clinical assistant (chat-style analysis)
- Patient management with detail pages (4 tabs)
- Remote consultation via Google Meet integration
- Dual-channel audio capture (doctor mic + patient tab)
- GDPR compliance (13/19 + pseudonymization): privacy policy, terms, data export, audit log, consent, AI transparency, data processor docs
- i18n: English + Romanian

## Known Issues / Remaining Work
- GDPR remaining: consent withdrawal, data retention policy, auto-delete, human oversight for AI notes, DPIA, EU data migration
- Data residency: currently US (Supabase us-east-1, Deepgram US, Anthropic US) — EU migration planned
- Cache corruption: fix with `rm -rf .next` and restart
- Vercel `.vercel/project.json` not present in workspace — needs `vercel link` for deployments

## Technical Notes
- Custom HTTPS server at `server.mjs` with mkcert certs (port 3001)
- Start: `node server.mjs` from app folder
- Demo data: POST `/api/seed` (30 patients, 40 consultations, etc.)
- Cost estimate: ~$0.23/consultation, ~$101/month (Deepgram + Claude)
