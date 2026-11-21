/**
 * Newtons metode steg for steg (DOM-host, SVG).
 * f(x) = (x + 1)(x² − 3) med nullpunkter −√3, −1 og √3.
 * Leseren velger startverdi x₀ og antall steg. Hvert steg tegnes som en
 * loddrett strek opp til grafen og tangenten ned til x-aksen.
 */
const f = (x) => (x + 1) * (x * x - 3);
const df = (x) => 3 * x * x + 2 * x - 3;
const XMIN = -3;
const XMAX = 3;
const YMIN = -6;
const YMAX = 9;
const SUB = ["₀", "₁", "₂", "₃", "₄", "₅", "₆"];

export default function init({ stage, controls, getSize, onResize }) {
  let x0 = 2;
  let steps = 3;

  function slider(text, min, max, step, value, aria, onInput) {
    const label = document.createElement("label");
    label.append(text);
    const out = document.createElement("output");
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    input.setAttribute("aria-label", aria);
    input.addEventListener("input", () => {
      onInput(Number(input.value));
      render();
    });
    label.append(out, input);
    controls.append(label);
    return out;
  }

  const outX0 = slider("x₀ ", -3, 3, 0.01, x0, "Startverdi x null", (v) => (x0 = v));
  const outN = slider("Steg ", 0, 6, 1, steps, "Antall Newton-steg", (v) => (steps = v));
  const readout = document.createElement("div");
  readout.className = "sim-readout";
  controls.append(readout);

  const num = (v, d = 4) => {
    if (!Number.isFinite(v)) return "udefinert";
    const r = Number(v.toFixed(d));
    return (Object.is(r, -0) ? 0 : r).toString().replace(".", ",").replace("-", "−");
  };

  function render() {
    const { w, h } = getSize();
    const padL = 12;
    const padR = 12;
    const padT = 12;
    const padB = 30;
    const sx = (x) => padL + ((x - XMIN) / (XMAX - XMIN)) * (w - padL - padR);
    const sy = (y) => padT + ((YMAX - y) / (YMAX - YMIN)) * (h - padT - padB);
    const clampY = (y) => Math.max(YMIN - 1, Math.min(YMAX + 1, y));
    const yAxis = sy(0);
    const mono = "font-family:var(--font-mono);font-size:12px";

    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" role="img" aria-label="Graf av f med tangentene i Newtons metode" style="display:block">`;
    svg += `<defs><clipPath id="nw-clip"><rect x="${padL}" y="${padT}" width="${w - padL - padR}" height="${h - padT - padB}"/></clipPath></defs>`;

    // Axes and integer ticks.
    svg += `<line x1="${padL}" y1="${yAxis}" x2="${w - padR}" y2="${yAxis}" style="stroke:var(--border-strong);stroke-width:1"/>`;
    svg += `<line x1="${sx(0)}" y1="${padT}" x2="${sx(0)}" y2="${h - padB}" style="stroke:var(--border-strong);stroke-width:1"/>`;
    for (let k = XMIN; k <= XMAX; k++) {
      if (k === 0) continue;
      svg += `<line x1="${sx(k)}" y1="${yAxis - 3}" x2="${sx(k)}" y2="${yAxis + 3}" style="stroke:var(--border-strong);stroke-width:1"/>`;
      svg += `<text x="${sx(k)}" y="${h - 8}" text-anchor="middle" style="fill:var(--faint);${mono}">${String(k).replace("-", "−")}</text>`;
    }

    // Curve.
    let d = "";
    const N = 240;
    for (let i = 0; i <= N; i++) {
      const x = XMIN + ((XMAX - XMIN) * i) / N;
      d += `${i ? "L" : "M"} ${sx(x).toFixed(1)} ${sy(clampY(f(x))).toFixed(1)} `;
    }
    svg += `<g clip-path="url(#nw-clip)"><path d="${d}" style="fill:none;stroke:var(--fg);stroke-width:2"/>`;

    // Roots.
    for (const r of [-Math.sqrt(3), -1, Math.sqrt(3)]) {
      svg += `<circle cx="${sx(r)}" cy="${yAxis}" r="3.5" style="fill:var(--bg);stroke:var(--muted);stroke-width:1.5"/>`;
    }

    // Newton iterates.
    const xs = [x0];
    let broke = false;
    for (let k = 0; k < steps; k++) {
      const xk = xs[k];
      const s = df(xk);
      if (!Number.isFinite(xk) || Math.abs(s) < 1e-12) {
        broke = true;
        break;
      }
      xs.push(xk - f(xk) / s);
    }

    for (let k = 0; k < xs.length; k++) {
      const xk = xs[k];
      if (xk < XMIN || xk > XMAX) break;
      const yk = f(xk);
      svg += `<line x1="${sx(xk)}" y1="${yAxis}" x2="${sx(xk)}" y2="${sy(clampY(yk))}" style="stroke:var(--faint);stroke-width:1;stroke-dasharray:3 3"/>`;
      if (k + 1 < xs.length) {
        const xn = xs[k + 1];
        // Tangent from (x_k, f(x_k)) through the axis at x_{k+1}, extended a little.
        const s = df(xk);
        const xa = Math.min(xk, xn) - 0.3;
        const xb = Math.max(xk, xn) + 0.3;
        svg += `<line x1="${sx(xa)}" y1="${sy(yk + s * (xa - xk))}" x2="${sx(xb)}" y2="${sy(yk + s * (xb - xk))}" style="stroke:var(--accent);stroke-width:1.8"/>`;
      }
      svg += `<circle cx="${sx(xk)}" cy="${sy(clampY(yk))}" r="3" style="fill:var(--accent)"/>`;
    }
    svg += `</g>`;

    // Labels under the axis for iterates that are far enough apart.
    let lastLabelX = -1e9;
    for (let k = 0; k < xs.length; k++) {
      const xk = xs[k];
      if (xk < XMIN || xk > XMAX) {
        const edge = xk < XMIN ? padL + 4 : w - padR - 4;
        svg += `<text x="${edge}" y="${yAxis - 8}" text-anchor="${xk < XMIN ? "start" : "end"}" style="fill:var(--orange);${mono}">x${SUB[k]} = ${num(xk, 1)} ${xk < XMIN ? "←" : "→"}</text>`;
        break;
      }
      const px = sx(xk);
      if (Math.abs(px - lastLabelX) > 22) {
        svg += `<text x="${px}" y="${yAxis + 16}" text-anchor="middle" style="fill:var(--accent-ink);${mono}">x${SUB[k]}</text>`;
        lastLabelX = px;
      }
    }

    svg += `</svg>`;
    stage.innerHTML = svg;

    outX0.textContent = num(x0, 2);
    outN.textContent = String(steps);
    const n = xs.length - 1;
    readout.innerHTML = broke
      ? `f′(x${SUB[n]}) = 0: tangenten er vannrett.`
      : `x${SUB[n]} = <b>${num(xs[n])}</b>`;
  }

  onResize(render);
  render();
}
