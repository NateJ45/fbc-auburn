// Safe to edit by hand
// "Walk in with us" (Plan your visit): the geometry of the stone-mosaic plan of the lot and the
// building, and the gold stepping-stone route from the parking space to the pew. Ported from the
// studio mockups' walk.js (2026-10-17) and computed at BUILD time, so the finished plan is in the
// page's HTML and readable without JS; src/scripts/motion.ts only lights it up leg by leg.
//
// =============================================================================================
// THE OUTSIDE IS REAL, THE INSIDE IS NOT YET (2026-10-24). The lot, the drive, the sign, the
// building's footprint and its front doors follow the aerial view and street photos of 4241
// Hamilton-Scipio Rd: the road along the front, the lot across the front and down the west side,
// the front gable (porch, ramp, steeple) facing the road, the white annex at the back, a concrete
// drive down the east side, and the sign with the red cross at the lot's east corner by the road.
// The plan is drawn as you arrive, road at the foot, so west is on the right. WHICH ROOMS ARE
// INSIDE (the hall, the children's room) is still a guess until the church shares a plan; only
// ROOMS, STOPS and ROUTE change then. The words of each stop live in Sanity (walkSection).
// =============================================================================================

/** [x, y, w, h, kind, label, tile w, tile h] in a 800 x 620 viewBox. */
type Room = [number, number, number, number, RoomKind, string, number, number];
export type RoomKind =
  'lawn' | 'lot' | 'drive' | 'road' | 'sanct' | 'hall' | 'kids' | 'door' | 'sign';

export const VIEWBOX = { w: 800, h: 620 } as const;

const ROOMS: Room[] = [
  // The east lawn (left), the concrete drive beside the building, the west lot (right).
  [20, 40, 160, 440, 'lawn', '', 46, 30],
  [190, 60, 44, 410, 'drive', '', 36, 40],
  [530, 40, 250, 430, 'lot', 'Parking', 30, 60],
  // The front lot between the road and the building, and the road itself.
  [190, 470, 590, 86, 'lot', '', 30, 60],
  [0, 566, 800, 46, 'road', 'Hamilton-Scipio Road', 64, 34],
  // The building: the sanctuary, its front doors facing the road, the white annex at the back.
  [250, 146, 230, 290, 'sanct', 'Sanctuary', 44, 30],
  [325, 440, 80, 22, 'door', 'Front doors', 30, 20],
  // PLACEHOLDER: the annex's rooms, until the church says which is which.
  [250, 40, 170, 96, 'hall', 'Fellowship hall', 40, 30],
  [425, 40, 95, 96, 'kids', 'Kids', 36, 30],
  // The sign and red cross, in its brick planter at the lot's east corner by the road.
  [36, 500, 70, 24, 'sign', 'Church sign', 30, 20],
];

/** [x, y, stone icon, tag]. Stop n on the plan pairs with stop n in Sanity. */
type Stop = [number, number, string, string];
const STOPS: Stop[] = [
  [650, 300, 'map-pin', 'Park here'],
  // Beside the doors, not on them, so the "Front doors" label stays readable.
  [452, 492, 'praying-hands', 'A greeter meets you'],
  // PLACEHOLDER: the inside stops follow the guessed rooms above.
  [300, 95, 'coffee', 'Coffee is here'],
  [472, 95, 'blocks', 'Kids check in here'],
  [365, 300, 'bible', 'Sit anywhere'],
];
// Waypoints walked from the previous stop to this one (none before the first): from the west
// lot round the front to the doors, then inside.
const ROUTE: [number, number][][] = [
  [],
  [[650, 505]],
  [
    // Up past the right end of the "Front doors" label, not through it.
    [425, 445],
    [365, 420],
    [320, 160],
  ],
  [[386, 116]],
  [
    [472, 160],
    [420, 230],
  ],
];

