# Project connections (GitHub, Vercel, Supabase)

**Source of truth for this repo.** Use at **start of session** or when setting up a new machine to verify or reconnect everything.

---

## 1. GitHub

| Setting | Value |
|--------|--------|
| **Repo** | https://github.com/dip2017/MedScribe-app |
| **Clone** | `git clone https://github.com/dip2017/MedScribe-app.git` |
| **Default branch** | `main` |
| **App subfolder** | `MedScribe/medscribe-ai-main` (Next.js app root) |

**Auth (CLI):** `gh auth login` then `gh auth setup-git` so `git push` uses GitHub CLI.

---

## 2. Vercel

| Setting | Value |
|--------|--------|
| **Project name** | medscribe-app |
| **Production URL** | https://medscribe-app-dip2017s-projects.vercel.app |
| **Root directory** | `MedScribe/medscribe-ai-main` |
| **Framework** | Next.js |
| **Build command** | `npm run build` |

**Link from repo root:**
```bash
cd /path/to/MedScribe-app
npx vercel link
# or ensure already linked: cat .vercel/project.json
npx vercel git connect --yes
```

**Env vars (Production):** Set in Vercel Dashboard → medscribe-app → Settings → Environment Variables. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPGRAM_API_KEY`, `ANTHROPIC_API_KEY`.

---

## 3. Supabase

| Setting | Value |
|--------|--------|
| **Project name** | dip2017's Project |
| **Project ref** | oltonmgkzmfcmdbmyyuq |
| **API URL** | https://oltonmgkzmfcmdbmyyuq.supabase.co |
| **Region** | West EU (Ireland) |

**Link from app folder:**
```bash
cd MedScribe/medscribe-ai-main
supabase link --project-ref oltonmgkzmfcmdbmyyuq
```

**Migrations:** Run from app folder: `supabase db push`.  
**API keys:** From Supabase Dashboard → Settings → API, or `supabase projects api-keys --project-ref oltonmgkzmfcmdbmyyuq`.

---

## Start-of-session checklist

For **new projects** or **start of session**, verify:

1. **GitHub:** Repo is present; `git remote -v` shows `dip2017/MedScribe-app`. If push fails, run `gh auth login` and `gh auth setup-git`.
2. **Vercel:** From repo root, `npx vercel project inspect medscribe-app` shows correct Root Directory (`MedScribe/medscribe-ai-main`) and Git connected. If not: `npx vercel link`, then `npx vercel git connect --yes`.
3. **Supabase:** From `MedScribe/medscribe-ai-main`, `supabase projects list` shows project and link. If not: `supabase link --project-ref oltonmgkzmfcmdbmyyuq`.

---

*Last updated: March 2026*
