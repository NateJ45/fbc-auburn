// Safe to edit by hand
// The order a mason would lay a small set of bricks (2026-10-24): bottom course first, left to
// right, then back right to left on the course above, and so on. Used by the sill and the
// stepped section markers, whose bricks are generated paths (src/components/home/
// stones.generated.ts); the laying itself is CSS (src/styles/flow.css "Brick laid by brick").
//
// Each path's position is read from its first "M x y". Paths that start within a few units of
// each other on one course are the same brick (a face and its printed rim) and share a turn.

const COURSE_GAP = 6; // a new course starts this far below the last one
const BRICK_GAP = 14; // a new brick starts this far along the course

/** One turn number per path, in the input order: 0 is laid first. */
export function layOrder(paths: readonly { d: string }[]): number[] {
  const pos = paths.map((p, i) => {
    const m = /M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(p.d);
    return { i, x: m ? Number(m[1]) : 0, y: m ? Number(m[2]) : 0 };
  });
  // Courses, bottom first (SVG y grows downward).
  const byY = [...pos].sort((a, b) => b.y - a.y);
  const courses: (typeof pos)[] = [];
  for (const p of byY) {
    const last = courses[courses.length - 1];
    if (!last || last[last.length - 1].y - p.y > COURSE_GAP) courses.push([p]);
    else last.push(p);
  }
  const turn = new Array<number>(paths.length).fill(0);
  let n = -1;
  courses.forEach((course, c) => {
    const row = [...course].sort((a, b) => (c % 2 ? b.x - a.x : a.x - b.x));
    let lastX = Number.NaN;
    for (const p of row) {
      if (!(Math.abs(p.x - lastX) <= BRICK_GAP)) n++;
      turn[p.i] = n;
      lastX = p.x;
    }
  });
  return turn;
}
