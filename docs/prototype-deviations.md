# Prototype Deviations

## Current Intentional Deviations

- The frontend uses local route handlers through a client adapter during development instead of requiring a live Vercel-style server runtime.
- Material Symbols and player headshots from the raw prototype are not yet included; the implementation currently preserves the layout rhythm and module order without those decorative assets.
- Chart panels in Stat Explorer are represented by structured comparison blocks and trend placeholders until Recharts integrations are wired to richer datasets.
- League add/delete currently uses inline controls in the top tab bar and sidebar settings instead of a dedicated drawer/modal flow.
