/* Premium Glow Cards
   Uso: <div data-cx="premium-glow-cards"> <a data-card data-cor="#4f5bff">…conteúdo…</a> … </div>
   Cada card ganha camadas de luz por baixo do conteúdo: base escura tingida, duas manchas desfocadas que
   flutuam devagar, brilho interno na base e uma borda que acende em volta do cursor (o mouse é lido no grupo todo).
   Opções no grupo: data-cor (cor padrão; "#hex" ou "r,g,b"), data-velocidade (1), data-halo (260: tamanho da luz da borda, px),
   data-cor-borda (cor da luz da borda; padrão a do card). No card: data-cor. Só anima com o grupo na tela. */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function rgb(c) {
    c = String(c || "").trim();
    if (/^\d+\s*,\s*\d+\s*,\s*\d+$/.test(c)) return c;
    var x = document.createElement("canvas").getContext("2d"); x.fillStyle = c || "#4f5bff"; var f = x.fillStyle;
    if (f[0] === "#") return [1, 3, 5].map(function (i) { return parseInt(f.substr(i, 2), 16); }).join(", ");
    return (f.match(/\d+/g) || [255, 255, 255]).slice(0, 3).join(", ");
  }
  function camada(card, cls) { var d = document.createElement("span"); d.className = "cx-pg-camada " + cls; d.setAttribute("aria-hidden", "true"); card.insertBefore(d, card.firstChild); return d; }
  function preparar(el) {
    el.classList.add("cx-premium-glow-cards");
    var o = el.dataset, vel = parseFloat(o.velocidade); vel = isNaN(vel) ? 1 : vel;
    if (o.halo) el.style.setProperty("--cx-pg-halo", parseFloat(o.halo) + "px");
    if (o.corBorda) el.style.setProperty("--cx-pg-cor-borda", rgb(o.corBorda));
    var cards = [].slice.call(el.querySelectorAll("[data-card]")).map(function (c, i) {
      c.style.setProperty("--cx-pg-cor", rgb(c.dataset.cor || o.cor));
      camada(c, "cx-pg-hover"); camada(c, "cx-pg-brilho");
      var m2 = camada(c, "cx-pg-mancha cx-pg-m2"), m1 = camada(c, "cx-pg-mancha cx-pg-m1");
      camada(c, "cx-pg-base");
      return { el: c, m1: m1, m2: m2, i: i };
    });
    el.addEventListener("pointermove", function (e) {
      cards.forEach(function (c) { var r = c.el.getBoundingClientRect(); c.el.style.setProperty("--cx-pg-x", e.clientX - r.left + "px"); c.el.style.setProperty("--cx-pg-y", e.clientY - r.top + "px"); });
    });
    function quadro(t) {
      t = t * .0003 * vel;
      cards.forEach(function (c) {
        var W = c.el.offsetWidth, H = c.el.offsetHeight, a = c.i * 2.5, b = c.i * 1.8;
        c.m1.style.transform = "translate(" + (W / 2 + Math.sin(t + a) * W * .25 - c.m1.offsetWidth / 2) + "px," + (H / 2 + Math.cos(t * .8 + a) * H * .25 - c.m1.offsetHeight / 2) + "px)";
        c.m2.style.transform = "translate(" + (W / 2 + Math.cos(t * 1.2 + b) * W * .3 - c.m2.offsetWidth / 2) + "px," + (H / 2 + Math.sin(t * .9 + b) * H * .3 - c.m2.offsetHeight / 2) + "px)";
      });
    }
    var visivel = false, rodando = false;
    function laco(t) { if (!visivel || document.hidden) { rodando = false; return; } quadro(t); requestAnimationFrame(laco); }
    quadro(0);
    if (!poucoMovimento) new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; if (visivel && !rodando) { rodando = true; requestAnimationFrame(laco); } }).observe(el);
  }
  function iniciar() { document.querySelectorAll('[data-cx="premium-glow-cards"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
