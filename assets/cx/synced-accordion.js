/* Synced Accordion
   Uso:
   <div data-cx="synced-accordion" data-grupo="lancamentos" data-auto="6">
     <div data-item data-imagem="assets/img/1.webp" data-alt="..." data-tag="EP"><h3>Título</h3><p>Legenda.</p><a data-cta href="#">Ouvir</a></div>
     ...
   </div>
   Em qualquer lugar da página, peças do mesmo grupo acompanham o painel aberto:
     <span data-cx-sync="lancamentos" data-mostrar="titulo"></span>   (titulo | legenda | contador)
     <div data-cx-sync-progresso="lancamentos"></div>
   Opções: data-inicial (0), data-auto (segundos; vazio = desligado), data-clique (sim = abre no clique; padrão hover no mouse),
           data-altura (480), data-dobrado (72), data-gap (10), data-raio (24), data-rotulo (texto do topo, padrão "Projetos"), data-link ("Ver projeto"). */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MATIZES = [262, 24, 172, 40, 214, 330];
  function preparar(el) {
    var o = el.dataset, grupo = o.grupo || "accordion", auto = parseFloat(o.auto) || 0, clique = o.clique === "sim";
    el.classList.add("cx-synced-accordion"); if (auto) { el.classList.add("tem-auto"); el.style.setProperty("--cx-sy-tempo", auto + "s"); }
    [["altura", "--cx-sy-altura"], ["dobrado", "--cx-sy-dobrado"], ["gap", "--cx-sy-gap"], ["raio", "--cx-sy-raio"]].forEach(function (p) { if (o[p[0]]) el.style.setProperty(p[1], o[p[0]] + "px"); });
    var dados = [];
    var paineis = Array.from(el.querySelectorAll(":scope > [data-item]")).map(function (f, i, arr) {
      var h = f.querySelector("h1,h2,h3,h4,h5,h6"), a = f.querySelector("a[data-cta]");
      var leg = Array.from(f.children).filter(function (c) { return c !== h && c !== a; }).map(function (c) { return c.outerHTML; }).join("");
      var t = h ? h.innerHTML : "", n = String(i + 1).padStart(2, "0"), total = String(arr.length).padStart(2, "0");
      dados.push({ titulo: h ? h.textContent : "", legenda: (f.querySelector("p") || {}).textContent || "", contador: n + " / " + total });
      var p = document.createElement("div"); p.className = "cx-sy-painel"; p.tabIndex = 0; p.setAttribute("role", "button"); p.setAttribute("aria-label", h ? h.textContent : "");
      p.style.setProperty("--h", MATIZES[i % MATIZES.length]);
      p.innerHTML = (f.dataset.imagem ? '<img src="' + f.dataset.imagem + '" alt="' + (f.dataset.alt || "") + '" decoding="async">' : "") + '<span class="cx-sy-sombra"></span>' +
        '<div class="cx-sy-dobra" aria-hidden="true"><small>' + n + "</small><span>" + t + "</span></div>" +
        '<div class="cx-sy-conteudo"><div class="cx-sy-topo"><span>' + (f.dataset.tag || o.rotulo || "Projetos") + "</span><span>" + n + " / " + total + '</span></div><div class="cx-sy-base"><h3>' + t +
        '</h3><div class="cx-sy-leg">' + leg + "</div>" + (a ? '<a href="' + a.getAttribute("href") + '">' + a.innerHTML + " →</a>" : (o.link ? '<a href="#">' + o.link + " →</a>" : "")) + '</div></div><span class="cx-sy-barra"><i></i></span>';
      return p;
    });
    el.replaceChildren.apply(el, paineis);
    var N = paineis.length, atual = -1, timer = null, pausado = false;
    function avisar() {
      var d = dados[atual];
      document.querySelectorAll('[data-cx-sync="' + grupo + '"]').forEach(function (s) {
        var novo = d[s.dataset.mostrar || "titulo"] || ""; if (s.textContent === novo) return;
        s.classList.add("cx-sy-texto", "is-trocando");
        setTimeout(function () { s.textContent = novo; s.classList.remove("is-trocando"); }, poucoMovimento ? 0 : 160);
      });
      document.querySelectorAll('[data-cx-sync-progresso="' + grupo + '"]').forEach(function (b) {
        if (!b.firstChild) { b.classList.add("cx-sy-progresso"); b.innerHTML = "<i></i>"; }
        b.firstChild.style.transform = "scaleX(" + ((atual + 1) / N) + ")";
      });
    }
    function abrir(i) {
      i = (i + N) % N; if (i === atual) return; atual = i;
      paineis.forEach(function (p, k) { p.classList.toggle("is-aberto", k === i); p.classList.remove("is-rodando"); p.setAttribute("aria-expanded", k === i); p.querySelectorAll("a").forEach(function (a) { a.tabIndex = k === i ? 0 : -1; }); });
      avisar(); relogio();
    }
    function relogio() {
      clearTimeout(timer); if (!auto || poucoMovimento) return;
      var p = paineis[atual]; void p.offsetWidth; p.classList.add("is-rodando");
      if (!pausado) timer = setTimeout(function () { atual === -1 || abrir(atual + 1); }, auto * 1000);
    }
    if (!clique) el.addEventListener("pointerover", function (e) { var p = e.target.closest(".cx-sy-painel"); if (p && e.pointerType === "mouse") abrir(paineis.indexOf(p)); });
    el.addEventListener("click", function (e) { var p = e.target.closest(".cx-sy-painel"); if (p && !e.target.closest("a")) abrir(paineis.indexOf(p)); });
    el.addEventListener("keydown", function (e) {
      var j = { ArrowRight: atual + 1, ArrowDown: atual + 1, ArrowLeft: atual - 1, ArrowUp: atual - 1, Home: 0, End: N - 1 }[e.key];
      if (j !== undefined) { e.preventDefault(); abrir(j); paineis[atual].focus(); }
      else if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("cx-sy-painel")) { e.preventDefault(); abrir(paineis.indexOf(e.target)); }
    });
    el.addEventListener("pointerenter", function () { pausado = true; el.classList.add("is-pausado"); clearTimeout(timer); });
    el.addEventListener("pointerleave", function () { pausado = false; el.classList.remove("is-pausado"); relogio(); });
    abrir(Math.min(N - 1, parseInt(o.inicial, 10) || 0));
  }
  function iniciar() { document.querySelectorAll('[data-cx="synced-accordion"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
