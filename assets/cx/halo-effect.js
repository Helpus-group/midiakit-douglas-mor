/* Halo Effect
   Uso (dentro de uma seção com position relative): <div data-cx="halo-effect"></div>
   Três grupos de círculos de cor que, a cada N segundos, deslizam para um novo ponto aleatório (sempre dentro da seção).
   Opções: data-quantidade ("5,5,5"), data-tamanho (200), data-ciclo (3 s), data-desfoque (60 px),
           data-cores ("#5EA9FF,#ADD3FF,#FFFFFF"; "site" = tokens), data-opacidade (0.7). */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function preparar(el) {
    var area = el.parentElement; if (getComputedStyle(area).position === "static") area.style.position = "relative";
    el.classList.add("cx-halo-effect"); el.setAttribute("aria-hidden", "true");
    var o = el.dataset, n = function (k, p) { var v = parseFloat(o[k]); return isNaN(v) ? p : v; };
    var qtd = (o.quantidade || "5,5,5").split(",").map(function (s) { return parseInt(s, 10) || 0; });
    var cores = o.cores === "site" ? ["var(--acento)", "var(--texto-suave)", "var(--texto)"] : (o.cores || "#5EA9FF,#ADD3FF,#FFFFFF").split(",").map(function (s) { return s.trim(); });
    var TAM = n("tamanho", 200), CIC = Math.max(1, n("ciclo", 3));
    el.style.setProperty("--cx-he-blur", n("desfoque", 60) + "px");
    el.style.setProperty("--cx-he-op", n("opacidade", .7));
    el.style.setProperty("--cx-he-dur", CIC + "s");
    var circ = [];
    qtd.forEach(function (q, g) { for (var i = 0; i < q; i++) { var c = document.createElement("span"); c.style.width = c.style.height = TAM + "px"; c.style.background = cores[g] || cores[0]; el.appendChild(c); circ.push(c); } });
    function mover() {
      var w = el.clientWidth, h = el.clientHeight;
      circ.forEach(function (c) { c.style.transform = "translate(" + (Math.random() * Math.max(0, w - TAM)) + "px," + (Math.random() * Math.max(0, h - TAM)) + "px)"; });
    }
    mover();
    if (!poucoMovimento) {
      var timer = null;
      new IntersectionObserver(function (e) {
        clearInterval(timer);
        if (e[0].isIntersecting) { requestAnimationFrame(mover); timer = setInterval(function () { if (!document.hidden) mover(); }, CIC * 1000); }
      }).observe(el);
    }
  }
  function iniciar() { document.querySelectorAll('[data-cx="halo-effect"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
