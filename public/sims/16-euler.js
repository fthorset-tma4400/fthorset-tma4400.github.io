/**
 * Eulers eksplisitte og implisitte metode i retningsfeltet (DOM-host, SVG).
 * To ligninger: y' = −2ty og y' = −10y, begge med y(0) = 1 på [0, 2].
 * Leseren velger ligning, metode og steglengde h, og ser Euler-polygonet
 * mot den eksakte løsningen. For y' = −10y blir den eksplisitte metoden
 * ustabil når h > 0,2.
 */
const T_END = 2;
const H_VALUES = [0.05, 0.1, 0.125, 0.2, 0.25, 0.4, 0.5]; // all divide T_END
const EQS = [
  {
    name: "y′ = −2ty",
    F: (t, y) => -2 * t * y,
    exact: (t) => Math.exp(-t * t),
    implicit: (tn1, yn, h) => yn / (1 + 2 * h * tn1),
    ymin: -0.6,
    ymax: 1.4,
  },
  {
    name: "y′ = −10y",
    F: (t, y) => -10 * y,
    exact: (t) => Math.exp(-10 * t),
    implicit: (tn1, yn, h) => yn / (1 + 10 * h),
    ymin: -1.6,
    ymax: 1.6,
  },
];

export default function init({ stage, controls, getSize, onResize }) {
  let eq = 0;
  let implicit = false;
  let h = 0.25;

  function group(labels, current, onPick) {
    const btns = labels.map((text, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-btn";
      b.textContent = text;
      b.setAttribute("aria-pressed", i === current ? "true" : "false");
      b.addEventListener("click", () => {
        btns.forEach((o, j) => o.setAttribute("aria-pressed", j === i ? "true" : "false"));
        onPick(i);
        render();
      });
      return b;
    });
    controls.append(...btns);
  }

  group(EQS.map((e) => e.name), eq, (i) => (eq = i));
  group(["Eksplisitt", "Implisitt"], 0, (i) => (implicit = i === 1));

  const label = document.createElement("label");
  label.append("h ");
  const out = document.createElement("output");
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = String(H_VALUES.length - 1);
  input.step = "1";
  input.value = String(H_VALUES.indexOf(h));
  input.setAttribute("aria-label", "Steglengde h");
  input.addEventListener("input", () => {
    h = H_VALUES[Number(input.value)];
    render();
  });
  label.append(out, input);
  const readout = document.createElement("div");
  readout.className = "sim-readout";
  controls.append(label, readout);

  const num = (v, d) => {
    const r = Number(v.toFixed(d));
    return (Object.is(r, -0) ? 0 : r).toString().replace(".", ",").replace("-", "−");
  };

  function render() {
    const { w, h: H } = getSize();
    const E = EQS[eq];
    const padL = 12;
    const padR = 12;
    const padT = 12;
    const padB = 28;
    const sx = (t) => padL + (t / T_END) * (w - padL - padR);
    const sy = (y) => padT + ((E.ymax - y) / (E.ymax - E.ymin)) * (H - padT - padB);
    const kx = (w - padL - padR) / T_END; // px per unit t
    const ky = (H - padT - padB) / (E.ymax - E.ymin); // px per unit y
    const mono = "font-family:var(--font-mono);font-size:12px";
    const y0px = sy(0);

    let svg = `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${H.toFixed(0)}" role="img" aria-label="Retningsfelt, eksakt løsning og Euler-tilnærming" style="display:block">`;
    svg += `<defs><clipPath id="eu-clip"><rect x="${padL}" y="${padT}" width="${w - padL - padR}" height="${H - padT - padB}"/></clipPath></defs>`;

    // Axes.
    svg += `<line x1="${padL}" y1="${y0px}" x2="${w - padR}" y2="${y0px}" style="stroke:var(--border-strong);stroke-width:1"/>`;
    svg += `<line x1="${sx(0)}" y1="${padT}" x2="${sx(0)}" y2="${H - padB}" style="stroke:var(--border-strong);stroke-width:1"/>`;
    for (let t = 0.5; t <= T_END + 1e-9; t += 0.5) {
      svg += `<line x1="${sx(t)}" y1="${y0px - 3}" x2="${sx(t)}" y2="${y0px + 3}" style="stroke:var(--border-strong);stroke-width:1"/>`;
      svg += `<text x="${sx(t)}" y="${H - 8}" text-anchor="middle" style="fill:var(--faint);${mono}">${num(t, 1)}</text>`;
    }
    svg += `<text x="${sx(0) + 6}" y="${sy(1) + 4}" style="fill:var(--faint);${mono}">1</text>`;
    svg += `<line x1="${sx(0) - 3}" y1="${sy(1)}" x2="${sx(0) + 3}" y2="${sy(1)}" style="stroke:var(--border-strong);stroke-width:1"/>`;

    svg += `<g clip-path="url(#eu-clip)">`;

    // Direction field: short segments of fixed pixel length.
    const cols = Math.max(8, Math.round((w - padL - padR) / 34));
    const rows = 9;
    const seg = 7;
    for (let i = 0; i <= cols; i++) {
      const t = (i / cols) * T_END;
      for (let j = 0; j <= rows; j++) {
        const y = E.ymin + (j / rows) * (E.ymax - E.ymin);
        const s = E.F(t, y);
        const dx = kx;
        const dy = -s * ky;
        const L = Math.hypot(dx, dy);
        const ux = (seg * dx) / L;
        const uy = (seg * dy) / L;
        const cx = sx(t);
        const cy = sy(y);
        svg += `<line x1="${(cx - ux).toFixed(1)}" y1="${(cy - uy).toFixed(1)}" x2="${(cx + ux).toFixed(1)}" y2="${(cy + uy).toFixed(1)}" style="stroke:var(--border-strong);stroke-width:1.2"/>`;
      }
    }

    // Exact solution.
    let d = "";
    for (let k = 0; k <= 200; k++) {
      const t = (k / 200) * T_END;
      d += `${k ? "L" : "M"} ${sx(t).toFixed(1)} ${sy(E.exact(t)).toFixed(1)} `;
    }
    svg += `<path d="${d}" style="fill:none;stroke:var(--fg);stroke-width:2"/>`;

    // Euler polygon.
    const N = Math.round(T_END / h);
    const ts = [0];
    const ys = [1];
    for (let n = 0; n < N; n++) {
      const tn1 = (n + 1) * h;
      const yn = ys[n];
      const yn1 = implicit ? E.implicit(tn1, yn, h) : yn + h * E.F(n * h, yn);
      ts.push(tn1);
      ys.push(yn1);
    }
    const clampPx = (v) => Math.max(-1e4, Math.min(1e4, v));
    let p = "";
    ts.forEach((t, n) => {
      p += `${n ? "L" : "M"} ${sx(t).toFixed(1)} ${clampPx(sy(ys[n])).toFixed(1)} `;
    });
    const col = "var(--accent)";
    svg += `<path d="${p}" style="fill:none;stroke:${col};stroke-width:2"/>`;
    ts.forEach((t, n) => {
      svg += `<circle cx="${sx(t).toFixed(1)}" cy="${clampPx(sy(ys[n])).toFixed(1)}" r="3" style="fill:${col}"/>`;
    });
    svg += `</g></svg>`;
    stage.innerHTML = svg;

    out.textContent = num(h, 3);
    const yN = ys[ys.length - 1];
    const big = Math.abs(yN) >= 1000;
    readout.innerHTML = `y(2) ≈ <b>${big ? yN.toExponential(1).replace(".", ",").replace("-", "−") : num(yN, 4)}</b>, eksakt ${num(E.exact(T_END), 4)}`;
  }

  onResize(render);
  render();
}
