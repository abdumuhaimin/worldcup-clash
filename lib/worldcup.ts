// =============================================================================
// FIFA World Cup 2026 — tournament data (single source of truth)
//
// Edit this file to correct the draw or bracket. Everything else (the
// "when do they meet?" engine and the UI) is derived from the data here.
//
// Format: 48 teams, 12 groups (A–L) of 4. Top 2 of each group plus the 8 best
// third-placed teams advance to a 32-team knockout: Round of 32 → Round of 16
// → Quarter-finals → Semi-finals → Final.
//
// The group assignments below are from the official Final Draw held in
// Washington, D.C. on 5 December 2025. The Round-of-32 bracket skeleton (which
// group position sits in which slot) is FIFA's published structure; the exact
// third-placed team that fills each "3rd place" slot is only resolved after the
// group stage (one of 495 scenarios), so those slots list the eligible groups.
// =============================================================================

export type GroupLetter =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export interface Team {
  name: string;
  /** FIFA 3-letter code. */
  code: string;
  /** ISO 3166-1 alpha-2 (used to render the flag emoji). */
  iso2: string;
  group: GroupLetter;
}

// -- Teams, listed by group ---------------------------------------------------

export const TEAMS: Team[] = [
  // Group A
  { name: "Mexico", code: "MEX", iso2: "MX", group: "A" },
  { name: "South Korea", code: "KOR", iso2: "KR", group: "A" },
  { name: "South Africa", code: "RSA", iso2: "ZA", group: "A" },
  { name: "Czechia", code: "CZE", iso2: "CZ", group: "A" },
  // Group B
  { name: "Canada", code: "CAN", iso2: "CA", group: "B" },
  { name: "Switzerland", code: "SUI", iso2: "CH", group: "B" },
  { name: "Qatar", code: "QAT", iso2: "QA", group: "B" },
  { name: "Bosnia & Herzegovina", code: "BIH", iso2: "BA", group: "B" },
  // Group C
  { name: "Brazil", code: "BRA", iso2: "BR", group: "C" },
  { name: "Haiti", code: "HAI", iso2: "HT", group: "C" },
  { name: "Morocco", code: "MAR", iso2: "MA", group: "C" },
  { name: "Scotland", code: "SCO", iso2: "GB-SCT", group: "C" },
  // Group D
  { name: "Australia", code: "AUS", iso2: "AU", group: "D" },
  { name: "Paraguay", code: "PAR", iso2: "PY", group: "D" },
  { name: "Türkiye", code: "TUR", iso2: "TR", group: "D" },
  { name: "United States", code: "USA", iso2: "US", group: "D" },
  // Group E
  { name: "Curaçao", code: "CUW", iso2: "CW", group: "E" },
  { name: "Ecuador", code: "ECU", iso2: "EC", group: "E" },
  { name: "Germany", code: "GER", iso2: "DE", group: "E" },
  { name: "Ivory Coast", code: "CIV", iso2: "CI", group: "E" },
  // Group F
  { name: "Japan", code: "JPN", iso2: "JP", group: "F" },
  { name: "Netherlands", code: "NED", iso2: "NL", group: "F" },
  { name: "Sweden", code: "SWE", iso2: "SE", group: "F" },
  { name: "Tunisia", code: "TUN", iso2: "TN", group: "F" },
  // Group G
  { name: "Belgium", code: "BEL", iso2: "BE", group: "G" },
  { name: "Egypt", code: "EGY", iso2: "EG", group: "G" },
  { name: "Iran", code: "IRN", iso2: "IR", group: "G" },
  { name: "New Zealand", code: "NZL", iso2: "NZ", group: "G" },
  // Group H
  { name: "Cape Verde", code: "CPV", iso2: "CV", group: "H" },
  { name: "Saudi Arabia", code: "KSA", iso2: "SA", group: "H" },
  { name: "Spain", code: "ESP", iso2: "ES", group: "H" },
  { name: "Uruguay", code: "URU", iso2: "UY", group: "H" },
  // Group I
  { name: "France", code: "FRA", iso2: "FR", group: "I" },
  { name: "Iraq", code: "IRQ", iso2: "IQ", group: "I" },
  { name: "Norway", code: "NOR", iso2: "NO", group: "I" },
  { name: "Senegal", code: "SEN", iso2: "SN", group: "I" },
  // Group J
  { name: "Algeria", code: "ALG", iso2: "DZ", group: "J" },
  { name: "Argentina", code: "ARG", iso2: "AR", group: "J" },
  { name: "Austria", code: "AUT", iso2: "AT", group: "J" },
  { name: "Jordan", code: "JOR", iso2: "JO", group: "J" },
  // Group K
  { name: "Colombia", code: "COL", iso2: "CO", group: "K" },
  { name: "DR Congo", code: "COD", iso2: "CD", group: "K" },
  { name: "Portugal", code: "POR", iso2: "PT", group: "K" },
  { name: "Uzbekistan", code: "UZB", iso2: "UZ", group: "K" },
  // Group L
  { name: "Croatia", code: "CRO", iso2: "HR", group: "L" },
  { name: "England", code: "ENG", iso2: "GB-ENG", group: "L" },
  { name: "Ghana", code: "GHA", iso2: "GH", group: "L" },
  { name: "Panama", code: "PAN", iso2: "PA", group: "L" },
];

