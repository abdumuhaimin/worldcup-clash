"use client";

import { R32, R32Match, Team } from "@/lib/worldcup";
import {
  MeetingResult,
  slotHostsTeam,
  slotLabel,
  slotShort,
} from "@/lib/meeting";

const R16_ORDER = [90, 89, 94, 93, 91, 92, 95, 96];
const QF_ORDER = [97, 98, 99, 100];
const SF_ORDER = [101, 102];

const byId = (id: number): R32Match => R32.find((m) => m.id === id)!;
const r32ForR16 = (r16: number) => R32.filter((m) => m.r16 === r16);

function meetNodeId(result: MeetingResult): { round: string; id: number } | null {
  if (result.sameGroup) return null;
  const { round, matchA } = result.earliest;
  const m = byId(matchA);
  switch (round) {
    case "Round of 32":   return { round, id: m.id };
    case "Round of 16":   return { round, id: m.r16 };
    case "Quarter-finals": return { round, id: m.qf };
    case "Semi-finals":   return { round, id: m.sf };
    default:              return { round: "Final", id: 104 };
  }
}

/** All possible R32 matches a team could appear in (any finishing position). */
function r32MatchesForTeam(team: Team): R32Match[] {
  return R32.filter((m) => slotHostsTeam(m.a, team) || slotHostsTeam(m.b, team));
}

/** Outgoing-connector class for a cell, by its index within its round: even =
 *  top of its pair (connector elbows down to the parent), odd = bottom (up). */
const out = (i: number): string => (i % 2 === 0 ? "out-top" : "out-bot");

function R32Box({
  match,
  teamA,
  teamB,
  isMeet,
}: {
  match: R32Match;
  teamA: Team;
  teamB: Team;
  isMeet: boolean;
}) {
  return (
    <div className={`node${isMeet ? " meet" : ""}`}>
      <div className="mno">M{match.id}</div>
      {[match.a, match.b].map((slot, i) => {
        const a = slotHostsTeam(slot, teamA);
        const b = slotHostsTeam(slot, teamB);
        const cls = a && b ? "ab" : a ? "a" : b ? "b" : "";
        return (
          <div className={`slot${cls ? ` ${cls}` : ""}`} key={i} title={slotLabel(slot)}>
            <span className="pos">{slotShort(slot)}</span>
            <span className="lbl">{slotLabel(slot)}</span>
          </div>
        );
      })}
    </div>
  );
}

function FutureBox({
  label,
  matchNo,
  isMeet,
  hasA,
  hasB,
}: {
  label: string;
  matchNo: number;
  isMeet: boolean;
  hasA: boolean;
  hasB: boolean;
}) {
  const teamCls = isMeet ? "" : hasA && hasB ? "ab" : hasA ? "a" : hasB ? "b" : "";
  const cls = `node future${isMeet ? " meet" : ""}${teamCls ? ` ${teamCls}` : ""}`;
  return (
    <div className={cls} title={isMeet ? label : `${label} · Match ${matchNo}`}>
      {isMeet ? `⚔️ ${label}` : `M${matchNo}`}
    </div>
  );
}

