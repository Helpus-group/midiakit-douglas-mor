/* Card Stack
   Uso (até 7 cartas):
   <div data-cx="card-stack">
     <div data-carta data-titulo="Lado A"> ...imagem/conteúdo... </div>
     <div data-carta data-titulo="Ao vivo"> ... </div>
     ...
   </div>
   Passe o mouse: o monte abre em leque (em cascata) e a carta sob o mouse sobe.
   Clique numa carta: ela vem girando para o centro, ampliada, e inclina com o mouse.
   Clique fora ou Esc: ela volta para o topo do monte. A última carta do HTML começa no topo.
   Opção: data-auto (segundos): sem o mouse em cima, a carta do topo vai para o fundo sozinha (as fotos vão passando). */
(function () {
  var ARCO = 12, ESC_PASSO = .05, VAO = 5, DESCANSO = .12, CASCATA = 38, IDA = 620, VOLTA = 460;
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function preparar(el) {
    el.classList.add("cx-card-stack");
    el.setAttribute("role", "group"); el.setAttribute("aria-label", "Monte de cartas");
    var cartas = Array.from(el.querySelectorAll(":scope > [data-carta]")).slice(0, 7);
    var N = cartas.length, meio = (N - 1) / 2;
    var aviso = document.createElement("p"); aviso.className = "cx-ck-leitor"; aviso.setAttribute("aria-live", "polite");

    // cada carta vira um botão com a face por dentro (o conteúdo original fica guardado para o clone da vista)
    var conteudo = cartas.map(function (c) { return c.innerHTML; });
    var botoes = cartas.map(function (c, id) {
      var b = document.createElement("button");
      b.type = "button"; b.setAttribute("data-carta", ""); b.dataset.id = id;
      b.innerHTML = '<span class="cx-ck-face">' + conteudo[id] + "</span>";
      c.replaceWith(b); return b;
    });
    el.appendChild(aviso);
    var ordem = botoes.map(function (_, i) { return i; }); // posição t = ordem[t]; o fim do array é o topo
    var aberto = false, ativo = null, vista = null, fechando = false, poses = [];

    function titulo(id) { return cartas[id].dataset.titulo || "Carta " + (id + 1); }
    function layout() {
      ordem.forEach(function (id, t) {
        var b = botoes[id], prof = N - 1 - t, f = aberto ? 1 : 0;
        var rotA = (t - meio) * ARCO, rot = rotA * DESCANSO + (rotA - rotA * DESCANSO) * f;
        var oy = -(prof * VAO) * (1 - f), esc = 1 - prof * ESC_PASSO * (1 - f);
        poses[t] = { rot: rot, esc: esc };
        b.style.setProperty("--rot", rot.toFixed(3) + "deg");
        b.style.setProperty("--oy", oy.toFixed(3) + "cqw");
        b.style.setProperty("--esc", esc.toFixed(4));
        // abre em cascata da frente para trás; fecha de trás para frente
        b.style.setProperty("--atraso", poucoMovimento ? "0ms" : ((aberto ? N - 1 - t : t) * CASCATA) + "ms");
        b.style.zIndex = t + 1;
        b.classList.toggle("is-erguida", aberto && ativo === t && !vista);
        b.setAttribute("aria-label", "Abrir " + titulo(id) + ", carta " + (t + 1) + " de " + N);
        b.tabIndex = vista ? -1 : 0;
      });
      if (!vista) aviso.textContent = titulo(ordem[N - 1]) + " está no topo do monte.";
    }

    function transformDe(t) {
      var face = botoes[ordem[t]].querySelector(".cx-ck-face").getBoundingClientRect(), bd = el.getBoundingClientRect();
      var u = el.clientWidth / 100; // 1cqw em px
      // distância do centro da face até o centro da vista (vista: left 22cqw, top 6cqw, 56×77cqw)
      var dx = face.left + face.width / 2 - bd.left - 50 * u, dy = face.top + face.height / 2 - bd.top - 44.5 * u;
      var p = poses[t] || { rot: 0, esc: 1 };
      return "perspective(2000px) translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px) rotate(" + p.rot.toFixed(2) + "deg) rotateY(0deg) scale(" + (botoes[ordem[t]].offsetWidth / (56 * u) * p.esc).toFixed(4) + ")";
    }
    var NA_VISTA = "perspective(2000px) translate(0px,0px) rotate(0deg) rotateY(360deg) scale(1)";

    function abrir(t) {
      if (vista || fechando) return;
      var id = ordem[t], de = transformDe(t);
      vista = document.createElement("span");
      vista.className = "cx-ck-vista"; vista.tabIndex = -1; vista.setAttribute("role", "img");
      vista.setAttribute("aria-label", titulo(id) + " ampliada. Clique fora ou aperte Esc para devolver.");
      vista.innerHTML = '<span class="cx-ck-incl"><span class="cx-ck-face">' + conteudo[id] + '</span><span class="cx-ck-face cx-ck-verso">' + conteudo[id] + "</span></span>";
      vista.dataset.id = id;
      el.appendChild(vista);
      botoes[id].classList.add("is-escondida");
      vista.animate([{ transform: de }, { transform: NA_VISTA }], { duration: poucoMovimento ? 1 : IDA, easing: "cubic-bezier(.25,.8,.25,1)", fill: "both" });
      vista.focus({ preventScroll: true });
      var incl = vista.querySelector(".cx-ck-incl");
      vista.addEventListener("pointermove", function (e) {
        if (poucoMovimento) return;
        var r = vista.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 2 - 1, y = (e.clientY - r.top) / r.height * 2 - 1;
        incl.style.transform = "rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
      });
      vista.addEventListener("pointerleave", function () { incl.style.transform = ""; });
      aviso.textContent = titulo(id) + " ampliada. Aperte Esc ou clique fora para devolver.";
      layout();
    }
    function fechar() {
      if (!vista || fechando) return;
      fechando = true;
      var id = +vista.dataset.id, alvo = transformDe(N - 1);
      var fim = function () {
        ordem = ordem.filter(function (x) { return x !== id; }).concat(id); // vai para o topo
        botoes[id].classList.remove("is-escondida");
        vista.remove(); vista = null; fechando = false; ativo = null;
        layout(); botoes[id].focus({ preventScroll: true });
      };
      var feito = false, uma = function () { if (!feito) { feito = true; fim(); } };
      if (poucoMovimento) { uma(); return; }
      var a = vista.animate([{ transform: NA_VISTA }, { transform: alvo }], { duration: VOLTA, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
      a.onfinish = uma;
      setTimeout(uma, VOLTA + 120); // segurança: aba em segundo plano pode não disparar onfinish
    }

    el.addEventListener("pointerover", function (e) {
      if (!aberto) { aberto = true; layout(); }
      var b = e.target.closest("[data-carta]");
      var t = b ? ordem.indexOf(+b.dataset.id) : null;
      if (t !== ativo) { ativo = t; layout(); }
    });
    el.addEventListener("pointerout", function (e) {
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      if (!vista) { aberto = false; ativo = null; layout(); }
    });
    el.addEventListener("pointerdown", function (e) {
      var b = e.target.closest("[data-carta]");
      if (b && e.button === 0 && !vista) { aberto = true; abrir(ordem.indexOf(+b.dataset.id)); }
    });
    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-carta]");
      if (b && e.detail === 0 && !vista) { aberto = true; abrir(ordem.indexOf(+b.dataset.id)); } // teclado
    });
    document.addEventListener("pointerdown", function (e) { if (vista && !vista.contains(e.target)) fechar(); }, true);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fechar(); });

    var AUTO = parseFloat(el.dataset.auto) || 0;
    if (AUTO && !poucoMovimento && N > 1) setInterval(function () {
      if (aberto || vista || fechando || document.hidden) return;
      var r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      ordem = [ordem[N - 1]].concat(ordem.slice(0, N - 1)); // o topo vai para o fundo
      layout();
    }, AUTO * 1000);

    layout();
  }

  function iniciar() { document.querySelectorAll('[data-cx="card-stack"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
