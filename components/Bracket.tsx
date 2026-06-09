"use client";

import { R32, R32Match, Team } from "@/lib/worldcup";
import {
  MeetingResult,
  slotHostsTeam,
  slotLabel,
  slotShort,
} from "@/lib/meeting";

// Fixed top-to-bottom layout so that paired matches sit next to each other.
const R16_ORDER = [90, 89, 94, 93, 91, 92, 95, 96];
const QF_ORDER = [97, 98, 99, 100];
const SF_ORDER = [101, 102];

const byId = (id: number): R32Match => R32.find((m) => m.id === id)!;
const r32ForR16 = (r16: number) => R32.filter((m) => m.r16 === r16);

/** The bracket node at which the earliest meeting happens, so we can ring it. */
function meetNodeId(result: MeetingResult): { round: string; id: number } | null {
  if (result.sameGroup) return null;
  const { round, matchA } = result.earliest;
  const m = byId(matchA);
  switch (round) {
    case "Round of 32":
      return { round, id: m.id };
    case "Round of 16":
      return { round, id: m.r16 };
    case "Quarter-finals":
      return { round, id: m.qf };
    case "Semi-finals":
      return { round, id: m.sf };
    default:
      return { round: "Final", id: 104 };
  }
}

function R32Cell({
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
          <div className={`slot ${cls}`} key={i} title={slotLabel(slot)}>
            <span className="pos">{slotShort(slot)}</span>
            <span className="lbl">{slotLabel(slot)}</span>
          </div>
        );
      })}
    </div>
  );
}

function FutureCell({
  label,
  matchNo,
  isMeet,
}: {
  label: string;
  matchNo: number;
  isMeet: boolean;
}) {
  return (
    <div className={`node future${isMeet ? " meet" : ""}`}>
      {isMeet ? `⚔️ ${label}` : `${label} · M${matchNo}`}
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

  return (
    <div className="bracket-scroll">
      <div className="bracket">
        {/* Round of 32 */}
        <div className="col">
          <div className="col-head">Round of 32</div>
          {R16_ORDER.flatMap((r16) =>
            r32ForR16(r16).map((m) => (
              <R32Cell
                key={m.id}
                match={m}
                teamA={teamA}
                teamB={teamB}
                isMeet={isMeet("Round of 32", m.id)}
              />
            )),
          )}
        </div>

        {/* Round of 16 */}
        <div className="col">
          <div className="col-head">Round of 16</div>
          {R16_ORDER.map((r16) => (
            <FutureCell
              key={r16}
              label="Round of 16"
              matchNo={r16}
              isMeet={isMeet("Round of 16", r16)}
            />
          ))}
        </div>

        {/* Quarter-finals */}
        <div className="col">
          <div className="col-head">Quarter-finals</div>
          {QF_ORDER.map((qf) => (
            <FutureCell
              key={qf}
              label="Quarter-final"
              matchNo={qf}
              isMeet={isMeet("Quarter-finals", qf)}
            />
          ))}
        </div>

        {/* Semi-finals */}
        <div className="col">
          <div className="col-head">Semi-finals</div>
          {SF_ORDER.map((sf) => (
            <FutureCell
              key={sf}
              label="Semi-final"
              matchNo={sf}
              isMeet={isMeet("Semi-finals", sf)}
            />
          ))}
        </div>

        {/* Final */}
        <div className="col">
          <div className="col-head">Final</div>
          <FutureCell label="Final" matchNo={104} isMeet={isMeet("Final", 104)} />
        </div>
      </div>
    </div>
  );
}
