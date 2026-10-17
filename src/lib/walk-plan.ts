// Safe to edit by hand
// "Walk in with us" (Plan your visit): the geometry of the stone-mosaic plan of the lot and the
// building, and the gold stepping-stone route from the parking space to the pew. Ported from the
// studio mockups' walk.js (2026-10-17) and computed at BUILD time, so the finished plan is in the
// page's HTML and readable without JS; src/scripts/motion.ts only lights it up leg by leg.
//
// =============================================================================================
// PLACEHOLDER LAYOUT. The church has not shared a plan of its building yet. When it does, only
// ROOMS, STOPS and ROUTE below change; the words of each stop live in Sanity (walkSection).
// =============================================================================================

/** [x, y, w, h, kind, label, tile w, tile h] in a 800 x 620 viewBox. */
type Room = [number, number, number, number, RoomKind, string, number, number];
export type RoomKind = 'lawn' | 'lot' | 'road' | 'sanct' | 'hall' | 'kids' | 'door';

export const VIEWBOX = { w: 800, h: 620 } as const;

// PLACEHOLDER: the lot, the road and the rooms.
const ROOMS: Room[] = [
  [40, 40, 380, 260, 'lawn', '', 46, 30],
  [40, 330, 380, 200, 'lot', 'Parking', 30, 60],
  [150, 532, 80, 26, 'lot', '', 36, 20],
  [0, 562, 800, 46, 'road', 'Hamilton-Scipio Road', 64, 34],
  [460, 60, 300, 230, 'sanct', 'Sanctuary', 44, 30],
  [460, 310, 150, 170, 'hall', 'Fellowship hall', 40, 30],
  [625, 310, 135, 170, 'kids', "Children's room", 36, 30],
  [468, 486, 66, 24, 'door', 'Front doors', 30, 20],
];

/** [x, y, stone icon, tag]. Stop n on the plan pairs with stop n in Sanity. */
type Stop = [number, number, string, string];
// PLACEHOLDER: where each stop sits on the plan.
const STOPS: Stop[] = [
  [230, 440, 'map-pin', 'Park here'],
  [500, 462, 'praying-hands', 'A greeter meets you'],
  [535, 400, 'coffee', 'Coffee is here'],
  [692, 400, 'blocks', 'Kids check in here'],
  [610, 175, 'bible', 'Sit anywhere'],
];
// PLACEHOLDER: waypoints walked from the previous stop to this one (none before the first).
const ROUTE: [number, number][][] = [
  [],
  [
    [330, 474],
    [440, 488],
  ],
  [[525, 430]],
  [[600, 420]],
  [
    [692, 320],
    [640, 262],
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
    // Labels sit at each room's top edge (centred for the road, under the doors) so stop
    // markers never cover them.
    const ly = kind === 'door' ? y + h + 22 : kind === 'road' ? y + h / 2 + 6 : y + 24;
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
