"use client";

import { useMemo, useState } from "react";
import {
  GROUP_LETTERS,
  TEAMS,
  Team,
  teamsByGroup,
} from "@/lib/worldcup";
import {
  computeMeeting,
  flagEmoji,
  meetingForPositions,
  Position,
  POSITION_LABEL,
  POSITION_SHORT,
} from "@/lib/meeting";
import Bracket from "@/components/Bracket";

const teamByCode = (code: string): Team =>
  TEAMS.find((t) => t.code === code)!;

function TeamPicker({
  side,
  value,
  onChange,
}: {
  side: "A" | "B";
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <div className="field">
      <label>{side === "A" ? "Team 1" : "Team 2"}</label>
      <select
        className={side === "A" ? "teamA" : "teamB"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {GROUP_LETTERS.map((g) => (
          <optgroup key={g} label={`Group ${g}`}>
            {teamsByGroup(g).map((t) => (
              <option key={t.code} value={t.code}>
                {flagEmoji(t.iso2)} {t.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

const POSITIONS: Position[] = ["winner", "runner", "third"];

export default function Page() {
  const [codeA, setCodeA] = useState("BRA");
  const [codeB, setCodeB] = useState("ARG");

  const teamA = teamByCode(codeA);
  const teamB = teamByCode(codeB);
  const same = teamA.code === teamB.code;

  const result = useMemo(
    () => (same ? null : computeMeeting(teamA, teamB)),
    [teamA, teamB, same],
  );

  // Advanced "what if both finish in position X" controls.
  const [posA, setPosA] = useState<Position>("winner");
  const [posB, setPosB] = useState<Position>("winner");
  const whatIf = useMemo(
    () => (same ? null : meetingForPositions(teamA, teamB, posA, posB)),
    [teamA, teamB, posA, posB, same],
  );

  return (
    <div className="wrap">
      <header className="hero">
        <h1>
          When do they <span className="grad">clash?</span>
        </h1>
        <p>
          Pick any two teams from the 2026 World Cup — see the earliest round
          they could meet.
        </p>
      </header>

      <div className="pickers">
        <TeamPicker side="A" value={codeA} onChange={setCodeA} />
        <div className="vs-badge">VS</div>
        <TeamPicker side="B" value={codeB} onChange={setCodeB} />
      </div>

      {same ? (
        <div className="result">
          <p className="lede">Pick two different teams to see when they meet.</p>
        </div>
      ) : (
        result && (
          <>
            <div className="result">
              <div className="matchup">
                <span className="flag">{flagEmoji(teamA.iso2)}</span>
                <span style={{ color: "var(--teamA)" }}>{teamA.name}</span>
                <span style={{ color: "var(--muted)" }}>vs</span>
                <span style={{ color: "var(--teamB)" }}>{teamB.name}</span>
                <span className="flag">{flagEmoji(teamB.iso2)}</span>
              </div>

              {result.sameGroup ? (
                <>
                  <p className="lede">They are both in Group {teamA.group}, so they meet in the</p>
                  <div className="round group">Group Stage</div>
                  <p className="detail">
                    Every team plays the other three in its group, so this clash
                    is guaranteed.
                  </p>
                </>
              ) : (
                <>
                  <p className="lede">The earliest they can possibly meet is the</p>
                  <div className="round knockout">{result.earliest.round}</div>
                  <div className="scenario-row">
                    <div className="scenario">
                      Earliest case: <b>{teamA.name}</b>{" "}
                      {POSITION_LABEL[result.earliest.positionA]},{" "}
                      <b>{teamB.name}</b>{" "}
                      {POSITION_LABEL[result.earliest.positionB]}
                    </div>
                    {result.ifBothWin && (
                      <div className="scenario">
                        If both win their groups:{" "}
                        <b>{result.ifBothWin.round}</b>
                      </div>
                    )}
                  </div>
                  <p className="detail">
                    Two teams from different groups can only meet in the
                    knockout rounds. The exact round depends on where each
                    finishes — try the scenarios below.
                  </p>

                  <details className="advanced">
                    <summary>What if they finish… (advanced)</summary>
                    <div className="whatif">
                      <div className="col">
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--teamA)",
                            marginBottom: 6,
                          }}
                        >
                          {teamA.name} finishes
                        </div>
                        <div className="seg">
                          {POSITIONS.map((p) => (
                            <button
                              key={p}
                              className={`a${posA === p ? " active" : ""}`}
                              onClick={() => setPosA(p)}
                            >
                              {POSITION_SHORT[p]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col">
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--teamB)",
                            marginBottom: 6,
                          }}
                        >
                          {teamB.name} finishes
                        </div>
                        <div className="seg">
                          {POSITIONS.map((p) => (
                            <button
                              key={p}
                              className={`b${posB === p ? " active" : ""}`}
                              onClick={() => setPosB(p)}
                            >
                              {POSITION_SHORT[p]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="out">→ {whatIf?.round ?? "—"}</div>
                    </div>
                    <p className="detail" style={{ marginTop: 8 }}>
                      Note: a 3rd-placed team can land in one of several bracket
                      slots (the exact one is decided after the group stage), so
                      this shows the <i>earliest</i> such slot.
                    </p>
                  </details>
                </>
              )}
            </div>

            {!result.sameGroup && (
              <>
                <div className="section-title">
                  Bracket
                  <span className="legend">
                    <span>
                      <i className="a" />
                      {teamA.name}
                    </span>
                    <span>
                      <i className="b" />
                      {teamB.name}
                    </span>
                    <span>
                      <i className="m" />
                      possible meeting
                    </span>
                  </span>
                </div>
                <Bracket teamA={teamA} teamB={teamB} result={result} />
              </>
            )}
          </>
        )
      )}

      <footer className="foot">
        <p>
          48 teams · 12 groups · top 2 of each group + 8 best third-placed teams
          advance to the Round of 32.
        </p>
        <p>
          Groups from the Final Draw (Washington, D.C., 5 Dec 2025). Bracket
          slots follow FIFA&rsquo;s published structure; the exact third-placed
          team in each slot is set after the group stage.
        </p>
      </footer>
    </div>
  );
}
