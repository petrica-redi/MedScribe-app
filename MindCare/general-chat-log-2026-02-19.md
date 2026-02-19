# Discuție din #general — 19 Feb 2026

## Rezumat
Diana a cerut în #general (din greșeală, trebuia în #startup):

### Ce a cerut Diana:
1. **Descrie primele activități din roadmap** — ce presupun
2. **De ce ai nevoie pentru schimbări?** — acces cod, chei API, DB
3. **Creează date demo** pentru pacienți psihiatrici (psihologi, psihoterapeuți, psihiatri) — la MVP le populăm cu date reale
4. **Ajustează Notion task list** pentru demo, integrând features din Market Research + transcrieri
5. **Transcrierile au fost și în engleză** — nu doar română
6. **Fă lista de priorități** și pune-le în Notion
7. **Adresează punctele critice (P0)** apoi mută-te la P1
8. **Salvează versiunea anterioară** (backup) și **salvează și noua versiune** — ca să poată reveni dacă apar erori

### Ce s-a făcut din #general:
- ✅ Notion actualizat cu 43 task-uri demo
- ✅ Sub-agent lansat pentru date demo (3 clinicieni, 12-15 pacienți, transcrieri RO+EN, risk flags)
- ✅ Backup: `git commit` + `git tag v0-backup`
- ⚠️ Sub-agentul a dat eroare la git (main branch fără commits) — trebuie rezolvat
- ✅ Explicat risk flags, features, roadmap

### Acțiuni de făcut (mutat în #startup):
1. **Backup git corect** — commit versiunea curentă, tag `v0-backup`
2. **Atac P0 task-uri critice** din cod
3. **Apoi P1 task-uri importante**
4. **Salvează fiecare versiune** — tag-uri git