export default function Bracket({
  teamA,
  teamB,
  result,
}: {
  teamA: Team;
  teamB: Team;
  result: MeetingResult;
}) {
  const meet = meetNodeId(result);
  const isMeet = (round: string, id: number) =>
    meet !== null && meet.round === round && meet.id === id;

  // Compute which future matches each team could possibly reach.
  const r32A = r32MatchesForTeam(teamA);
  const r32B = r32MatchesForTeam(teamB);
  const r16A = new Set(r32A.map((m) => m.r16));
  const r16B = new Set(r32B.map((m) => m.r16));
  const qfA  = new Set(r32A.map((m) => m.qf));
  const qfB  = new Set(r32B.map((m) => m.qf));
  const sfA  = new Set(r32A.map((m) => m.sf));
  const sfB  = new Set(r32B.map((m) => m.sf));

  // Flatten R32 in the same R16-grouped order used for grid positioning. The
  // ordering is a true bracket order: each consecutive pair feeds the next
  // round's match, so the connector elbows always join adjacent siblings.
  const r32Cells = R16_ORDER.flatMap((r16) => r32ForR16(r16));

  // CSS Grid layout:
  //   Columns: R32 | R16 | QF | SF | Final
  //   Rows: row 1 = headers, rows 2–17 = 16 bracket slots
  //
  //   R32  cells: 1 row each  → gridRow = idx + 2
  //   R16  cells: 2 rows each → gridRow = j*2+2 / j*2+4
  //   QF   cells: 4 rows each → gridRow = k*4+2 / k*4+6
  //   SF   cells: 8 rows each → gridRow = l*8+2 / l*8+10
  //   Final:     16 rows      → gridRow = 2 / 18
  //
  // Each match sits in a `.cell` that fills its grid area; the visible box is
  // centered inside it and the bracket connector lines are drawn in the column
  // gaps via the cell's ::before / ::after. Because every cell in a round is the
  // same height and spans twice the rows of the previous round, a parent always
  // lands on the midpoint of its two children and the elbows line up exactly.

  return (
    <div className="bracket-scroll">
      <div className="bracket">
        {/* Column headers */}
        <div className="col-head" style={{ gridColumn: 1, gridRow: 1 }}>Round of 32</div>
        <div className="col-head" style={{ gridColumn: 2, gridRow: 1 }}>Round of 16</div>
        <div className="col-head" style={{ gridColumn: 3, gridRow: 1 }}>Quarter-finals</div>
        <div className="col-head" style={{ gridColumn: 4, gridRow: 1 }}>Semi-finals</div>
        <div className="col-head" style={{ gridColumn: 5, gridRow: 1 }}>Final</div>

        {/* Round of 32 — column 1, one row per match (feeds rightward only) */}
        {r32Cells.map((m, idx) => (
          <div
            key={m.id}
            className={`cell ${out(idx)}${isMeet("Round of 32", m.id) ? " meet" : ""}`}
            style={{ gridColumn: 1, gridRow: idx + 2 }}
          >
            <R32Box
              match={m}
              teamA={teamA}
              teamB={teamB}
              isMeet={isMeet("Round of 32", m.id)}
            />
          </div>
        ))}

        {/* Round of 16 — column 2, each spans 2 rows */}
        {R16_ORDER.map((r16, j) => (
          <div
            key={r16}
            className={`cell in ${out(j)}${isMeet("Round of 16", r16) ? " meet" : ""}`}
            style={{ gridColumn: 2, gridRow: `${j * 2 + 2} / ${j * 2 + 4}` }}
          >
            <FutureBox
              label="Round of 16"
              matchNo={r16}
              isMeet={isMeet("Round of 16", r16)}
              hasA={r16A.has(r16)}
              hasB={r16B.has(r16)}
            />
          </div>
        ))}

        {/* Quarter-finals — column 3, each spans 4 rows */}
        {QF_ORDER.map((qf, k) => (
          <div
            key={qf}
            className={`cell in ${out(k)}${isMeet("Quarter-finals", qf) ? " meet" : ""}`}
            style={{ gridColumn: 3, gridRow: `${k * 4 + 2} / ${k * 4 + 6}` }}
          >
            <FutureBox
              label="Quarter-final"
              matchNo={qf}
              isMeet={isMeet("Quarter-finals", qf)}
              hasA={qfA.has(qf)}
              hasB={qfB.has(qf)}
            />
          </div>
        ))}

        {/* Semi-finals — column 4, each spans 8 rows */}
        {SF_ORDER.map((sf, l) => (
          <div
            key={sf}
            className={`cell in ${out(l)}${isMeet("Semi-finals", sf) ? " meet" : ""}`}
            style={{ gridColumn: 4, gridRow: `${l * 8 + 2} / ${l * 8 + 10}` }}
          >
            <FutureBox
              label="Semi-final"
              matchNo={sf}
              isMeet={isMeet("Semi-finals", sf)}
              hasA={sfA.has(sf)}
              hasB={sfB.has(sf)}
            />
          </div>
        ))}

        {/* Final — column 5, spans all 16 rows (fed from the left only) */}
        <div
          className={`cell in${isMeet("Final", 104) ? " meet" : ""}`}
          style={{ gridColumn: 5, gridRow: "2 / 18" }}
        >
          <FutureBox
            label="Final"
            matchNo={104}
            isMeet={isMeet("Final", 104)}
            hasA
            hasB
          />
        </div>
      </div>
    </div>
  );
}
