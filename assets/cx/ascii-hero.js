/* ASCII Hero
   Uso: <div data-cx="ascii-hero" data-imagem="assets/img/recorte.png" style="height:600px"></div>
   Três camadas do mesmo PNG recortado: (0) a foto original, (1) duotone pontilhado (dither) e (2) duotone estilo ilustração
   (tons chapados com contorno). A foto aparece primeiro normal; depois vira o dither e, a partir daí, alterna entre dither
   e ilustração (não volta à foto). As trocas acontecem em blocos. Um vórtice de símbolos de tamanhos variados gira em volta.
   O cursor revela, num pincel bem macio, a camada seguinte: foto → dither, dither → ilustração, ilustração → foto.
   A figura é opaca: cobre por inteiro o que estiver atrás dela. Sem cursor (celular), o pincel passeia sozinho em loop.
   Opções: data-escura (#2433e0), data-clara (#eef0ff), data-celula (4 px do pontilhado), data-espera (1.2 s antes da 1ª troca),
           data-troca (1.6 s de cada troca), data-pausa (2.6 s entre trocas), data-pincel (260 px), data-niveis (4 tons da ilustração),
           data-simbolos ("# = + ✦ { } → ◆ × * % ·"; "nao" desliga), data-cor-simbolos (= escura), data-quantidade (90),
           data-alinhar (base | centro), data-alt (descrição),
           data-ilustracao (PNG de um desenho no mesmo enquadramento do recorte: vira a camada 2, em duotone; sem ela, o desenho a lápis é gerado). */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  var HOVER = [1, 2, 0];
  var semCursor = matchMedia("(hover: none)").matches;
  function rgb(c) { var x = document.createElement("canvas").getContext("2d"); x.fillStyle = c; var f = x.fillStyle; return f[0] === "#" ? [1, 3, 5].map(function (i) { return parseInt(f.substr(i, 2), 16); }) : (f.match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(Number); }
  function mistura(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function preparar(el) {
    el.classList.add("cx-ascii-hero");
    var o = el.dataset, n = function (k, p) { var v = parseFloat(o[k]); return isNaN(v) ? p : v; };
    var cE = rgb(o.escura || "#2433e0"), cC = rgb(o.clara || "#eef0ff"), CEL = Math.max(2, n("celula", 4));
    var ESPERA = n("espera", 1.2), TROCA = Math.max(.3, n("troca", 1.6)), PAUSA = n("pausa", 2.6), PIN = n("pincel", 260), NIV = Math.max(2, n("niveis", 4) | 0);
    var QTD = n("quantidade", 90), BASE = o.alinhar !== "centro", CORS = o.corSimbolos || o.escura || "#2433e0";
    var SIMB = o.simbolos === "nao" ? [] : (o.simbolos || "# = + ✦ { } → ◆ × * % ·").split(" ").filter(Boolean);
    if (o.alt) { el.setAttribute("role", "img"); el.setAttribute("aria-label", o.alt); } else el.setAttribute("aria-hidden", "true");
    var tela = document.createElement("canvas"), ctx = tela.getContext("2d"); el.appendChild(tela);
    var camadas = [0, 1, 2].map(function () { return document.createElement("canvas"); }), masc = document.createElement("canvas"), tmp = document.createElement("canvas"), comp = document.createElement("canvas");
    var img = new Image(); img.src = o.imagem || "";
    var ilu = null; if (o.ilustracao) { ilu = new Image(); ilu.src = o.ilustracao; }
    var W = 0, H = 0, d = 1, fx = 0, fy = 0, fw = 0, fh = 0, blocos = [], BL = 14, simbolos = [], visivel = false, rodando = false;
    var cur = 0, nxt = 1, tIni = null, ptr = { x: 0, y: 0, sx: 0, sy: 0, on: false, f: 0 };

    function pixels(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h); return x.getImageData(0, 0, w, h); }
    function fazerDither() {
      var cols = Math.ceil(fw / CEL), rows = Math.ceil(fh / CEL), px = pixels(cols, rows).data, c = camadas[1].getContext("2d");
      c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var k = (j * cols + i) * 4, a = px[k + 3] / 255; if (a < .6) continue;
        var L = (.2126 * px[k] + .7152 * px[k + 1] + .0722 * px[k + 2]) / 255; L = Math.max(0, Math.min(1, (L - .5) * 1.35 + .55));
        var m = mistura(cC, cE, (1 - L) * .55);
        c.fillStyle = "rgb(" + (m[0] | 0) + "," + (m[1] | 0) + "," + (m[2] | 0) + ")"; c.fillRect(fx + i * CEL, fy + j * CEL, CEL + .5, CEL + .5);
        if (L < (BAYER[(j % 4) * 4 + (i % 4)] + .5) / 16) { var s = CEL * .8; c.fillStyle = "rgb(" + cE + ")"; c.fillRect(fx + i * CEL + (CEL - s) / 2, fy + j * CEL + (CEL - s) / 2, s, s); }
      }
    }
    function caixa(src, w, h, r) {
      // desfoque em caixa separável (2 passadas)
      var t = new Float32Array(w * h), o = new Float32Array(w * h), x, y, k, acc, n2 = 2 * r + 1;
      for (y = 0; y < h; y++) { acc = 0; for (k = -r; k <= r; k++) acc += src[y * w + Math.min(w - 1, Math.max(0, k))];
        for (x = 0; x < w; x++) { t[y * w + x] = acc / n2; acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)]; } }
      for (x = 0; x < w; x++) { acc = 0; for (k = -r; k <= r; k++) acc += t[Math.min(h - 1, Math.max(0, k)) * w + x];
        for (y = 0; y < h; y++) { o[y * w + x] = acc / n2; acc += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x]; } }
      return o;
    }
    function fazerIlustracao() {
      if (ilu && ilu.naturalWidth) return ilustracaoDeImagem();
      // lápis: g / (1 - blur(1 - g)) acha os traços; hachuras diagonais escurecem as sombras; tudo em duotone
      var w = Math.max(1, Math.round(fw * d)), h = Math.max(1, Math.round(fh * d)), dado = pixels(w, h), px = dado.data, N = w * h;
      var g = new Float32Array(N), inv = new Float32Array(N), den = new Uint8Array(N), q;
      for (q = 0; q < N; q++) { den[q] = px[q * 4 + 3] >= 150 ? 1 : 0; var L = (.2126 * px[q * 4] + .7152 * px[q * 4 + 1] + .0722 * px[q * 4 + 2]) / 255; g[q] = den[q] ? L : 1; inv[q] = 1 - g[q]; }
      var r = Math.max(2, Math.round(Math.min(w, h) / 90)), bl = caixa(caixa(inv, w, h, r), w, h, r), som = caixa(g, w, h, Math.max(3, r * 3));
      var esp = Math.max(3, Math.round(d * 3.2));
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var i = y * w + x; if (!den[i]) { px[i * 4 + 3] = 0; continue; }
        var traco = Math.min(1, g[i] / Math.max(.02, 1 - bl[i])); traco = Math.pow(traco, 2.2);
        var escuro = 1 - Math.min(1, som[i] * 1.15), ruido = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; ruido -= Math.floor(ruido);
        var h1 = ((x + y) % esp) < 1.2 ? 1 : 0, h2 = ((x - y + 9999) % (esp + 1)) < 1.1 ? 1 : 0;
        var hach = escuro > .35 ? h1 * (escuro - .35) * 1.4 : 0; if (escuro > .6) hach += h2 * (escuro - .6) * 1.6;
        var sombra = .18 + .82 * Math.pow(Math.min(1, som[i] * 1.1), 1.6);
        var tom = Math.max(0, Math.min(1, traco * sombra * (1 - .8 * Math.min(1, hach)) * (.9 + .1 * ruido)));
        var cor = mistura(cE, cC, tom);
        px[i * 4] = cor[0]; px[i * 4 + 1] = cor[1]; px[i * 4 + 2] = cor[2]; px[i * 4 + 3] = 255;
      }
      var ic = document.createElement("canvas"); ic.width = w; ic.height = h; ic.getContext("2d").putImageData(dado, 0, 0);
      var c2 = camadas[2].getContext("2d"); c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, camadas[2].width, camadas[2].height); c2.drawImage(ic, Math.round(fx * d), Math.round(fy * d));
    }
    function ilustracaoDeImagem() {
      // usa a silhueta da foto e os traços do desenho; luz do papel → clara, grafite → escura
      var w = Math.max(1, Math.round(fw * d)), h = Math.max(1, Math.round(fh * d)), base = pixels(w, h).data;
      var c = document.createElement("canvas"); c.width = w; c.height = h; var x = c.getContext("2d"); x.drawImage(ilu, 0, 0, w, h);
      var dado = x.getImageData(0, 0, w, h), px = dado.data;
      for (var i = 0; i < w * h; i++) {
        if (base[i * 4 + 3] < 150) { px[i * 4 + 3] = 0; continue; }
        var L = (.2126 * px[i * 4] + .7152 * px[i * 4 + 1] + .0722 * px[i * 4 + 2]) / 255;
        L = Math.max(0, Math.min(1, Math.pow(L, 1.35) * 1.08));
        var cor = mistura(cE, cC, L); px[i * 4] = cor[0]; px[i * 4 + 1] = cor[1]; px[i * 4 + 2] = cor[2]; px[i * 4 + 3] = 255;
      }
      x.putImageData(dado, 0, 0);
      var c2 = camadas[2].getContext("2d"); c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, camadas[2].width, camadas[2].height); c2.drawImage(c, Math.round(fx * d), Math.round(fy * d));
    }
    function medir() {
      if (!img.naturalWidth) return;
      d = Math.min(devicePixelRatio || 1, 2); W = el.clientWidth; H = el.clientHeight;
      camadas.concat([tela, masc, tmp, comp]).forEach(function (c) { c.width = W * d; c.height = H * d; });
      var e = Math.min(W / img.naturalWidth, H / img.naturalHeight); fw = img.naturalWidth * e; fh = img.naturalHeight * e;
      fx = (W - fw) / 2; fy = BASE ? H - fh : (H - fh) / 2;
      var oc = camadas[0].getContext("2d"); oc.setTransform(d, 0, 0, d, 0, 0); oc.drawImage(img, fx, fy, fw, fh);
      fazerDither(); fazerIlustracao();
      blocos = [];
      for (var y = 0; y < H; y += BL) for (var x = 0; x < W; x += BL) blocos.push({ x: x, y: y, r: (1 - (y - fy) / Math.max(1, fh)) * .5 + Math.random() * .5 });
      simbolos = [];
      for (var q = 0; q < (SIMB.length ? QTD : 0); q++) {
        var grande = Math.random() < .16, braco = q % 3;
        simbolos.push({ ch: SIMB[q % SIMB.length], h: braco * .33 + Math.random() * .16, vh: .03, a0: braco * 2.094 + (Math.random() - .5) * .55,
          r: .88 + Math.random() * .2, va: .62 + Math.random() * .1, tam: grande ? 26 + Math.random() * 16 : 12 + Math.random() * 9 });
      }
      desenhar(performance.now());
    }
    // linha do tempo: foto → dither, depois alterna dither ↔ ilustração
    function estado(agora) {
      if (poucoMovimento) return { a: 1, b: 1, p: 0 };
      if (tIni === null) return { a: 0, b: 1, p: 0 };
      var t = (agora - tIni) / 1000 - ESPERA;
      if (t < 0) return { a: 0, b: 1, p: 0 };
      if (t < TROCA) return { a: 0, b: 1, p: t / TROCA };
      t -= TROCA; var ciclo = PAUSA + TROCA, k = Math.floor(t / ciclo), r = t - k * ciclo;
      var a = k % 2 === 0 ? 1 : 2, b = a === 1 ? 2 : 1;
      return r < PAUSA ? { a: a, b: b, p: 0 } : { a: a, b: b, p: (r - PAUSA) / TROCA };
    }
    function desenhar(agora) {
      if (!W) return;
      var st = estado(agora), t = agora / 1000, p = st.p;
      // sem cursor (celular): o pincel passeia sozinho pela figura, em loop, depois que ela vira a 1ª vez
      if (semCursor && !poucoMovimento && !(st.a === 0 && p === 0)) {
        ptr.on = true; ptr.x = fx + fw * (.5 + .3 * Math.sin(t * .45)); ptr.y = fy + fh * (.42 + .3 * Math.sin(t * .31 + 1.2));
      }
      ptr.f += ((ptr.on ? 1 : 0) - ptr.f) * .06; ptr.sx += (ptr.x - ptr.sx) * .1; ptr.sy += (ptr.y - ptr.sy) * .1;
      var cc = comp.getContext("2d"); cc.setTransform(1, 0, 0, 1, 0, 0); cc.clearRect(0, 0, comp.width, comp.height);
      cc.drawImage(camadas[st.a], 0, 0);
      if (p > 0) {
        var mc = masc.getContext("2d"); mc.setTransform(d, 0, 0, d, 0, 0); mc.clearRect(0, 0, W, H); mc.fillStyle = "#000";
        for (var b = 0; b < blocos.length; b++) if (blocos[b].r < p * 1.05) mc.fillRect(blocos[b].x, blocos[b].y, BL, BL);
        var tc = tmp.getContext("2d"); tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, tmp.width, tmp.height);
        tc.drawImage(camadas[st.b], 0, 0); tc.globalCompositeOperation = "destination-in"; tc.drawImage(masc, 0, 0); tc.globalCompositeOperation = "source-over";
        cc.drawImage(tmp, 0, 0);
      }
      // pincel macio: a camada seguinte por cima (sempre sobre a figura opaca, sem furos)
      if (ptr.f > .01) {
        var dom = p > .5 ? st.b : st.a, R = PIN * d, x = ptr.sx * d, y = ptr.sy * d;
        var tc2 = tmp.getContext("2d"); tc2.setTransform(1, 0, 0, 1, 0, 0); tc2.clearRect(0, 0, tmp.width, tmp.height); tc2.drawImage(camadas[HOVER[dom]], 0, 0);
        var g = tc2.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, "rgba(0,0,0," + .95 * ptr.f + ")"); g.addColorStop(.3, "rgba(0,0,0," + .75 * ptr.f + ")");
        g.addColorStop(.6, "rgba(0,0,0," + .3 * ptr.f + ")"); g.addColorStop(.82, "rgba(0,0,0," + .08 * ptr.f + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
        tc2.globalCompositeOperation = "destination-in"; tc2.fillStyle = g; tc2.fillRect(0, 0, tmp.width, tmp.height); tc2.globalCompositeOperation = "source-over";
        cc.drawImage(tmp, 0, 0);
      }
      // vórtice 3D: atrás da figura → figura → na frente da figura (aparece com a primeira troca)
      var vis = poucoMovimento ? 1 : (st.a === 0 ? p : 1);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, tela.width, tela.height);
      if (vis > 0) vortice(t, vis, false);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(comp, 0, 0);
      if (vis > 0) vortice(t, vis, true);
    }
    function vortice(t, vis, frente) {
      if (!simbolos.length) return;
      ctx.setTransform(d, 0, 0, d, 0, 0); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = CORS;
      var cx = fx + fw * .52, topo = fy + fh * .2, alt = fh * .62, inc = .35;
      for (var s = 0; s < simbolos.length; s++) {
        var sy = simbolos[s], h = 1 - ((sy.h + t * sy.vh) % 1);              // sobe devagar e recomeça embaixo
        var ang = sy.a0 + t * sy.va + h * 3.2, z = Math.sin(ang);           // z > 0: na frente da figura
        if ((z >= 0) !== frente) continue;
        var raio = fw * (.3 + .1 * Math.sin(h * 3.1416)) * sy.r;         // funil: mais largo no meio da altura
        var x = cx + Math.cos(ang) * raio, y = topo + h * alt + z * raio * inc;
        var prof = (z + 1) / 2, esc = .55 + .6 * prof, borda = Math.min(1, Math.min(h, 1 - h) * 7);
        ctx.globalAlpha = vis * borda * (.3 + .7 * prof);
        ctx.font = "700 " + Math.round(sy.tam * esc) + "px ui-monospace, 'Geist Mono', Menlo, monospace";
        ctx.fillText(sy.ch, x, y);
      }
      ctx.globalAlpha = 1;
    }
    function laco(a) { if (!visivel || document.hidden) { rodando = false; return; } desenhar(a); requestAnimationFrame(laco); }
    function ligar() { if (!rodando && visivel) { rodando = true; requestAnimationFrame(laco); } }
    el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; if (!ptr.on) { ptr.sx = ptr.x; ptr.sy = ptr.y; } ptr.on = e.pointerType === "mouse"; ligar(); });
    el.addEventListener("pointerleave", function () { ptr.on = false; });
    img.onload = function () {
      if (ilu && !ilu.complete) { ilu.onload = ilu.onerror = function () { medir(); }; }
      medir();
      var tt; new ResizeObserver(function () { clearTimeout(tt); tt = setTimeout(medir, 150); }).observe(el);
      new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; if (visivel && tIni === null) tIni = performance.now(); ligar(); }, { threshold: .25 }).observe(el);
    };
  }
  function iniciar() { document.querySelectorAll('[data-cx="ascii-hero"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
