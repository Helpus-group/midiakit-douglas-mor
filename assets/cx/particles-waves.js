/* Particles Waves
   Uso (dentro de uma seção com position relative): <div data-cx="particles-waves"></div>
   Malha 3D de partículas formando um mar que ondula, em perspectiva; pontos perto e longe ficam desfocados (profundidade),
   a malha torce devagar e o mouse abre uma onda de afastamento. Rolagem inclina a câmera.
   Opções: data-colunas (110), data-linhas (46), data-cor (padrão --acento), data-cor-2 (padrão --texto),
           data-altura (1: altura das ondas), data-torcao (0.4), data-caotico (sim|nao), data-profundidade (sim|nao: desfoque nas pontas). */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function preparar(el) {
    var area = el.parentElement; if (getComputedStyle(area).position === "static") area.style.position = "relative";
    el.classList.add("cx-particles-waves"); el.setAttribute("aria-hidden", "true");
    var o = el.dataset, n = function (k, p) { var v = parseFloat(o[k]); return isNaN(v) ? p : v; };
    var PONTO = n("ponto", 1), C = n("colunas", 110), L = n("linhas", 46), AMP = n("altura", 1), TOR = n("torcao", .4), caos = o.caotico === "sim", dof = o.profundidade !== "nao";
    var tela = document.createElement("canvas"), ctx = tela.getContext("2d"); el.appendChild(tela);
    var dpr = Math.min(2, devicePixelRatio || 1), w = 0, h = 0, mouse = null, cor1 = "#8fa8ff", cor2 = "#fff", t0 = performance.now(), visivel = false, rodando = false, tick = 0, incl = 0;
    function lerCores() { var cs = getComputedStyle(el); cor1 = o.cor || cs.getPropertyValue("--acento").trim() || cor1; cor2 = o.cor2 || o["cor-2"] || cs.getPropertyValue("--texto").trim() || cor2; }
    function medir() { w = el.clientWidth; h = el.clientHeight; tela.width = w * dpr; tela.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); quadro(performance.now()); }
    function quadro(agora) {
      if (tick++ % 60 === 0) lerCores();
      var t = poucoMovimento ? 3 : (agora - t0) / 1000;
      var r = el.getBoundingClientRect(); var alvoIncl = Math.max(-1, Math.min(1, -r.top / Math.max(1, r.height))); incl += (alvoIncl - incl) * .08;
      ctx.clearRect(0, 0, w, h);
      var foco = w * .9, camY = 1.2 - incl * .8, horiz = h * (.42 + incl * .1);
      for (var j = 0; j < L; j++) {
        var z = 1.2 + j * .18; // profundidade
        for (var i = 0; i < C; i++) {
          var x = (i / (C - 1) - .5) * 14;
          var tw = TOR * Math.sin(t * .15 + z * .3);
          var xx = x * Math.cos(tw) - 0, onda = Math.sin(x * .6 + t * .9) * .35 + Math.sin(z * .7 - t * .7) * .3 + Math.sin((x + z) * .35 + t * .4) * .25;
          if (caos) onda += Math.sin(x * 2.3 + z * 1.7 + t * 1.6) * .12;
          var y = onda * AMP + x * Math.sin(tw) * .15;
          var sx = w / 2 + xx / z * foco * .5, sy = horiz + (camY - y) / z * foco * .35;
          if (mouse) { var dx = sx - mouse.x, dy = sy - mouse.y, d2 = dx * dx + dy * dy; if (d2 < 22500) { var f = (1 - Math.sqrt(d2) / 150) * 18; sy += dy / Math.sqrt(d2 + 1) * f; sx += dx / Math.sqrt(d2 + 1) * f; } }
          if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;
          var prox = 1 - j / L, tam = (.5 + prox * 2.2) * PONTO, a = .15 + prox * .85;
          if (dof) { var fora = Math.abs(prox - .55); if (fora > .3) { tam *= 1 + (fora - .3) * 4; a *= 1 - (fora - .3) * 1.6; } }
          ctx.globalAlpha = Math.max(0, Math.min(1, a)); ctx.fillStyle = (onda > .35) ? cor2 : cor1;
          ctx.beginPath(); ctx.arc(sx, sy, tam, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    function laco(t) { if (!visivel || document.hidden) { rodando = false; return; } quadro(t); requestAnimationFrame(laco); }
    function ligar() { if (!rodando && visivel && !poucoMovimento) { rodando = true; requestAnimationFrame(laco); } }
    area.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    area.addEventListener("pointerleave", function () { mouse = null; });
    lerCores(); medir(); new ResizeObserver(medir).observe(el);
    new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; ligar(); }).observe(el);
    document.addEventListener("visibilitychange", ligar);
  }
  function iniciar() { document.querySelectorAll('[data-cx="particles-waves"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
