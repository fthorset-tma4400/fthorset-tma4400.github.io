/**
 * ε-båndet i definisjonen av konvergens. Leseren velger en følge og en ε, og
 * ser båndet L ± ε, leddene a_n og den minste N som gjør at alle ledd med
 * n > N ligger i båndet. For (−1)^n finnes ingen slik N når ε < 1.
 * DOM-host: tegner SVG i api.stage med rammeverkets tokens.
 */
export default function init({ stage, controls, getSize, onResize }) {
  const FOLGER = [
    {
      key: "a",
      navn: "n/(n+1)",
      L: 1,
      a: (n) => n / (n + 1),
      lo: 0.4,
      hi: 1.25,
    },
    {
      key: "b",
      navn: "(−1)ⁿn/(n²+1)",
      L: 0,
      a: (n) => ((n % 2 === 0 ? 1 : -1) * n) / (n * n + 1),
      lo: -0.6,
      hi: 0.6,
    },
    {
      key: "c",
      navn: "(−1)ⁿ",
      L: 1,
      a: (n) => (n % 2 === 0 ? 1 : -1),
      lo: -1.4,
      hi: 1.6,
    },
  ];
  let valgt = FOLGER[0];
  let eps = 0.1;

  const knapper = document.createElement("div");
  knapper.style.display = "flex";
  knapper.style.flexWrap = "wrap";
  knapper.style.gap = "var(--space-2)";
  const btns = FOLGER.map((f) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sim-btn";
    b.textContent = f.navn;
    b.addEventListener("click", () => {
      valgt = f;
      btns.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    });
    knapper.append(b);
    return b;
  });
  btns[0].setAttribute("aria-pressed", "true");

  const label = document.createElement("label");
  label.append("ε ");
  const out = document.createElement("output");
  const input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = "100";
  input.step = "1";
  // log-skala fra 0,01 til 1
  const tilEps = (v) => Math.pow(10, -2 + (2 * Number(v)) / 100);
  input.value = "50";
  eps = tilEps(input.value);
  input.setAttribute("aria-label", "Størrelsen på epsilon");
  label.append(out, input);
  controls.append(knapper, label);

  // Minste N slik at |a_n − L| < ε for alle n > N (sjekket opp til 20000).
  function finnN(f, e) {
    const MAX = 20000;
    let sist = 0;
    for (let n = 1; n <= MAX; n++) {
      if (Math.abs(f.a(n) - f.L) >= e - 1e-12) sist = n;
    }
    return sist >= MAX - 1 ? null : sist;
  }

  function render() {
    const { w, h } = getSize();
    const f = valgt;
    const N = finnN(f, eps);
    const smal = w < 460;
    const nMax = smal ? 30 : 50;
    const padL = 34;
    const padR = 12;
    const padT = 14;
    const padB = 26;
    const X = (n) => padL + ((n - 0.5) / nMax) * (w - padL - padR);
    const Y = (y) => padT + ((f.hi - y) / (f.hi - f.lo)) * (h - padT - padB);
    const fmt = (v) => v.toFixed(v < 0.1 ? 3 : 2).replace(".", ",");

    out.textContent = fmt(eps);

    let s = `<svg width="100%" height="100%" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" preserveAspectRatio="none" aria-hidden="true" style="display:block">`;
    // ε-båndet
    const yTop = Math.max(padT, Y(f.L + eps));
    const yBot = Math.min(h - padB, Y(f.L - eps));
    s += `<rect x="${padL}" y="${yTop.toFixed(1)}" width="${(w - padL - padR).toFixed(1)}" height="${Math.max(0, yBot - yTop).toFixed(1)}" style="fill:var(--accent-soft)"/>`;
    s += `<line x1="${padL}" y1="${Y(f.L).toFixed(1)}" x2="${w - padR}" y2="${Y(f.L).toFixed(1)}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    // akser
    s += `<line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="var(--border-strong)"/>`;
    s += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}" stroke="var(--border-strong)"/>`;
    const txt = (x, y, t, anchor = "start", col = "var(--muted)") =>
      `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" style="fill:${col};font-family:var(--font-mono);font-size:11px">${t}</text>`;
    s += txt(padL - 6, Y(f.L), String(f.L), "end", "var(--accent-ink)");
    s += txt(w - padR - 2, Y(f.L) - 10, "L ± ε", "end", "var(--accent-ink)");
    const step = 10;
    for (let n = step; n <= nMax; n += step) {
      s += txt(X(n), h - padB + 13, String(n), "middle");
    }
    s += txt(padL + 2, h - padB + 13, "n", "start");
    // N-markør
    if (N !== null && N <= nMax) {
      const xN = X(N + 0.5);
      s += `<line x1="${xN.toFixed(1)}" y1="${padT}" x2="${xN.toFixed(1)}" y2="${h - padB}" stroke="var(--fg)" stroke-width="1" stroke-dasharray="3 3"/>`;
      s += txt(xN + 4, padT + 6, `N = ${N}`, "start", "var(--fg)");
    } else if (N !== null) {
      s += txt(w - padR - 2, padT + 6, `N = ${N} (utenfor bildet)`, "end", "var(--fg)");
    } else {
      s += txt(w - padR - 2, padT + 6, "ingen N", "end", "var(--red)");
    }
    // leddene
    for (let n = 1; n <= nMax; n++) {
      const v = f.a(n);
      const inne = Math.abs(v - f.L) < eps - 1e-12;
      const col = inne ? "var(--accent)" : "var(--red)";
      s += `<circle cx="${X(n).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${smal ? 2.6 : 3}" style="fill:${col}"/>`;
    }
    s += `</svg>`;
    stage.innerHTML = s;
  }

  input.addEventListener("input", () => {
    eps = tilEps(input.value);
    render();
  });
  onResize(render);
  render();
}
