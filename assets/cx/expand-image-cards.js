/* Expand Image Cards
   Uso:
   <div data-cx="expand-image-cards">
     <div data-item data-imagem="assets/img/1.webp" data-alt="..." data-tag="Clubes">
       <h3>Pistas que lotam antes da meia-noite</h3><p>Descrição curta.</p><a data-cta href="#">Fechar data</a>
     </div>
     ...
   </div>
   Opções: data-inicial (0), data-altura (500), data-gap (12), data-raio (19), data-cresce (2.6), data-zoom (1.055), data-tinta (0.2). */
(function () {
  function preparar(el) {
    var o = el.dataset;
    el.classList.add("cx-expand-image-cards");
    [["altura", "--cx-eic-altura", "px"], ["gap", "--cx-eic-gap", "px"], ["raio", "--cx-eic-raio", "px"], ["cresce", "--cx-eic-cresce", ""], ["zoom", "--cx-eic-zoom", ""], ["tinta", "--cx-eic-tinta", ""]]
      .forEach(function (p) { if (o[p[0]]) el.style.setProperty(p[1], o[p[0]] + p[2]); });
    var cards = Array.from(el.querySelectorAll(":scope > [data-item]")).map(function (f) {
      var h = f.querySelector("h1,h2,h3,h4,h5,h6"), a = f.querySelector("a[data-cta]"), p = f.querySelector("p");
      var c = document.createElement("div"); c.className = "cx-eic-card"; c.tabIndex = 0; c.setAttribute("role", "button");
      c.innerHTML = '<img src="' + (f.dataset.imagem || "") + '" alt="' + (f.dataset.alt || "") + '" decoding="async"><div class="cx-eic-cont">' +
        '<div class="cx-eic-topo"><span class="cx-eic-olho">' + (f.dataset.tag || "") + '</span><button type="button" class="cx-eic-mais" aria-label="Abrir"></button></div>' +
        '<div class="cx-eic-base"><h3>' + (h ? h.innerHTML : "") + '</h3><div class="cx-eic-desc"><div>' + (p ? "<p>" + p.innerHTML + "</p>" : "") + "</div></div>" +
        (a ? '<a class="cx-eic-cta" href="' + a.getAttribute("href") + '">' + a.innerHTML + " <i>↗</i></a>" : "") + "</div></div>";
      return c;
    });
    el.replaceChildren.apply(el, cards);
    // i = -1 fecha todos (os cards ficam do mesmo tamanho)
    function abrir(i, foco) {
      cards.forEach(function (c, k) {
        c.classList.toggle("is-aberto", k === i); c.setAttribute("aria-expanded", k === i);
        c.querySelectorAll("a").forEach(function (a) { a.tabIndex = k === i ? 0 : -1; });
        c.querySelector(".cx-eic-mais").setAttribute("aria-label", k === i ? "Fechar" : "Abrir");
      });
      if (foco && i >= 0) { var a = cards[i].querySelector("a"); if (a) setTimeout(function () { a.focus({ preventScroll: true }); }, 400); }
    }
    el.addEventListener("click", function (e) {
      var c = e.target.closest(".cx-eic-card"); if (!c || e.target.closest("a")) return;
      var aberto = c.classList.contains("is-aberto");
      if (e.target.closest(".cx-eic-mais")) { e.stopPropagation(); abrir(aberto ? -1 : cards.indexOf(c)); return; }
      if (!aberto) abrir(cards.indexOf(c));
    });
    el.addEventListener("keydown", function (e) { var c = e.target.closest(".cx-eic-card"); if (c && e.target === c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); abrir(cards.indexOf(c), true); } });
    abrir(Math.min(cards.length - 1, parseInt(o.inicial, 10) || 0));
  }
  function iniciar() { document.querySelectorAll('[data-cx="expand-image-cards"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
