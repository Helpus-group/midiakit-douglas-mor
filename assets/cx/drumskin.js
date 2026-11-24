/* Drumskin
   Uso (dentro de uma seção com position relative; conteúdo depois com z-index 1):
   <div data-cx="drumskin"></div>
   Uma "pele de tambor" de pontos e linhas finas: clicar (ou tocar) bate na pele e uma onda real se espalha pela grade;
   o cursor abre um vão entre os pontos e acende os próximos; a malha respira devagar e balança com a rolagem.
   Opções: data-tema (escuro | claro), data-cor-fundo, data-cor-grade, data-cor-brilho, data-forca (75), data-velocidade (40),
           data-abertura (70 px), data-calmo (sim|nao: centro mais quieto para o texto), data-intro (sim|nao: uma batida ao aparecer),
           data-respirar (sim|nao), data-rolagem (sim|nao), data-discreto (0–1: opacidade dos pontos em repouso; só acendem
           por inteiro perto do cursor; padrão desligado), data-linhas (1: multiplica a opacidade das linhas; 0 some).
           data-cor-fundo="transparente" deixa ver o fundo da seção. Cliques em links/botões não batem. */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TEMAS = { escuro: { fundo: "#0B0B0D", grade: "#A8A29A", brilho: "#F0EBE2" }, claro: { fundo: "#F2F0EB", grade: "#5C5650", brilho: "#18161A" } };
  function rgb(el, cor) {
    var v = /^var\((--[\w-]+)\)$/.exec(String(cor).trim()); if (v) cor = getComputedStyle(el).getPropertyValue(v[1]).trim();
    var c = document.createElement("canvas").getContext("2d"); c.fillStyle = cor || "#000"; var f = c.fillStyle;
    if (f[0] === "#") return [parseInt(f.substr(1, 2), 16), parseInt(f.substr(3, 2), 16), parseInt(f.substr(5, 2), 16)];
    var m = f.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2]];
  }
  function smooth(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function preparar(el) {
    var area = el.parentElement; if (getComputedStyle(area).position === "static") area.style.position = "relative";
    el.classList.add("cx-drumskin"); el.setAttribute("aria-hidden", "true");
    var o = el.dataset, n = function (k, p) { var v = parseFloat(o[k]); return isNaN(v) ? p : v; };
    var tema = TEMAS[o.tema] || TEMAS.escuro, claro = o.tema === "claro";
    var DISC = o.discreto !== undefined ? Math.max(0, Math.min(1, n("discreto", 1))) : null, LIN = n("linhas", 1);
    var FORCA = n("forca", 75) / 100, VEL = n("velocidade", 40) / 100, ABRE = n("abertura", 70), calmo = o.calmo !== "nao";
    var tela = document.createElement("canvas"), ctx = tela.getContext("2d"); el.appendChild(tela);
    var dpr = Math.min(2, devicePixelRatio || 1), w = 0, h = 0, S = 20, C = 0, L = 0, z, v, nz, quieto, PX, PY, LV, Q, cF, cG, cB;
    var ptr = { x: 0, y: 0, sx: 0, sy: 0, dentro: false, pres: 0 }, batidas = [], t0 = performance.now(), ultimo = 0, visivel = false, rodando = false, introFeita = o.intro === "nao";
    var lean = 0, leanV = 0, scrollV = 0, lastY = scrollY, g = 1;
    var c = 760 * (.3 + .7 * VEL), damp;
    function cores() { cF = rgb(el, o.corFundo === "transparente" ? tema.fundo : o.corFundo || tema.fundo); cG = rgb(el, o.corGrade || tema.grade); cB = rgb(el, o.corBrilho || tema.brilho); el.style.background = o.corFundo === "transparente" ? "transparent" : "rgb(" + cF + ")"; }
    function medir() {
      w = el.clientWidth; h = el.clientHeight; tela.width = w * dpr; tela.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = w >= 3841 ? 32 : w >= 2561 ? 26 : 20; C = Math.ceil(w / S) + 1; L = Math.ceil(h / S) + 1;
      z = new Float32Array(C * L); v = new Float32Array(C * L); quieto = new Float32Array(C * L); nz = new Float32Array(C * L);
      PX = new Float32Array(C * L); PY = new Float32Array(C * L); LV = new Float32Array(C * L); Q = new Float32Array(C * L);
      g = Math.max(.55, Math.min(1, Math.sqrt(w * h) / 1100)); damp = 1.8 * (1 + .8 * (1 - g)) * Math.pow(c / 760, .6);
      var qw = w < 700 ? .5 : .34;
      for (var j = 0; j < L; j++) for (var i = 0; i < C; i++) {
        var x = i * S, y = j * S, borda = Math.min(1, .55 + .45 * Math.min(x, w - x, y, h - y) / 80);
        var ux = (x - w / 2) / (w * qw), uy = (y - h / 2) / (h * .26), q = calmo ? 1 - .55 * Math.exp(-(ux * ux + uy * uy) * 1.6) : 1;
        quieto[j * C + i] = Math.max(0, borda) * q;
      }
    }
    function bater(x, y, mult) { if (FORCA <= 0) return; batidas.push({ x: x, y: y, t: 0, J: 2100 * FORCA * g * (mult || 1) }); ligar(); }
    function simular(dt) {
      var C2 = (c / S) * (c / S), i, j, k;
      // força das batidas: gaussiana (sigma 30 px) entregue em 0,1 s
      for (var b = batidas.length - 1; b >= 0; b--) {
        var bt = batidas[b], T = .1, f0 = bt.t / T, f1 = Math.min(1, (bt.t + dt) / T);
        var dI = (f1 - Math.sin(2 * Math.PI * f1) / (2 * Math.PI)) - (f0 - Math.sin(2 * Math.PI * f0) / (2 * Math.PI));
        var i0 = Math.max(0, Math.floor((bt.x - 90) / S)), i1 = Math.min(C - 1, Math.ceil((bt.x + 90) / S)), j0 = Math.max(0, Math.floor((bt.y - 90) / S)), j1 = Math.min(L - 1, Math.ceil((bt.y + 90) / S));
        for (j = j0; j <= j1; j++) for (i = i0; i <= i1; i++) { var dx = i * S - bt.x, dy = j * S - bt.y; v[j * C + i] += bt.J * dI * Math.exp(-(dx * dx + dy * dy) / 1800) / S; }
        bt.t += dt; if (bt.t >= T) batidas.splice(b, 1);
      }
      for (j = 1; j < L - 1; j++) for (i = 1; i < C - 1; i++) {
        k = j * C + i;
        var lap = (4 * (z[k - 1] + z[k + 1] + z[k - C] + z[k + C]) + z[k - C - 1] + z[k - C + 1] + z[k + C - 1] + z[k + C + 1] - 20 * z[k]) / 6;
        var a = C2 * lap - 1.5 * z[k] - damp * v[k];
        v[k] += a * dt; nz[k] = z[k] + v[k] * dt;
      }
      var tmp = z; z = nz; nz = tmp;
    }
    function quadro(agora) {
      var dt = ultimo ? Math.min(.05, (agora - ultimo) / 1000) : 1 / 60; ultimo = agora;
      var t = (agora - t0) / 1000;
      if (!poucoMovimento) { var passos = Math.min(6, Math.max(1, Math.round(dt * 120))); for (var s = 0; s < passos; s++) simular(1 / 120); }
      // ponteiro suavizado e presença
      var kp = 1 - Math.exp(-dt / .07); ptr.sx += (ptr.x - ptr.sx) * kp; ptr.sy += (ptr.y - ptr.sy) * kp;
      ptr.pres += ((ptr.dentro ? 1 : 0) - ptr.pres) * (1 - Math.exp(-dt / (ptr.dentro ? .18 : .45)));
      // balanço da rolagem (mola)
      var alvoLean = Math.max(-26, Math.min(26, -scrollV * .014)); scrollV *= .85;
      var om = 2 * Math.PI * 1.7; leanV += (-(om * om) * (lean - alvoLean) - 2 * .16 * om * leanV) * dt; lean += leanV * dt;
      var Rfull = ABRE / 1.15, a = smooth(0, 1, ptr.pres), Rc = Rfull * a, RL = Math.max(150 * (.75 + .25 * g), 1.4 * ABRE);
      var respira = o.respirar === "nao" || poucoMovimento ? 0 : Math.min(1, t / 1.5), M = 1.3 * Math.max(w, h);
      ctx.clearRect(0, 0, w, h);
      var i, j, k;
      for (j = 0; j < L; j++) for (i = 0; i < C; i++) {
        k = j * C + i; var bx = i * S, by = j * S, x = bx, y = by;
        // onda: inclinação do campo desloca o ponto
        var gx = i > 0 && i < C - 1 ? (z[k + 1] - z[k - 1]) : 0, gy = j > 0 && j < L - 1 ? (z[k + C] - z[k - C]) : 0;
        var dx = gx * .55, dy = gy * .55, mag = Math.hypot(dx, dy), cap = .3 * S * Math.tanh(mag / (.3 * S)); if (mag > 0) { x += dx / mag * cap; y += dy / mag * cap; }
        if (respira) { var hg = 3 * Math.sin((.8 * bx + .6 * by) / M * 6.283 - t * 6.283 / 9) + 1.5 * Math.sin((-.5 * bx + .86 * by) / (.7 * M) * 6.283 - t * 6.283 / 13); x += hg * .55 * respira; y += hg * .65 * respira; }
        if (o.rolagem !== "nao") { var modo = Math.sin(Math.PI * bx / w) * Math.sin(Math.PI * by / h); y += lean * modo; }
        // vão do ponteiro: empurra os pontos para fora do centro
        var px = x - ptr.sx, py = y - ptr.sy, r = Math.hypot(px, py), fade = 1;
        if (Rc > .5 && r < 4.5 * Rfull) { var nr = Math.sqrt(r * r + Rc * Rc), wgt = 1 - smooth(2.2 * Rfull, 4.5 * Rfull, r), r2 = r + (nr - r) * wgt; if (r > 0) { x = ptr.sx + px / r * r2; y = ptr.sy + py / r * r2; } fade = smooth(.35 * Rc, .9 * Rc, r2); }
        var d2 = px * px + py * py, luz = ptr.pres * (.7 * Math.exp(-d2 / (2 * RL * RL)) + .3 * Math.exp(-d2 / (2 * 2.4 * RL * 2.4 * RL)));
        var onda = Math.min(1, Math.abs(v[k]) / 60);
        PX[k] = x; PY[k] = y; LV[k] = Math.min(1, Math.max(luz, onda * .85)); Q[k] = quieto[k] * fade;
      }
      ctx.globalCompositeOperation = claro ? "source-over" : "lighter";
      // linhas finas
      ctx.lineWidth = 1; ctx.strokeStyle = "rgb(" + cG + ")";
      for (j = 0; j < L; j++) { ctx.beginPath(); for (i = 0; i < C; i++) { k = j * C + i; i ? ctx.lineTo(PX[k], PY[k]) : ctx.moveTo(PX[k], PY[k]); } ctx.globalAlpha = .035 * LIN * (Q[j * C + (C >> 1)] + .4); ctx.stroke(); }
      for (i = 0; i < C; i++) { ctx.beginPath(); for (j = 0; j < L; j++) { k = j * C + i; j ? ctx.lineTo(PX[k], PY[k]) : ctx.moveTo(PX[k], PY[k]); } ctx.globalAlpha = .035 * LIN * (Q[(L >> 1) * C + i] + .4); ctx.stroke(); }
      // pontos
      for (k = 0; k < C * L; k++) {
        var lv = LV[k], q = Q[k]; if (q <= .01) continue;
        var nivel = DISC === null ? .26 + .6 * lv : DISC + (1 - DISC) * Math.min(1, lv * 1.6), rad = .9 * (1 + .9 * lv) * (claro ? 1.2 : 1);
        var cr = cG[0] + (cB[0] - cG[0]) * lv, cg = cG[1] + (cB[1] - cG[1]) * lv, cb = cG[2] + (cB[2] - cG[2]) * lv;
        ctx.globalAlpha = Math.min(1, DISC === null ? nivel * q : nivel * (.35 + .65 * q)); ctx.fillStyle = "rgb(" + (cr | 0) + "," + (cg | 0) + "," + (cb | 0) + ")";
        ctx.beginPath(); ctx.arc(PX[k], PY[k], rad, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    }
    function laco(t) { if (!visivel || document.hidden) { rodando = false; ultimo = 0; return; } quadro(t); requestAnimationFrame(laco); }
    function ligar() { if (!rodando && visivel && !poucoMovimento) { rodando = true; requestAnimationFrame(laco); } }
    area.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; if (!ptr.dentro) { ptr.sx = ptr.x; ptr.sy = ptr.y; } ptr.dentro = e.pointerType !== "touch"; }, { passive: true });
    area.addEventListener("pointerleave", function () { ptr.dentro = false; });
    area.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || e.target.closest("a,button,input,select,textarea,label,[role=button],[data-no-strike]")) return;
      var r = el.getBoundingClientRect(); bater(e.clientX - r.left, e.clientY - r.top, e.pointerType === "touch" ? 2300 / 2100 : 1);
    });
    addEventListener("scroll", function () { scrollV = (scrollY - lastY) * 60; lastY = scrollY; }, { passive: true });
    cores(); medir(); quadro(performance.now());
    var tt; new ResizeObserver(function () { clearTimeout(tt); tt = setTimeout(function () { medir(); quadro(performance.now()); }, 150); }).observe(el);
    new IntersectionObserver(function (e) {
      visivel = e[0].isIntersecting; ligar();
      if (visivel && !introFeita && !poucoMovimento) { introFeita = true; setTimeout(function () { bater(w / 2, h / 2, 2); }, 500); }
    }, { threshold: .2 }).observe(el);
    document.addEventListener("visibilitychange", ligar);
    new MutationObserver(cores).observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
  }
  function iniciar() { document.querySelectorAll('[data-cx="drumskin"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
