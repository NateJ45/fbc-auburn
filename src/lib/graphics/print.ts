// Safe to edit by hand
// =============================================================================
// The print-shop page: a print size at its FULL size, bleed included (2026-10-28).
// =============================================================================
// Pure: it returns the HTML of a page whose @page is the trimmed size plus 1/8"
// of bleed on every side, with the graphic's SVG inlined (not a picture of it),
// so the two fonts travel as @font-face data URIs and every word stays vector
// text in the PDF that Save as PDF makes. A print shop trims the bleed off.
// raster.ts opens it in a print window (printForShop). Checked 2026-10-28 by printing it
// headless with Playwright (page.pdf): the text came out as embedded fonts, not a picture.
// Home printers use printGraphic, trimmed. docs/agent/graphics.md.
// =============================================================================

import type { Format } from './formats.ts';

/** The page size in inches: the trim plus 1/8" on every side. */
export function shopPageSize(format: Format): { inW: number; inH: number } {
  if (!format.print) throw new Error('Only print sizes print.');
  const bleedIn = 0.125; // every print size bleeds 1/8" (formats.ts rounds it to whole px)
  return { inW: format.print.inW + 2 * bleedIn, inH: format.print.inH + 2 * bleedIn };
}

/** The whole print-shop page as HTML. */
export function shopPrintHtml(svg: string, format: Format, title: string): string {
  const { inW, inH } = shopPageSize(format);
  // The SVG carries its own width and height in px; the page sets it to the paper in inches.
  const sized = svg.replace(
    /^<svg\b([^>]*?)\swidth="[^"]*"\sheight="[^"]*"/,
    `<svg$1 width="${inW}in" height="${inH}in"`,
  );
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title.replace(/[<&]/g, '')}</title>
<style>@page{size:${inW}in ${inH}in;margin:0}
html,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:${inW}in;height:${inH}in;overflow:hidden}
.page>svg{display:block;width:${inW}in;height:${inH}in}</style></head>
<body><div class="page">${sized}</div></body></html>`;
}
