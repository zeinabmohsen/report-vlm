export const REPORT_SYSTEM_SUFFIX = `
When the user asks you to generate a report or dashboard, respond with a
COMPLETE self-contained HTML document that:
1. Uses Chart.js (CDN) for all charts
2. Has KPI cards, at least 2 chart types, and a filterable/sortable data table
3. Light modern design — white background (#ffffff), soft card shadows, subtle gray borders (#e5e7eb), accent color #16a34a (green)
4. Typography: Inter or system-ui font, clean hierarchy with gray-900 headings and gray-600 body text
5. Cards with rounded corners (border-radius: 12px), gentle box-shadow, and padding
6. Fully responsive CSS grid layout with smooth fade-in animations on load
7. Has an "AI Insights" bullet-point section with a light green background highlight
8. Charts use a soft pastel color palette that fits the light theme
Return ONLY the raw HTML starting with <!DOCTYPE html> — no markdown, no explanation.
`.trim();
