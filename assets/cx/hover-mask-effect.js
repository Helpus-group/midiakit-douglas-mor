/* Hover Mask Effect
   Uso (dentro de uma seção com position relative): <div data-cx="hover-mask-effect" data-imagem="assets/img/foto.webp"></div>
   A foto aparece desbotada (clara, cinza e desfocada); o cursor "pinta" a versão nítida e colorida por onde passa,
   e a pintura some devagar. No toque, revela onde o dedo passa.
   Opções: data-pincel (180 px), data-sumir (0.012: velocidade com que a revelação some; 0 = fica),
           data-desbotado (0.75: quão clara a foto fica), data-forca (0.9: tinta por passada; menor = rastro mais difuso), data-veu (cor do véu; padrão #fff; aceita var(--token)),
           data-auto ("x,y" em 0–1: um pincel passeia sozinho em volta desse ponto quando o mouse não está na área),
           data-auto-raio (0.16: tamanho do passeio, fração da largura), data-foco ("x,y" em 0–1: ponto da foto que fica
           sempre no quadro quando ela é cortada; padrão centro), data-alt (descrição). */
(function () {
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function par(s, p) { if (!s) return p; var v = s.split(",").map(parseFloat); return v.length === 2 && !isNaN(v[0]) && !isNaN(v[1]) ? v : p; }
  function preparar(el) {
    var area = el.parentElement; if (getComputedStyle(area).position === "static") area.style.position = "relative";
    el.classList.add("cx-hover-mask-effect");
    var o = el.dataset, n = function (k, p) { var v = parseFloat(o[k]); return isNaN(v) ? p : v; };
    var PIN = n("pincel", 180), SUMIR = n("sumir", .012), DESB = n("desbotado", .75), FORCA = n("forca", .9);
    var AUTO = par(o.auto, null), AUTO_R = n("autoRaio", .16), FOCO = par(o.foco, [.5, .5]);
    var veu = o.veu || "#fff";
    if (veu.indexOf("var(") === 0) veu = getComputedStyle(el).getPropertyValue(veu.slice(4, -1).trim()).trim() || "#fff";
    if (o.alt) { el.setAttribute("role", "img"); el.setAttribute("aria-label", o.alt); } else el.setAttribute("aria-hidden", "true");
    var tela = document.createElement("canvas"), ctx = tela.getContext("2d"); el.appendChild(tela);
    var masc = document.createElement("canvas"), mctx = masc.getContext("2d");
    var nit = document.createElement("canvas"), nctx = nit.getContext("2d");
    var fundo = document.createElement("canvas"), fctx = fundo.getContext("2d");
    var tmp = document.createElement("canvas"), tctx = tmp.getContext("2d");
    var img = new Image(); img.crossOrigin = "anonymous"; img.src = o.imagem || "";
    var w = 0, h = 0, d = 1, pontos = [], rodando = false, visivel = false, ultimo = null, dentro = false, t0 = performance.now();
    function capa(c, cw, ch) {
      var e = Math.max(cw / img.naturalWidth, ch / img.naturalHeight), iw = img.naturalWidth * e, ih = img.naturalHeight * e;
      var x = Math.min(0, Math.max(cw - iw, cw / 2 - FOCO[0] * iw)), y = Math.min(0, Math.max(ch - ih, ch / 2 - FOCO[1] * ih));
      c.drawImage(img, x, y, iw, ih);
    }
    function medir() {
      if (!img.naturalWidth) return;
      d = Math.min(devicePixelRatio || 1, 2);
      w = Math.round(el.clientWidth * d); h = Math.round(el.clientHeight * d);
      [tela, masc, nit, fundo, tmp].forEach(function (c) { c.width = w; c.height = h; });
      nctx.clearRect(0, 0, w, h); capa(nctx, w, h);
      // base desbotada fica pronta uma vez só (o desfoque é caro para refazer a cada quadro)
      fctx.filter = "grayscale(1) blur(" + 3 * d + "px)"; capa(fctx, w, h); fctx.filter = "none";
      fctx.globalAlpha = DESB; fctx.fillStyle = veu; fctx.fillRect(0, 0, w, h); fctx.globalAlpha = 1;
      desenhar();
    }
    function pincel(x, y, forca) {
      var r = PIN * d / 2, g = mctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(0,0,0," + forca + ")"); g.addColorStop(.3, "rgba(0,0,0," + forca * .7 + ")"); g.addColorStop(.65, "rgba(0,0,0," + forca * .25 + ")"); g.addColorStop(1, "rgba(0,0,0,0)");
      mctx.fillStyle = g; mctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    function desenhar() {
      if (!w) return;
      ctx.drawImage(fundo, 0, 0);
      if (SUMIR > 0) { mctx.globalCompositeOperation = "destination-out"; mctx.fillStyle = "rgba(0,0,0," + SUMIR + ")"; mctx.fillRect(0, 0, w, h); }
      mctx.globalCompositeOperation = "source-over";
      pontos.forEach(function (p) { pincel(p[0] * d, p[1] * d, FORCA); });
      pontos = [];
      // passeio automático: uma curva lenta em volta do ponto de interesse
      if (AUTO && !dentro && !poucoMovimento) {
        var t = (performance.now() - t0) / 1000, R = AUTO_R * w;
        pincel(AUTO[0] * w + Math.sin(t * .53) * R, AUTO[1] * h + Math.sin(t * .71 + 1.3) * R * .55, .0035);
      }
      tctx.clearRect(0, 0, w, h);
      tctx.drawImage(nit, 0, 0); tctx.globalCompositeOperation = "destination-in"; tctx.drawImage(masc, 0, 0); tctx.globalCompositeOperation = "source-over";
      ctx.drawImage(tmp, 0, 0);
    }
    function laco() { if (!visivel || document.hidden) { rodando = false; return; } desenhar(); requestAnimationFrame(laco); }
    function ligar() { if (!rodando && visivel && !poucoMovimento) { rodando = true; requestAnimationFrame(laco); } }
    area.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      dentro = true;
      // preenche o caminho entre dois movimentos para o traço ficar contínuo
      if (ultimo) { var dd = Math.hypot(x - ultimo[0], y - ultimo[1]), passos = Math.ceil(dd / (PIN / 6)); for (var i = 1; i <= passos; i++) pontos.push([ultimo[0] + (x - ultimo[0]) * i / passos, ultimo[1] + (y - ultimo[1]) * i / passos]); }
      else pontos.push([x, y]);
      ultimo = [x, y]; ligar();
    });
    area.addEventListener("pointerleave", function () { ultimo = null; dentro = false; });
    area.addEventListener("pointerup", function (e) { if (e.pointerType !== "mouse") { ultimo = null; dentro = false; } });
    img.onload = function () {
      medir();
      if (poucoMovimento) {
        if (AUTO) { pincel(AUTO[0] * w, AUTO[1] * h, 1); mctx.globalCompositeOperation = "source-over"; }
        else { mctx.fillStyle = "#000"; mctx.fillRect(0, 0, w, h); }
        desenhar();
      }
      new ResizeObserver(medir).observe(el);
      new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; ligar(); }).observe(el);
    };
  }
  function iniciar() { document.querySelectorAll('[data-cx="hover-mask-effect"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
