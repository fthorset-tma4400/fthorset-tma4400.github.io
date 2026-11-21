/**
 * Riemannsummer og trapesmetoden for f(x) = x² på [0, 2]. Leseren velger
 * metode (venstre endepunkt, høyre endepunkt, midtpunkt, trapes) og antall
 * delintervaller n, og ser rektanglene/trapesene og feilen mot 8/3.
 * DOM-host: SVG i api.stage med rammeverkets tokens.
 */
export default function init({ stage, controls, getSize, onResize }) {
  const f = (x) => x * x;
  const a = 0;
  const b = 2;
  const eksakt = 8 / 3;
  const METODER = [
    { key: "v", navn: "Venstre" },
    { key: "h", navn: "Høyre" },
    { key: "m", navn: "Midtpunkt" },
    { key: "t", navn: "Trapes" },
  ];
  let metode = "v";
  let n = 4;

  const knapper = document.createElement("div");
  knapper.style.display = "flex";
  knapper.style.flexWrap = "wrap";
  knapper.style.gap = "var(--space-2)";
  const btns = METODER.map((m) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "sim-btn";
    el.textContent = m.navn;
    el.setAttribute("aria-pressed", String(m.key === metode));
    el.addEventListener("click", () => {
      metode = m.key;
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === el)));
      render();
    });
    knapper.append(el);
    return el;
  });

  const label = document.createElement("label");
  label.append("Delintervaller n ");
  const out = document.createElement("output");
  const input = document.createElement("input");
  input.type = "range";
  input.min = "1";
  input.max = "40";
  input.step = "1";
  input.value = String(n);
  input.setAttribute("aria-label", "Antall delintervaller");
  label.append(out, input);

  const readout = document.createElement("div");
  readout.className = "sim-readout";
  controls.append(knapper, label, readout);

  function sum() {
    const h = (b - a) / n;
    let s = 0;
    for (let i = 0; i < n; i++) {
      const x0 = a + i * h;
      const x1 = x0 + h;
      if (metode === "v") s += f(x0);
      else if (metode === "h") s += f(x1);
      else if (metode === "m") s += f((x0 + x1) / 2);
      else s += (f(x0) + f(x1)) / 2;
    }
    return s * h;
  }

  const komma = (v, d) => v.toFixed(d).replace(".", ",");

  function render() {
    const { w, h: H } = getSize();
    const padL = 30;
    const padR = 14;
    const padT = 12;
    const padB = 24;
    const yMax = 4.3;
    const X = (x) => padL + ((x - a) / (b - a)) * (w - padL - padR);
    const Y = (y) => padT + ((yMax - y) / yMax) * (H - padT - padB);
    const dx = (b - a) / n;

    let s = `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${H.toFixed(0)}" preserveAspectRatio="none" aria-hidden="true" style="display:block">`;
    // figurene under grafen
    for (let i = 0; i < n; i++) {
      const x0 = a + i * dx;
      const x1 = x0 + dx;
      let pts;
      if (metode === "t") {
        pts = [[x0, 0], [x0, f(x0)], [x1, f(x1)], [x1, 0]];
      } else {
        const xs = metode === "v" ? x0 : metode === "h" ? x1 : (x0 + x1) / 2;
        const y = f(xs);
        pts = [[x0, 0], [x0, y], [x1, y], [x1, 0]];
      }
      const d = pts.map(([px, py]) => `${X(px).toFixed(1)},${Y(py).toFixed(1)}`).join(" ");
      s += `<polygon points="${d}" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:1"/>`;
      if (metode === "m" && n <= 16) {
        const xm = (x0 + x1) / 2;
        s += `<circle cx="${X(xm).toFixed(1)}" cy="${Y(f(xm)).toFixed(1)}" r="2.5" style="fill:var(--accent-ink)"/>`;
      }
    }
    // akser
    s += `<line x1="${padL}" y1="${Y(0)}" x2="${w - padR}" y2="${Y(0)}" stroke="var(--border-strong)"/>`;
    s += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${Y(0)}" stroke="var(--border-strong)"/>`;
    const txt = (x, y, t, anchor) =>
      `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" style="fill:var(--muted);font-family:var(--font-mono);font-size:11px">${t}</text>`;
    for (const xv of [0, 1, 2]) s += txt(X(xv), Y(0) + 13, String(xv), "middle");
    for (const yv of [2, 4]) s += txt(padL - 6, Y(yv), String(yv), "end");
    // grafen
    let d = "";
    for (let k = 0; k <= 120; k++) {
      const x = a + ((b - a) * k) / 120;
      d += `${k ? "L" : "M"}${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`;
    }
    s += `<path d="${d}" fill="none" stroke="var(--fg)" stroke-width="2"/>`;
    s += `<text x="${(X(1.42)).toFixed(1)}" y="${(Y(f(1.42)) - 14).toFixed(1)}" text-anchor="end" style="fill:var(--fg);font-family:var(--font-mono);font-size:12px">y = x²</text>`;
    s += `</svg>`;
    stage.innerHTML = s;

    const S = sum();
    const feil = S - eksakt;
    out.textContent = String(n);
    readout.innerHTML = `Tilnærming <b>${komma(S, 4)}</b>, eksakt 8/3 ≈ 2,6667, feil <b>${feil >= 0 ? "+" : "−"}${komma(Math.abs(feil), 4)}</b>`;
  }

  input.addEventListener("input", () => {
    n = Number(input.value);
    render();
  });
  onResize(render);
  render();
}