export interface Tile {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface PlanRoom {
  kind: RoomKind;
  tiles: Tile[];
  label?: { x: number; y: number; text: string };
}
export interface PathStone {
  /** Which of the three stone shapes (stone-a/b/c.svg). */
  shape: 0 | 1 | 2;
  /** The stop this stone leads TO (1-based); it is laid when that stop is reached. */
  leg: number;
  /** Order within its leg, for the stagger. */
  n: number;
  transform: string;
}
export interface PlanStop {
  /** 1-based, matches the step list's data-stop. */
  n: number;
  x: number;
  y: number;
  icon: string;
  tag: string;
  /** Tags sit above the marker, or below it near the top edge. */
  tagY: number;
  tagW: number;
}
export interface WalkPlan {
  rooms: PlanRoom[];
  stones: PathStone[];
  stops: PlanStop[];
}

/** A tiny seeded generator so the mosaic is the same on every build. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const r1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Build the plan. `stopCount` is how many stops the Sanity block has; markers and legs past it
 * are dropped so the plan never shows a stop the list does not describe.
 */
export function buildWalkPlan(stopCount: number = STOPS.length): WalkPlan {
  const rnd = seeded(11);
  const count = Math.max(0, Math.min(stopCount, STOPS.length));

  // Rooms: rounded stones with white grout, a little irregular, like the mark.
  const rooms: PlanRoom[] = ROOMS.map(([x, y, w, h, kind, label, tw, th]) => {
    const gap = 5;
    const tiles: Tile[] = [];
    for (let yy = y; yy < y + h - 4; yy += th + gap) {
      const off = (Math.round((yy - y) / (th + gap)) % 2) * (tw / 2);
      for (let xx = x - off; xx < x + w - 4; xx += tw + gap) {
        const x0 = Math.max(x, xx);
        const x1 = Math.min(x + w, xx + tw * (0.85 + rnd() * 0.3));
        const y1 = Math.min(y + h, yy + th);
        if (x1 - x0 < 8 || (kind === 'lawn' && rnd() < 0.22)) continue;
        tiles.push({ x: r1(x0), y: r1(yy), w: r1(x1 - x0), h: r1(y1 - yy) });
      }
    }
    // Labels sit at each room's top edge (centred for the road, under the doors and the sign) so stop
    // markers never cover them.
    const ly =
      kind === 'door' || kind === 'sign' ? y + h + 22 : kind === 'road' ? y + h / 2 + 6 : y + 24;
    return { kind, tiles, label: label ? { x: x + w / 2, y: ly, text: label } : undefined };
  });

  // The route: a gold stone every ~24 units along each leg, turned to face the way you walk.
  const stones: PathStone[] = [];
  let k = 0;
  for (let i = 1; i < count; i++) {
    const pts: [number, number][] = [
      [STOPS[i - 1][0], STOPS[i - 1][1]],
      ...ROUTE[i],
      [STOPS[i][0], STOPS[i][1]],
    ];
    let n = 0;
    for (let j = 1; j < pts.length; j++) {
      const [ax, ay] = pts[j - 1];
      const [bx, by] = pts[j];
      const len = Math.hypot(bx - ax, by - ay);
      const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
      const rad = (ang * Math.PI) / 180;
      const end = len - (j === pts.length - 1 ? 26 : 0);
      for (let d = j === 1 ? 30 : 0; d < end; d += 24) {
        const px = ax + ((bx - ax) * d) / len;
        const py = ay + ((by - ay) * d) / len;
        const side = k % 2 ? 3 : -3;
        stones.push({
          shape: (k % 3) as 0 | 1 | 2,
          leg: i + 1,
          n: n++,
          transform: `translate(${r1(px + side * Math.sin(rad))} ${r1(py - side * Math.cos(rad))}) rotate(${r1(ang + 90)})`,
        });
        k++;
      }
    }
  }

  const stops: PlanStop[] = STOPS.slice(0, count).map(([x, y, icon, tag], i) => ({
    n: i + 1,
    x,
    y,
    icon,
    tag,
    tagY: y < 120 ? 44 : -44,
    tagW: Math.round(tag.length * 8.6 + 26),
  }));

  return { rooms, stones, stops };
}
