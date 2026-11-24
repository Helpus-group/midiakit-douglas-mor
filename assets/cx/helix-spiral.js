/* Helix Spiral
   Uso: <div data-cx="helix-spiral"> <img src="…" alt="…"> … </div>
   Galeria 3D: as fotos ficam numa espiral (hélice) em perspectiva; a da frente fica maior e nítida, as vizinhas recuam
   com desfoque e transparência. Gira sozinha devagar; arrastar (ou deslizar no celular) gira com inércia;
   clicar numa foto traz ela para a frente; setas do teclado também. Só anima com a galeria na tela.
   Opções: data-altura (560 px), data-raio (240 px), data-espaco (42 px entre voltas), data-arco (360 graus),
           data-largura (190 px) e data-altura-item (250 px) dos cards, data-foco (1.2: escala da foto da frente),
           data-queda (3: quão rápido as vizinhas somem), data-desfoque (6 px), data-velocidade (0.18; 0 = parada),
           data-roda (nao|sim: a roda do mouse sobre a galeria gira; padrão nao para não prender a rolagem da página),
           data-acento (#4f5bff), data-borda (18: % de esmaecimento em cima e embaixo). */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function mod(v, n) { return ((v % n) + n) % n; }
  function desloc(i, p, n) { return mod(i - p + n / 2, n) - n / 2; }
  function preparar(el) {
    el.classList.add("cx-helix-spiral"); el.tabIndex = 0; el.setAttribute("role", "region"); el.setAttribute("aria-label", el.getAttribute("aria-label") || "Galeria em espiral");
    var o = el.dataset, n = function (k, p) { var v = parseFloat(o[k]); return isNaN(v) ? p : v; };
    var ARCO = n("arco", 360), RAIO = n("raio", 240), ESP = n("espaco", 42), LW = n("largura", 190), LH = n("alturaItem", 250);
    var FOCO = n("foco", 1.2), QUEDA = n("queda", 3), DESF = n("desfoque", 6), VEL = n("velocidade", .18);
    if (o.altura) el.style.setProperty("--cx-hx-altura", parseFloat(o.altura) + "px");
    if (o.acento) el.style.setProperty("--cx-hx-acento", o.acento);
    if (o.borda) el.style.setProperty("--cx-hx-borda", parseFloat(o.borda) + "%");
    var luz = document.createElement("div"); luz.className = "cx-hx-luz"; el.appendChild(luz);
    var centro = document.createElement("div"); centro.className = "cx-hx-centro"; el.appendChild(centro);
    var imgs = [].slice.call(el.querySelectorAll(":scope > img")), N = Math.max(imgs.length, 1), passo = ARCO / N;
    var itens = imgs.map(function (im, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "cx-hx-item"; b.style.width = LW + "px"; b.style.height = LH + "px";
      b.setAttribute("aria-label", "Foto " + (i + 1) + (im.alt ? ": " + im.alt : "")); im.draggable = false; b.appendChild(im); centro.appendChild(b);
      b.addEventListener("click", function () { if (!moveu) focar(i); });
      return b;
    });
    var alvo = 0, mostra = 0, vel = 0, arrast = false, moveu = false, px = 0, pt = 0, ultimaMexida = 0, ult = 0, visivel = false, rodando = false;
    function focar(i) { alvo += desloc(i, alvo, N); vel = 0; ultimaMexida = performance.now(); ligar(); }
    function quadro(t) {
      var dt = Math.min(.05, Math.max(0, (t - (ult || t)) / 1000)); ult = t;
      if (!arrast) {
        if (Math.abs(vel) > 8e-4) { alvo += vel * dt * 60; vel *= Math.pow(.92, dt * 60); } else vel = 0;
        if (!poucoMovimento && VEL > 0 && performance.now() - ultimaMexida > 1000) alvo += VEL * dt;
      }
      mostra += (alvo - mostra) * Math.min(1, dt * 6 || 1);
      itens.forEach(function (b, i) {
        var w = desloc(i, mostra, N), ang = w * passo, r = ang * Math.PI / 180;
        var x = Math.sin(r) * RAIO, z = Math.cos(r) * RAIO - RAIO, y = w * ESP, incl = Math.max(-35, Math.min(35, -ang * .55));
        var dist = Math.abs(w), esc = Math.max(.35, FOCO - dist * (FOCO - .5) / QUEDA), op = Math.max(.08, 1 - dist * .9 / QUEDA), bl = Math.min(DESF, dist / QUEDA * DESF);
        b.style.transform = "translate(-50%,-50%) translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px," + z.toFixed(1) + "px) rotateY(" + incl.toFixed(1) + "deg) scale(" + esc.toFixed(3) + ")";
        b.style.opacity = op.toFixed(3); b.style.filter = bl > .05 ? "blur(" + bl.toFixed(2) + "px)" : "none"; b.style.zIndex = Math.round(1000 - dist * 10);
        b.classList.toggle("is-foco", dist < .5); b.tabIndex = dist < .5 ? 0 : -1;
      });
    }
    function laco(t) { if (!visivel || document.hidden) { rodando = false; ult = 0; return; } quadro(t); requestAnimationFrame(laco); }
    function ligar() { if (!rodando && visivel) { rodando = true; requestAnimationFrame(laco); } }
    el.addEventListener("pointerdown", function (e) { arrast = true; moveu = false; vel = 0; px = e.clientX; pt = performance.now(); ultimaMexida = pt; });
    addEventListener("pointermove", function (e) {
      if (!arrast) return; var agora = performance.now(), dx = e.clientX - px; if (Math.abs(dx) > 3) { moveu = true; el.classList.add("arrastando"); }
      var delta = -dx * .012; alvo += delta; vel = delta / Math.max(1, agora - pt) * 16; px = e.clientX; pt = agora; ultimaMexida = agora; ligar();
    });
    addEventListener("pointerup", function () { if (!arrast) return; arrast = false; el.classList.remove("arrastando"); ultimaMexida = performance.now(); setTimeout(function () { moveu = false; }, 0); });
    if (o.roda === "sim") el.addEventListener("wheel", function (e) { e.preventDefault(); alvo += e.deltaY * .0025; ultimaMexida = performance.now(); ligar(); }, { passive: false });
    el.addEventListener("keydown", function (e) { var at = Math.round(mod(alvo, N)); if (e.key === "ArrowRight") { e.preventDefault(); focar(mod(at + 1, N)); } else if (e.key === "ArrowLeft") { e.preventDefault(); focar(mod(at - 1, N)); } });
    quadro(performance.now());
    new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; ligar(); }, { threshold: .15 }).observe(el);
  }
  function iniciar() { document.querySelectorAll('[data-cx="helix-spiral"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
