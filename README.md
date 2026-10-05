# im3-github-agent-test-mvp
Den ganzen ETL Prozess innerhalb von Github entwickelt und distribuiert.

## GitHub Pages
Der Workflow `.github/workflows/pages.yml` führt ETL aus (`npm run build:static`) und veröffentlicht `dist/` (Frontend + `stats.json`). In den Repo-Settings unter Pages "GitHub Actions" als Source wählen; Deployment läuft bei Push auf `main`.
