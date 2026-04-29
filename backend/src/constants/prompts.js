export const REPORT_SYSTEM_SUFFIX = `
When the user asks you to generate a report or dashboard, respond with a
COMPLETE self-contained HTML document that:
1. Uses Chart.js (CDN) for all charts
2. Has KPI cards, at least 2 chart types, and a filterable/sortable data table
3. Dark professional design (#0f1117 bg, #6ee7b7 accent)
4. Loads "DM Mono" + "Syne" from Google Fonts
5. Is fully responsive with smooth CSS load animations
6. Has an "AI Insights" bullet-point section
Return ONLY the raw HTML starting with <!DOCTYPE html> — no markdown, no explanation.
`.trim();
