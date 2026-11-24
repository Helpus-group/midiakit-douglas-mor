/* ASCII Hero
   Uso: <div data-cx="ascii-hero" data-imagem="assets/img/recorte.png" style="height:600px"></div>
   Transforma um PNG recortado (fundo transparente) numa figura feita de caracteres. Ao aparecer, os caracteres embaralham
   até formar a imagem; depois a figura flutua de leve, alguns caracteres cintilam e uma "bolha" de luz passeia sozinha
   (ou segue o cursor), empurrando os caracteres e acendendo-os na cor de destaque. Funciona sem cursor.
   Opções: data-celula (9 px), data-caracteres (" .:-=+*#%@", do claro ao denso), data-tinta (#111; "imagem" = cor da foto),
           data-destaque (cor dos caracteres na bolha; padrão #4f5bff), data-raio (130 px), data-contraste (1.25),
           data-alinhar (base | centro; padrão base), data-flutuar (sim|nao), data-minimo (1: menor índice da rampa usado dentro
           da figura; maior = áreas claras mais cheias, bom para roupa branca em fundo claro), data-alt (descrição). */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function preparar(el) {
    el.classList.add("cx-ascii-hero");
    var o = el.dataset, n = function (k, p) { var v = parseFloat(o[k]); return isNaN(v) ? p : v; };
    var CEL = n("celula", 9), RAMPA = (o.caracteres || " .:-=+*#%@").split(""), TINTA = o.tinta || "#111", DEST = o.destaque || "#4f5bff";
    var MINI = Math.max(1, Math.round(n("minimo", 1))), RAIO = n("raio", 130), CONTR = n("contraste", 1.25), BASE = o.alinhar !== "centro", FLUTUA = o.flutuar !== "nao" && !poucoMovimento;
    if (o.alt) { el.setAttribute("role", "img"); el.setAttribute("aria-label", o.alt); } else el.setAttribute("aria-hidden", "true");
    var tela = document.createElement("canvas"), ctx = tela.getContext("2d"); el.appendChild(tela);
    var img = new Image(); img.src = o.imagem || "";
    var W = 0, H = 0, d = 1, cols = 0, rows = 0, ox = 0, oy = 0, cel = [], visivel = false, rodando = false, t0 = 0, introIni = null;
    var ptr = { x: 0, y: 0, sx: 0, sy: 0, on: false, f: 0 };
    function hex(c) { var x = document.createElement("canvas").getContext("2d"); x.fillStyle = c; var f = x.fillStyle; return f[0] === "#" ? [1, 3, 5].map(function (i) { return parseInt(f.substr(i, 2), 16); }) : (f.match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(Number); }
    var cT = TINTA === "imagem" ? null : hex(TINTA), cD = hex(DEST);
    function medir() {
      if (!img.naturalWidth) return;
      d = Math.min(devicePixelRatio || 1, 2); W = el.clientWidth; H = el.clientHeight;
      tela.width = W * d; tela.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      var e = Math.min(W / img.naturalWidth, H / img.naturalHeight), iw = img.naturalWidth * e, ih = img.naturalHeight * e;
      cols = Math.floor(iw / CEL); rows = Math.floor(ih / (CEL * 1.15));
      ox = (W - cols * CEL) / 2; oy = BASE ? H - rows * CEL * 1.15 : (H - rows * CEL * 1.15) / 2;
      var am = document.createElement("canvas"); am.width = cols; am.height = rows; var ac = am.getContext("2d");
      ac.drawImage(img, 0, 0, cols, rows); var px = ac.getImageData(0, 0, cols, rows).data;
      cel = [];
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var k = (j * cols + i) * 4, a = px[k + 3] / 255; if (a < .25) continue;
        var r = px[k], g = px[k + 1], b = px[k + 2], L = (.2126 * r + .7152 * g + .0722 * b) / 255;
        L = Math.max(0, Math.min(1, (L - .5) * CONTR + .5));
        var idx = Math.max(MINI, Math.round(MINI + (1 - L) * (RAMPA.length - 1 - MINI)));
        cel.push({ x: ox + i * CEL + CEL / 2, y: oy + j * CEL * 1.15 + CEL * .575, ch: RAMPA[idx], idx: idx, a: Math.min(1, a * 1.2), c: [r, g, b], atraso: (rows - j) / rows * .9 + Math.random() * .5, brilho: 0 });
      }
      desenhar(performance.now());
    }
    function desenhar(agora) {
      if (!cel.length) return;
      var t = (agora - t0) / 1000;
      if (introIni === null && visivel) introIni = agora;
      var ti = introIni === null ? 0 : (agora - introIni) / 1000;
      // bolha: cursor ou passeio automático
      var autoX = W * (.5 + .28 * Math.sin(t * .37)), autoY = H * (.45 + .25 * Math.sin(t * .53 + 1));
      ptr.f += ((ptr.on ? 1 : 0) - ptr.f) * .08;
      var bx = ptr.f * ptr.x + (1 - ptr.f) * autoX, by = ptr.f * ptr.y + (1 - ptr.f) * autoY;
      ptr.sx += (bx - ptr.sx) * .12; ptr.sy += (by - ptr.sy) * .12;
      var bob = FLUTUA ? Math.sin(t * .9) * 4 : 0;
      ctx.clearRect(0, 0, W, H);
      ctx.font = "700 " + Math.round(CEL * 1.12) + "px ui-monospace, 'Geist Mono', Menlo, Consolas, monospace";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      var R2 = RAIO * RAIO;
      for (var q = 0; q < cel.length; q++) {
        var c = cel[q], x = c.x, y = c.y + bob, ch = c.ch;
        var p = poucoMovimento ? 1 : Math.max(0, Math.min(1, (ti - c.atraso) / .35));
        if (p <= 0) continue;
        if (p < 1) ch = RAMPA[1 + ((Math.random() * (RAMPA.length - 1)) | 0)];
        else if (!poucoMovimento && Math.random() < .004) c.brilho = 1;
        var dx = x - ptr.sx, dy = y - ptr.sy, d2 = dx * dx + dy * dy, f = 0;
        if (!poucoMovimento && d2 < R2 * 2.2) {
          f = Math.exp(-d2 / (R2 * .45));
          var dist = Math.sqrt(d2) || 1, emp = f * CEL * 1.6; x += dx / dist * emp; y += dy / dist * emp;
          if (f > .25) ch = RAMPA[Math.min(RAMPA.length - 1, c.idx + 2)];
        }
        if (c.brilho > 0) { ch = RAMPA[1 + ((Math.random() * (RAMPA.length - 1)) | 0)]; c.brilho -= .08; }
        var base = cT || c.c, m = Math.min(1, f * 1.4);
        ctx.fillStyle = "rgb(" + ((base[0] + (cD[0] - base[0]) * m) | 0) + "," + ((base[1] + (cD[1] - base[1]) * m) | 0) + "," + ((base[2] + (cD[2] - base[2]) * m) | 0) + ")";
        ctx.globalAlpha = c.a * p * (.75 + .25 * m);
        ctx.fillText(ch, x, y);
      }
      ctx.globalAlpha = 1;
    }
    function laco(a) { if (!visivel || document.hidden) { rodando = false; return; } desenhar(a); requestAnimationFrame(laco); }
    function ligar() { if (!rodando && visivel && !poucoMovimento) { rodando = true; requestAnimationFrame(laco); } }
    el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = e.pointerType === "mouse"; });
    el.addEventListener("pointerleave", function () { ptr.on = false; });
    img.onload = function () {
      t0 = performance.now(); medir();
      var tt; new ResizeObserver(function () { clearTimeout(tt); tt = setTimeout(medir, 120); }).observe(el);
      new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; if (poucoMovimento && visivel) desenhar(performance.now()); ligar(); }, { threshold: .15 }).observe(el);
    };
  }
  function iniciar() { document.querySelectorAll('[data-cx="ascii-hero"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
