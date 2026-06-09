import {
  R32,
  R32Match,
  Round,
  Slot,
  Team,
  GroupLetter,
} from "./worldcup";

// -- Flags --------------------------------------------------------------------

/** Render a flag emoji from a team's iso2. England and Scotland use their
 *  subdivision flags; everything else maps ISO-3166 letters to the regional
 *  indicator symbols that form a flag emoji. */
export function flagEmoji(iso2: string): string {
  if (iso2 === "GB-ENG") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (iso2 === "GB-SCT") return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
  if (iso2 === "GB-WLS") return "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
  return iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// -- Slot presentation & matching ---------------------------------------------

/** Short tag for a slot, e.g. "1E", "2A", "3rd". */
export function slotShort(slot: Slot): string {
  if (slot.kind === "winner") return `1${slot.group}`;
  if (slot.kind === "runner") return `2${slot.group}`;
  return "3rd";
}

/** Descriptive label for a slot. */
export function slotLabel(slot: Slot): string {
  if (slot.kind === "winner") return `Winner Group ${slot.group}`;
  if (slot.kind === "runner") return `Runner-up Group ${slot.group}`;
  return `3rd: ${slot.groups.join("/")}`;
}

/** Could this slot be filled by the given team (in some finishing position)? */
export function slotHostsTeam(slot: Slot, team: Team): boolean {
  if (slot.kind === "third") return slot.groups.includes(team.group);
  return slot.group === team.group;
}

// -- Rounds -------------------------------------------------------------------

/** Earliest → latest. Used to compare and pick the soonest possible meeting. */
export const ROUND_ORDER: Round[] = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Final",
];

export function roundRank(round: Round): number {
  return ROUND_ORDER.indexOf(round);
}

/** The round at which the two slots of these Round-of-32 matches converge. */
export function meetingRoundOf(a: R32Match, b: R32Match): Round {
  if (a.id === b.id) return "Round of 32";
  if (a.r16 === b.r16) return "Round of 16";
  if (a.qf === b.qf) return "Quarter-finals";
  if (a.sf === b.sf) return "Semi-finals";
  return "Final";
}

// -- Positions a team can finish in -------------------------------------------

export type Position = "winner" | "runner" | "third";

export const POSITION_LABEL: Record<Position, string> = {
  winner: "wins the group (1st)",
  runner: "finishes 2nd",
  third: "finishes 3rd (and advances)",
};

export const POSITION_SHORT: Record<Position, string> = {
  winner: "1st",
  runner: "2nd",
  third: "3rd",
};

function slotMatchesPosition(
  slot: Slot,
  group: GroupLetter,
  position: Position,
): boolean {
  if (position === "winner") return slot.kind === "winner" && slot.group === group;
  if (position === "runner") return slot.kind === "runner" && slot.group === group;
  return slot.kind === "third" && slot.groups.includes(group);
}

/** A concrete place a team could stand in the bracket: one slot of one
 *  Round-of-32 match. Tracking the slot (not just the match) matters because
 *  two teams meet in the Round of 32 only if they fill the *two different*
 *  slots of the same match — they can't both be the same third-place slot. */
export interface Candidate {
  match: R32Match;
  slot: "a" | "b";
}

/** Every slot a team could occupy if it finishes in `position`. A group winner
 *  or runner-up maps to exactly one slot; a third-placed team can land in any
 *  of several slots, depending on the Annex C scenario. */
export function candidatesForPosition(
  team: Team,
  position: Position,
): Candidate[] {
  const out: Candidate[] = [];
  for (const m of R32) {
    if (slotMatchesPosition(m.a, team.group, position)) out.push({ match: m, slot: "a" });
    if (slotMatchesPosition(m.b, team.group, position)) out.push({ match: m, slot: "b" });
  }
  return out;
}

/** Can a third-placed team from this group ever advance? (Every group has a
 *  third-place slot somewhere, so this is always true — but kept explicit.) */
export function thirdCanAdvance(team: Team): boolean {
  return candidatesForPosition(team, "third").length > 0;
}

/** The round at which two specific candidate slots converge, or null if the
 *  pairing is impossible (the same single slot can't hold two teams). */
function meetingRoundOfCandidates(a: Candidate, b: Candidate): Round | null {
  if (a.match.id === b.match.id) {
    return a.slot === b.slot ? null : "Round of 32";
  }
  return meetingRoundOf(a.match, b.match);
}

// -- The headline question: when can two teams meet? --------------------------

export interface ScenarioResult {
  round: Round;
  /** The positions that produce this earliest meeting (one example each). */
  positionA: Position;
  positionB: Position;
  /** The Round-of-32 match ids involved in the example (for the bracket view). */
  matchA: number;
  matchB: number;
}

export interface MeetingResult {
  sameGroup: boolean;
  /** The soonest round in which the two teams could possibly face each other. */
  earliest: ScenarioResult;
  /** The meeting round if both teams win their groups (the "seeded" path). */
  ifBothWin: ScenarioResult | null;
}

const ALL_POSITIONS: Position[] = ["winner", "runner", "third"];

/** Best (earliest) meeting across the given candidate positions for each team. */
function bestScenario(
  team1: Team,
  team2: Team,
  positionsA: Position[],
  positionsB: Position[],
): ScenarioResult | null {
  let best: ScenarioResult | null = null;
  for (const pa of positionsA) {
    for (const ca of candidatesForPosition(team1, pa)) {
      for (const pb of positionsB) {
        for (const cb of candidatesForPosition(team2, pb)) {
          // Skip impossible pairings (both teams needing the same single slot).
          const round = meetingRoundOfCandidates(ca, cb);
          if (round === null) continue;
          if (best === null || roundRank(round) < roundRank(best.round)) {
            best = {
              round,
              positionA: pa,
              positionB: pb,
              matchA: ca.match.id,
              matchB: cb.match.id,
            };
          }
        }
      }
    }
  }
  return best;
}

export function computeMeeting(team1: Team, team2: Team): MeetingResult {
  if (team1.group === team2.group) {
    return {
      sameGroup: true,
      earliest: {
        round: "Group Stage",
        positionA: "winner",
        positionB: "winner",
        matchA: 0,
        matchB: 0,
      },
      ifBothWin: null,
    };
  }

  const earliest = bestScenario(team1, team2, ALL_POSITIONS, ALL_POSITIONS)!;
  const ifBothWin = bestScenario(team1, team2, ["winner"], ["winner"])!;

  return { sameGroup: false, earliest, ifBothWin };
}

/** Meeting round for a specific pair of finishing positions (used by the
 *  advanced "what if" controls). Returns null if that position is impossible
 *  for a team (it never is here, but guards against bad data). */
export function meetingForPositions(
  team1: Team,
  team2: Team,
  posA: Position,
  posB: Position,
): ScenarioResult | null {
  if (team1.group === team2.group) {
    return {
      round: "Group Stage",
      positionA: posA,
      positionB: posB,
      matchA: 0,
      matchB: 0,
    };
  }
  return bestScenario(team1, team2, [posA], [posB]);
}