export const GROUP_LETTERS: GroupLetter[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export function teamsByGroup(group: GroupLetter): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

// -- Knockout bracket ---------------------------------------------------------

export type Round =
  | "Group Stage"
  | "Round of 32"
  | "Round of 16"
  | "Quarter-finals"
  | "Semi-finals"
  | "Final";

/** A slot in a Round-of-32 match: the team that fills it is a group winner,
 *  group runner-up, or one of the best third-placed teams (which can come from
 *  any one of several groups). */
export type Slot =
  | { kind: "winner"; group: GroupLetter }
  | { kind: "runner"; group: GroupLetter }
  | { kind: "third"; groups: GroupLetter[] };

/** A Round-of-32 match plus the ids of the later matches it feeds into. The
 *  (r16, qf, sf) ancestry is all the "when do they meet?" engine needs to find
 *  the round at which any two slots converge. */
export interface R32Match {
  id: number; // 73–88
  a: Slot;
  b: Slot;
  r16: number; // 89–96
  qf: number; // 97–100
  sf: number; // 101–102
}

const w = (group: GroupLetter): Slot => ({ kind: "winner", group });
const r = (group: GroupLetter): Slot => ({ kind: "runner", group });
const t = (groups: string): Slot => ({
  kind: "third",
  groups: groups.split("/") as GroupLetter[],
});

/**
 * The 16 Round-of-32 matches of the 2026 World Cup, with each match's path
 * through the bracket. Two matches that share the same `r16` feed the same
 * Round-of-16 game; sharing `qf` means they can first meet in the
 * quarter-finals; sharing `sf` means the semi-finals; otherwise the final.
 */
export const R32: R32Match[] = [
  { id: 73, a: r("A"), b: r("B"),            r16: 90, qf: 97, sf: 101 },
  { id: 74, a: w("E"), b: t("A/B/C/D/F"),    r16: 89, qf: 97, sf: 101 },
  { id: 75, a: w("F"), b: r("C"),            r16: 90, qf: 97, sf: 101 },
  { id: 76, a: w("C"), b: r("F"),            r16: 91, qf: 99, sf: 102 },
  { id: 77, a: w("I"), b: t("C/D/F/G/H"),    r16: 89, qf: 97, sf: 101 },
  { id: 78, a: r("E"), b: r("I"),            r16: 91, qf: 99, sf: 102 },
  { id: 79, a: w("A"), b: t("C/E/F/H/I"),    r16: 92, qf: 99, sf: 102 },
  { id: 80, a: w("L"), b: t("E/H/I/J/K"),    r16: 92, qf: 99, sf: 102 },
  { id: 81, a: w("D"), b: t("B/E/F/I/J"),    r16: 94, qf: 98, sf: 101 },
  { id: 82, a: w("G"), b: t("A/E/H/I/J"),    r16: 94, qf: 98, sf: 101 },
  { id: 83, a: r("K"), b: r("L"),            r16: 93, qf: 98, sf: 101 },
  { id: 84, a: w("H"), b: r("J"),            r16: 93, qf: 98, sf: 101 },
  { id: 85, a: w("B"), b: t("E/F/G/I/J"),    r16: 96, qf: 100, sf: 102 },
  { id: 86, a: w("J"), b: r("H"),            r16: 95, qf: 100, sf: 102 },
  { id: 87, a: w("K"), b: t("D/E/I/J/L"),    r16: 96, qf: 100, sf: 102 },
  { id: 88, a: r("D"), b: r("G"),            r16: 95, qf: 100, sf: 102 },
];
