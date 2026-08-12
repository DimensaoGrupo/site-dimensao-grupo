// A vector reproduction of the company mark's chevron stack (there's no SVG
// source for the logo in this project — src/components/Logo.tsx wraps a
// raster placeholder PNG — so this is authored fresh from that image, not
// extracted). Five stacked "V" ribbons, evenly spaced, matching the real
// mark's proportions closely enough to read as the actual symbol once
// legible, while staying simple enough to render as a flat, deterministic
// set of polygons (no per-chevron randomness — this is the same shape on
// every page load, server and client).

export const SYMBOL_VIEWBOX = "0 0 220 190";

const CENTER_X = 110;
const HALF_WIDTH = 92;
const RISE = 30;
const THICKNESS = 20;
const ROW_SPACING = 34;
const FIRST_ROW_Y = 22;
const ROW_COUNT = 5;

function chevronPolygon(apexY: number): string {
  const points: [number, number][] = [
    [CENTER_X - HALF_WIDTH, apexY - RISE],
    [CENTER_X, apexY],
    [CENTER_X + HALF_WIDTH, apexY - RISE],
    [CENTER_X + HALF_WIDTH, apexY - RISE + THICKNESS],
    [CENTER_X, apexY + THICKNESS],
    [CENTER_X - HALF_WIDTH, apexY - RISE + THICKNESS],
  ];
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

export const CHEVRON_POLYGONS: string[] = Array.from({ length: ROW_COUNT }, (_, i) =>
  chevronPolygon(FIRST_ROW_Y + i * ROW_SPACING),
);

/** The darker "folded ribbon" underside, offset down-and-right — same construction as the real mark, flattened way down for watermark use. */
export function shadowOffset(points: string, dx = 5, dy = 6): string {
  return points
    .split(" ")
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${x + dx},${y + dy}`;
    })
    .join(" ");
}
