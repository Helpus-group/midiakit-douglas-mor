/* Accordion Tab Switch
   Uso:
   <div data-cx="accordion-tab-switch" data-rotulo="Rider">
     <div data-item data-imagem="assets/img/1.webp" data-alt="..."><h3>Pergunta ou tópico</h3><p>Texto.</p></div>
     ...
   </div>
   Opções: data-rotulo (texto do canto), data-inicial (0), data-altura (padrão 100vh; ex.: "640px"), data-lado (direita|esquerda: lado da foto). */
(function () {
  function preparar(el) {
    var o = el.dataset;
    el.classList.add("cx-accordion-tab-switch");
    if (o.altura) el.style.setProperty("--cx-ats-altura", o.altura);
    var fontes = Array.from(el.querySelectorAll(":scope > [data-item]"));
    var lado = document.createElement("div"); lado.className = "cx-ats-lado";
    var midia = document.createElement("div"); midia.className = "cx-ats-midia";
    lado.innerHTML = '<span class="cx-ats-rotulo">' + (o.rotulo || "") + '</span><div class="cx-ats-lista"></div>';
    var lista = lado.lastChild, imgs = [];
    var itens = fontes.map(function (f, i) {
      var h = f.querySelector("h1,h2,h3,h4,h5,h6");
      var corpo = Array.from(f.children).filter(function (c) { return c !== h; }).map(function (c) { return c.outerHTML; }).join("");
      var im = document.createElement("img"); im.src = f.dataset.imagem || ""; im.alt = f.dataset.alt || ""; im.decoding = "async";
      midia.appendChild(im); imgs.push(im);
      var it = document.createElement("div"); it.className = "cx-ats-item";
      it.innerHTML = '<button type="button" class="cx-ats-cab" aria-expanded="false"><span class="cx-ats-num">' + String(i + 1).padStart(2, "0") +
        "</span><span>" + (h ? h.innerHTML : "") + '</span><span class="cx-ats-ico" aria-hidden="true"></span></button>' +
        '<div class="cx-ats-painel" role="region"><div><div class="cx-ats-corpo">' + corpo + "</div></div></div>";
      lista.appendChild(it); return it;
    });
    if (o.lado === "esquerda") el.replaceChildren(midia, lado); else el.replaceChildren(lado, midia);
    function abrir(i) {
      itens.forEach(function (it, k) {
        it.classList.toggle("is-aberto", k === i);
        it.querySelector(".cx-ats-cab").setAttribute("aria-expanded", k === i);
        imgs[k].classList.toggle("is-ativa", k === i);
      });
    }
    lista.addEventListener("click", function (e) { var b = e.target.closest(".cx-ats-cab"); if (b) abrir(itens.indexOf(b.parentElement)); });
    abrir(Math.min(itens.length - 1, parseInt(o.inicial, 10) || 0));
  }
  function iniciar() { document.querySelectorAll('[data-cx="accordion-tab-switch"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
