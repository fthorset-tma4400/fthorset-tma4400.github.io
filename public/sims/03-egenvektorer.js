/**
 * Egenvektorer under en lineær avbildning (DOM-host, SVG).
 * Leseren vrir en enhetsvektor x rundt sirkelen og ser M x. Den stiplede
 * ellipsen er bildet av enhetssirkelen. Når M x ligger på linjen gjennom x,
 * er x en egenvektor, og pila skifter farge og får påskriften λ = …
 */
const PRESETS = [
  { name: "M₁", m: [2, 1, 1, 2] }, // λ = 3, 1
  { name: "M₂", m: [1, 2, 2, 1] }, // λ = 3, −1
  { name: "M₃", m: [1, 1, 0, 1] }, // λ = 1 (bare én egenretning)
  { name: "M₄", m: [0, -1, 1, 0] }, // rotasjon, ingen reelle egenvektorer
];

export default function init({ stage, controls, getSize, onResize }) {
  let deg = 20;
  let preset = 0;

  const btns = PRESETS.map((p, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = p.name;
    b.setAttribute("aria-pressed", i === preset ? "true" : "false");
    b.addEventListener("click", () => {
      preset = i;
      btns.forEach((o, j) => o.setAttribute("aria-pressed", j === i ? "true" : "false"));
      render();
    });
    return b;
  });

  const label = document.createElement("label");
  label.append("Retning til x ");
  const out = document.createElement("output");
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "359";
  input.step = "1";
  input.value = String(deg);
  input.setAttribute("aria-label", "Vinkelen til vektoren x i grader");
  label.append(out, input);

  controls.append(...btns, label);

  // Largest stretch of M (largest singular value), used to fit the drawing.
  function sigmaMax([a, b, c, d]) {
    const s = a * a + b * b + c * c + d * d;
    const det = a * d - b * c;
    return Math.sqrt((s + Math.sqrt(Math.max(0, s * s - 4 * det * det))) / 2);
  }

  function arrow(x1, y1, x2, y2, color, width) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return "";
    const ux = dx / len;
    const uy = dy / len;
    const hs = Math.min(10, len * 0.4);
    const bx = x2 - ux * hs;
    const by = y2 - uy * hs;
    const px = -uy * hs * 0.45;
    const py = ux * hs * 0.45;
    return (
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" style="stroke:${color};stroke-width:${width}"/>` +
      `<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${(bx + px).toFixed(1)},${(by + py).toFixed(1)} ${(bx - px).toFixed(1)},${(by - py).toFixed(1)}" style="fill:${color}"/>`
    );
  }

  const fmt = (v) => {
    const r = Math.round(v * 100) / 100;
    return (Object.is(r, -0) ? 0 : r).toString().replace(".", ",").replace("-", "−");
  };

  function render() {
    const { w, h } = getSize();
    const m = PRESETS[preset].m;
    const [a, b, c, d] = m;
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.max(40, Math.min(w, h) / 2 - 22);
    const s = R / sigmaMax(m); // pixels per unit

    const t = (deg * Math.PI) / 180;
    const x = [Math.cos(t), Math.sin(t)];
    const Mx = [a * x[0] + b * x[1], c * x[0] + d * x[1]];
    const lenMx = Math.hypot(Mx[0], Mx[1]);
    const cross = x[0] * Mx[1] - x[1] * Mx[0];
    const dot = x[0] * Mx[0] + x[1] * Mx[1];
    const aligned = lenMx > 1e-9 && Math.abs(cross) / lenMx < Math.sin((1.5 * Math.PI) / 180);
    const lambda = dot; // x has length 1, so M x = λ x gives λ = x·M x

    // Image of the unit circle (an ellipse) as a polyline.
    let ell = "";
    for (let k = 0; k <= 120; k++) {
      const u = (k / 120) * 2 * Math.PI;
      const ex = a * Math.cos(u) + b * Math.sin(u);
      const ey = c * Math.cos(u) + d * Math.sin(u);
      ell += `${k ? "L" : "M"} ${(cx + s * ex).toFixed(1)} ${(cy - s * ey).toFixed(1)} `;
    }

    const xColor = "var(--accent)";
    const mColor = aligned ? "var(--green)" : "var(--orange)";
    const tip = (v, k) => [cx + k * s * v[0], cy - k * s * v[1]];
    const [xx, xy] = tip(x, 1);
    const [mx, my] = tip(Mx, 1);

    // Line through x (the eigen-direction candidate), faint.
    const L = Math.hypot(w, h);
    const lineThroughX =
      `<line x1="${(cx - L * x[0]).toFixed(1)}" y1="${(cy + L * x[1]).toFixed(1)}" x2="${(cx + L * x[0]).toFixed(1)}" y2="${(cy - L * x[1]).toFixed(1)}" style="stroke:var(--border-strong);stroke-width:1;stroke-dasharray:2 4"/>`;

    // Matrix shown top-left as two rows in brackets.
    const mx0 = 14;
    const my0 = 18;
    const cw = 22;
    const matrix =
      `<text x="${mx0}" y="${my0 + 13}" style="fill:var(--fg);font-family:var(--font-mono);font-size:13px">M =</text>` +
      `<path d="M ${mx0 + 40} ${my0} h -4 v 34 h 4 M ${mx0 + 44 + 2 * cw + 4} ${my0} h 4 v 34 h -4" style="fill:none;stroke:var(--muted);stroke-width:1.2"/>` +
      [[a, b], [c, d]]
        .map((row, i) =>
          row
            .map(
              (v, j) =>
                `<text x="${mx0 + 44 + j * cw + cw / 2}" y="${my0 + 13 + i * 16}" text-anchor="middle" style="fill:var(--fg);font-family:var(--font-mono);font-size:13px">${fmt(v)}</text>`,
            )
            .join(""),
        )
        .join("");

    // Label placement: a little beyond each arrow tip.
    const lab = (px, py, vx, vy, text, color) => {
      const n = Math.hypot(vx, vy) || 1;
      return `<text x="${(px + (14 * vx) / n).toFixed(1)}" y="${(py - (14 * vy) / n).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" style="fill:${color};font-family:var(--font-mono);font-size:13px">${text}</text>`;
    };

    let mLabel = "Mx";
    if (aligned) mLabel = `Mx = ${fmt(lambda)}x`;
    else if (lenMx < 1e-9) mLabel = "Mx = 0";

    stage.innerHTML =
      `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" role="img" aria-label="Vektoren x på enhetssirkelen og bildet M x" style="display:block">` +
      `<line x1="8" y1="${cy}" x2="${w - 8}" y2="${cy}" style="stroke:var(--border);stroke-width:1"/>` +
      `<line x1="${cx}" y1="8" x2="${cx}" y2="${h - 8}" style="stroke:var(--border);stroke-width:1"/>` +
      lineThroughX +
      `<circle cx="${cx}" cy="${cy}" r="${s.toFixed(1)}" style="fill:none;stroke:var(--border-strong);stroke-width:1.5"/>` +
      `<path d="${ell}" style="fill:none;stroke:var(--faint);stroke-width:1.5;stroke-dasharray:5 4"/>` +
      arrow(cx, cy, mx, my, mColor, 2.5) +
      arrow(cx, cy, xx, xy, xColor, 2.5) +
      `<text x="${(cx + 0.55 * s * x[0] - 13 * x[1]).toFixed(1)}" y="${(cy - 0.55 * s * x[1] - 13 * x[0]).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" style="fill:${xColor};font-family:var(--font-mono);font-size:13px">x</text>` +
      (lenMx > 1e-9 ? lab(mx, my, Mx[0], Mx[1], mLabel, mColor) : "") +
      matrix +
      `</svg>`;

    out.textContent = `${deg}°`;
  }

  input.addEventListener("input", () => {
    deg = Number(input.value);
    render();
  });

  onResize(render);
  render();
}
