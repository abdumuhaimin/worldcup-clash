# World Cup 2026 Clash ⚽

Pick any two teams from the **2026 FIFA World Cup** and find out the **earliest
round they could meet** — from the group stage all the way to the final.

Two teams in the same group are guaranteed to meet in the group stage. Teams in
different groups can only collide in the knockouts, and *when* depends on where
each finishes and how the bracket is wired. This app works that out and shows it
on the bracket.

## How it works

- **48 teams**, 12 groups (A–L) of four. The top two of each group plus the
  eight best third-placed teams advance to a 32-team knockout: Round of 32 →
  Round of 16 → Quarter-finals → Semi-finals → Final.
- Each Round-of-32 slot is a fixed group position (group winner, runner-up, or
  one of the best third-placed teams). The engine walks the bracket tree to find
  the round at which two teams' possible slots first converge.
- A group winner or runner-up has exactly one slot; a third-placed team can land
  in one of several slots (decided by FIFA's Annex C after the group stage), so
  the app reports the **earliest** slot it could occupy.

## Data

All tournament data lives in [`lib/worldcup.ts`](lib/worldcup.ts) — edit it to
correct the draw or bracket. Groups are from the Final Draw (Washington, D.C.,
5 December 2025); the bracket skeleton follows FIFA's published structure.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

Built with Next.js (App Router), React, and TypeScript. No backend — all logic
runs in the browser.
