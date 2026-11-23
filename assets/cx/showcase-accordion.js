/* Showcase Accordion
   Uso:
   <div data-cx="showcase-accordion">
     <div data-item data-imagem="assets/img/1.webp" data-alt="..." data-subtitulo="Warung, Itajaí">
       <h3>Nome da festa</h3><p>Descrição curta.</p><a data-cta href="#">Ver mais</a>
     </div>
     ...
   </div>
   h3 = título vertical; data-subtitulo = título grande do card branco. Opções: data-inicial (0), data-altura (440), data-hover (sim). */
(function () {
  function preparar(el) {
    var o = el.dataset;
    el.classList.add("cx-showcase-accordion");
    if (o.altura) el.style.setProperty("--cx-sa-altura", o.altura + "px");
    var itens = Array.from(el.querySelectorAll(":scope > [data-item]")).map(function (f, i) {
      var h = f.querySelector("h1,h2,h3,h4,h5,h6"), a = f.querySelector("a[data-cta]");
      var corpo = Array.from(f.children).filter(function (c) { return c !== h && c !== a; }).map(function (c) { return c.outerHTML; }).join("");
      var t = h ? h.innerHTML : "", img = f.dataset.imagem || "", href = a ? a.getAttribute("href") : "#";
      var it = document.createElement("div"); it.className = "cx-sa-item";
      it.innerHTML = '<button type="button" class="cx-sa-fechado" aria-expanded="false"><img src="' + img + '" alt="" decoding="async"><span class="cx-sa-mais" aria-hidden="true">+</span><span class="cx-sa-vt">' + t + "</span></button>" +
        '<div class="cx-sa-aberto"><img src="' + img + '" alt="' + (f.dataset.alt || "") + '" decoding="async"><span class="cx-sa-vt">' + t + "</span>" +
        '<div class="cx-sa-ficha"><span class="cx-sa-n">' + String(i + 1).padStart(2, "0") + '</span><a class="cx-sa-seta" href="' + href + '" aria-label="Abrir ' + (h ? h.textContent : "") + '">↗</a>' +
        "<h3>" + (f.dataset.subtitulo || t) + '</h3><div class="cx-sa-desc">' + corpo + "</div>" +
        (a ? '<a class="cx-sa-btn" href="' + href + '">' + a.innerHTML + "<i>→</i></a>" : "") + "</div></div>";
      return it;
    });
    el.replaceChildren.apply(el, itens);
    function abrir(i) {
      itens.forEach(function (it, k) {
        it.classList.toggle("is-aberto", k === i);
        it.querySelector(".cx-sa-fechado").setAttribute("aria-expanded", k === i);
        it.querySelectorAll(".cx-sa-aberto a").forEach(function (a) { a.tabIndex = k === i ? 0 : -1; });
      });
    }
    el.addEventListener("click", function (e) { var b = e.target.closest(".cx-sa-fechado"); if (b) abrir(itens.indexOf(b.parentElement)); });
    if (o.hover === "sim") el.addEventListener("pointerover", function (e) { var b = e.target.closest(".cx-sa-fechado"); if (b && e.pointerType === "mouse") abrir(itens.indexOf(b.parentElement)); });
    abrir(Math.min(itens.length - 1, parseInt(o.inicial, 10) || 0));
  }
  function iniciar() { document.querySelectorAll('[data-cx="showcase-accordion"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
