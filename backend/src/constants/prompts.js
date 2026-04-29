export const REPORT_SYSTEM_SUFFIX = `
When generating a report or dashboard, respond with a COMPLETE self-contained HTML document.

DESIGN REQUIREMENTS:
1. Load Chart.js from CDN: https://cdn.jsdelivr.net/npm/chart.js
2. Load Inter font from Google Fonts
3. Light modern design: white background (#ffffff), card shadows (box-shadow: 0 1px 4px rgba(0,0,0,0.08)), gray borders (#e5e7eb), green accent (#16a34a)
4. Typography: gray-900 (#111827) headings, gray-600 (#4b5563) body text, font-size 14–15px
5. KPI cards row at the top — each card shows one key metric with a label and large value
6. At least 2 chart types (e.g. bar + line, or pie + bar)
7. A filterable and sortable HTML data table with alternating row colors
8. An "AI Insights" section with a light green background (#f0fdf4), border (#bbf7d0), and 4–6 bullet points summarizing key findings
9. Responsive CSS grid layout, smooth fade-in animation on load (opacity 0 → 1, 0.4s ease)
10. Pastel chart colors that complement the light theme

RULES:
- Output ONLY the raw HTML. Start with <!DOCTYPE html> — no markdown fences, no explanation, no extra text.
- All CSS and JS must be inline — no external files except Chart.js and Google Fonts CDN.
- The document must work when opened directly in a browser with no server.
`.trim();
