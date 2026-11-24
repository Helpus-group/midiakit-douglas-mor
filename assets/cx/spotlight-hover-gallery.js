/* Spotlight Hover Gallery
   Uso: <div data-cx="spotlight-hover-gallery"> <img src="…" alt="…"> … (até 7) </div>
   As fotos viram uma colagem sobreposta e numerada "(01)". O cursor põe uma foto em destaque no lugar onde ela está;
   clicar (ou tocar) leva a foto para o lugar principal, trocando com a que estava lá, num movimento de mola.
   Opções: data-auto (segundos entre trocas automáticas do lugar principal; 0 desliga; padrão 4), data-proporcao (largura/altura; 1),
           data-numeros (sim|nao). Só troca sozinho com a galeria na tela e sem o cursor em cima. */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // lugares da colagem em % (esquerda, topo, largura, altura, camada); o 0 é o principal
  var LUGARES = [[26, 6, 46, 86, 5], [0, 2, 24, 44, 3], [3, 52, 22, 42, 3], [74, 0, 26, 42, 3], [76, 48, 24, 46, 3], [15, 64, 17, 30, 8], [65, 11, 15, 27, 8]];
  function preparar(el) {
    el.classList.add("cx-spotlight-hover-gallery");
    var o = el.dataset, AUTO = o.auto === undefined ? 4 : parseFloat(o.auto) || 0;
    if (o.proporcao) el.style.setProperty("--cx-shg-proporcao", o.proporcao);
    var imgs = [].slice.call(el.querySelectorAll(":scope > img")).slice(0, LUGARES.length);
    var cards = imgs.map(function (im, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "cx-shg-card";
      b.setAttribute("aria-label", "Destacar foto " + (i + 1) + (im.alt ? ": " + im.alt : ""));
      im.draggable = false; b.appendChild(im);
      if (o.numeros !== "nao") { var n = document.createElement("span"); n.className = "cx-shg-num"; n.textContent = "(" + String(i + 1).padStart(2, "0") + ")"; b.appendChild(n); }
      el.appendChild(b); return b;
    });
    var lugar = cards.map(function (_, i) { return i; }); // lugar[card] = índice do lugar
    function aplicar() {
      cards.forEach(function (c, i) { var L = LUGARES[lugar[i]]; c.style.left = L[0] + "%"; c.style.top = L[1] + "%"; c.style.width = L[2] + "%"; c.style.height = L[3] + "%"; c.style.zIndex = L[4]; });
    }
    function principal(i) { var j = lugar.indexOf(0); if (j === i) return; lugar[j] = lugar[i]; lugar[i] = 0; aplicar(); }
    function foco(c) { cards.forEach(function (x) { x.classList.toggle("is-foco", x === c); }); el.classList.toggle("tem-foco", !!c); }
    var dentro = false;
    cards.forEach(function (c, i) {
      c.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { dentro = true; foco(c); } });
      c.addEventListener("click", function () { principal(i); foco(null); });
    });
    el.addEventListener("pointerleave", function () { dentro = false; foco(null); });
    aplicar();
    if (AUTO > 0 && !poucoMovimento && cards.length > 1) {
      var visivel = false, prox = 1;
      new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; }, { threshold: .3 }).observe(el);
      setInterval(function () {
        if (!visivel || dentro || document.hidden) return;
        var atual = lugar.indexOf(0); prox = (atual + 1) % cards.length; principal(prox);
      }, AUTO * 1000);
    }
  }
  function iniciar() { document.querySelectorAll('[data-cx="spotlight-hover-gallery"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
