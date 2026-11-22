/* Mídia Kit · Douglas Mor · interações */
(() => {
  const K = window.KIT, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const toque = matchMedia("(hover: none)").matches;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ---------- WhatsApp e contatos ---------- */
  const whats = `https://wa.me/${K.booking.numero}?text=${encodeURIComponent(K.booking.mensagem)}`;
  $$("[data-whats]").forEach(a => { a.href = whats; a.target = "_blank"; a.rel = "noopener"; });
  $("#btn-presskit").href = K.presskit;
  $("#btn-pdf").addEventListener("click", () => window.print());
  const bEmail = $("#b-email");
  bEmail.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(K.booking.email); $("#b-email-ok").textContent = "✓"; bEmail.querySelector("small").textContent = "Copiado!"; }
    catch { location.href = "mailto:" + K.booking.email; }
    setTimeout(() => { $("#b-email-ok").textContent = "⧉"; bEmail.querySelector("small").textContent = "E-mail · clique para copiar"; }, 2200);
  });

  /* ---------- Intro ---------- */
  const intro = $("#intro");
  window.scrollTo(0, 0);
  setTimeout(() => intro.classList.add("fim"), reduz ? 300 : 2300);
  setTimeout(() => intro.remove(), reduz ? 900 : 3400);

  /* ---------- Menu (topo) ---------- */
  const nav = $("#topo-nav");
  K.cues.forEach(c => { const a = el("a", "", `<i style="--c:${c.cor}"></i><span>${c.nome}</span>`); a.href = c.alvo; a.title = c.nome; nav.append(a); });
  const topo = $("#topo"), flut = $(".whats-flutuante"), deck = $("#deck");
  const secoes = K.cues.map(c => $(c.alvo)).filter(Boolean);
  function atualizaTopo() {
    const fimDeck = deck.offsetTop + deck.offsetHeight - innerHeight * .6;
    const passou = scrollY > fimDeck;
    topo.classList.toggle("escondido", !passou);
    $("#player").classList.toggle("escondido", !passou);
    flut.classList.toggle("escondido", !passou);
    let atual = -1;
    secoes.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .4) atual = i; });
    $$("a", nav).forEach((a, i) => a.classList.toggle("ativo", i === atual));
  }

  /* ---------- Revelar ao rolar ---------- */
  const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); obs.unobserve(e.target); } }), { threshold: .12 });
  function revelar(alvos, passo = .08) { alvos.forEach((a, i) => { a.classList.add("revela"); a.style.setProperty("--atraso", (i * passo) + "s"); obs.observe(a); }); }
  $$(".secao").forEach(s => obs.observe(s));

  /* =========================================================
     DECK · a tela da CDJ
     ========================================================= */
  const ONDA = window.ONDA, B = ONDA.b, N = ONDA.n;
  const segs = []; let acc = 0; K.deck.forEach(d => { segs.push({ ...d, ini: acc }); acc += d.dur; });
  const TOTAL = acc, BIN = TOTAL / N;          // segundos por coluna da waveform
  const cz = $("#onda-zoom"), cg = $("#onda-geral"), xz = cz.getContext("2d"), xg = cg.getContext("2d");
  const jogVid = $("#jog-video"), latE = $(".lateral-esq video"), latD = $(".lateral-dir video");
  const tFaixa = $("#t-faixa"), tInfo = $("#t-info"), tTempo = $("#t-tempo"), tBpm = $("#t-bpm"), tPitch = $("#t-pitch"), tTrack = $("#t-track"), tTom = $("#t-tom");
  const ovPos = $("#ov-pos"), anel = $(".jog-anel"), marca = $("#jog-marca"), fader = $("#pitch-fader"), cdj = $("#cdj"), fundo = $$(".deck-fundo span");
  let tocando = !reduz, base = 0, scratch = 0, ultimoY = scrollY, vel = 0, pitch = 0, segAtual = -1, deckVisivel = true, dpr = 1;

  const cuesBox = $("#cues");
  K.cues.forEach(c => {
    const b = el("button", "cue", `<b>${c.letra}</b><span>${c.nome}</span>`);
    b.type = "button"; b.style.setProperty("--c", c.cor); b.setAttribute("aria-label", `Hot cue ${c.letra}: ${c.nome}`);
    b.addEventListener("click", () => { b.classList.add("aceso"); setTimeout(() => b.classList.remove("aceso"), 500); $(c.alvo).scrollIntoView({ behavior: "smooth" }); });
    cuesBox.append(b);
  });
  addEventListener("keydown", e => {
    if (e.target.closest("input,textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === " " && scrollY < deck.offsetHeight - innerHeight) { e.preventDefault(); alternaPlay(); return; }
    const i = "abcdefgh".indexOf(e.key.toLowerCase());
    if (i >= 0 && scrollY < deck.offsetHeight) $$(".cue")[i]?.click();
  });

  let fit = 1;
  function medir() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const caixa = $("#cdj-caixa"), cab = $(".deck-cab"), H = cdj.offsetHeight;
    const livre = innerHeight - cab.offsetHeight - (innerWidth < 600 ? 110 : 140);
    fit = clamp(livre / H, .55, 1); caixa.style.height = (H * fit) + "px";
    [cz, cg].forEach(c => { const r = c.getBoundingClientRect(); c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); });
    desenhaGeral();
  }
  const tempoScroll = () => scrollY * (60 / Math.max(1, deck.offsetHeight));   // o deck inteiro = 60 s de faixa
  const tempo = () => { let t = base + tempoScroll() + scratch; return ((t % TOTAL) + TOTAL) % TOTAL; };

  function cores(i) { const v = B[((i % N) + N) % N]; return v; }
  function desenhaZoom(t) {
    const W = cz.width, H = cz.height, meio = H / 2, colunas = 220, cw = W / colunas;
    xz.clearRect(0, 0, W, H);
    const pos = t / BIN, ini = pos - colunas / 2, frac = ini - Math.floor(ini);
    // grade de batidas (124 BPM)
    const beat = 60 / (segs[Math.max(segAtual, 0)].bpm || 124) / BIN;
    const b0 = Math.ceil(ini / beat);
    for (let b = b0; b * beat < ini + colunas; b++) {
      const x = (b * beat - ini) * cw, compasso = b % 4 === 0;
      xz.fillStyle = compasso ? "rgba(255,60,80,.55)" : "rgba(255,255,255,.18)";
      xz.fillRect(x, 0, dpr, compasso ? 9 * dpr : 5 * dpr);
      xz.fillRect(x, H - (compasso ? 9 : 5) * dpr, dpr, compasso ? 9 * dpr : 5 * dpr);
    }
    for (let c = -1; c <= colunas + 1; c++) {
      const i = Math.floor(ini) + c, [lo, mi, hi] = cores(i), x = (c - frac) * cw, tocado = (i < pos);
      const hl = lo * meio * .95, hm = mi * mi * meio * .62, hh = hi * hi * meio * .38;
      xz.globalAlpha = tocado ? .55 : 1;
      xz.fillStyle = "#2f6bff"; xz.fillRect(x, meio - hl, cw + .5, hl * 2);
      xz.fillStyle = "#ff9a1f"; xz.fillRect(x, meio - hm, cw + .5, hm * 2);
      xz.fillStyle = "#ffffff"; xz.fillRect(x, meio - hh, cw + .5, hh * 2);
    }
    xz.globalAlpha = 1;
  }
  let geralCache = null;
  function desenhaGeral() {
    const W = cg.width, H = cg.height; if (!W) return;
    xg.clearRect(0, 0, W, H);
    const passo = N / W;
    for (let x = 0; x < W; x++) {
      const [lo, mi, hi] = B[Math.floor(x * passo)], v = Math.max(lo, mi * .9, hi * .7);
      xg.fillStyle = "#3d4658"; xg.fillRect(x, H / 2 - v * H / 2, 1, v * H);
    }
    // marcas dos cortes entre clipes
    segs.forEach((s, i) => { if (!i) return; xg.fillStyle = "#ff9a1f"; xg.fillRect(s.ini / TOTAL * W, 0, 2 * dpr, H); });
    geralCache = xg.getImageData(0, 0, W, H);
  }
  function pintaGeral(t) {
    if (!geralCache) return;
    const W = cg.width, H = cg.height, ate = Math.floor(t / TOTAL * W);
    xg.putImageData(geralCache, 0, 0);
    xg.globalCompositeOperation = "source-atop"; xg.fillStyle = "#5b8cff"; xg.fillRect(0, 0, ate, H); xg.globalCompositeOperation = "source-over";
    ovPos.style.left = (t / TOTAL * 100) + "%";
  }
  function trocaSeg(i) {
    if (i === segAtual) return; segAtual = i;
    const s = segs[i], prox = segs[(i + 1) % segs.length];
    tFaixa.textContent = s.faixa; tInfo.textContent = "Douglas Mor · " + s.info; tTom.textContent = s.clube; tTrack.textContent = String(i + 1).padStart(2, "0");
    jogVid.src = s.video; jogVid.play().catch(() => {});
    latE.src = s.video; latD.src = prox.video; latE.play().catch(() => {}); latD.play().catch(() => {});
    $(".lateral-esq small").textContent = s.faixa.replace("Live @ ", "") + " · " + s.info;
    $(".lateral-dir small").textContent = "Próximo · " + prox.faixa.replace("Live @ ", "");
  }
  const fmt = t => { const m = Math.floor(t / 60), s = Math.floor(t % 60), d = Math.floor((t * 10) % 10); return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}<i>.${d}</i>`; };

  let ultimo = performance.now();
  function quadro(agora) {
    const dt = Math.min(.1, (agora - ultimo) / 1000); ultimo = agora;
    if (tocando) base += dt;
    vel += ((scrollY - ultimoY) - vel) * .2; ultimoY = scrollY;
    pitch += (clamp(vel * .35, -16, 16) - pitch) * .1;
    if (deckVisivel) {
      const t = tempo();
      let i = segs.length - 1; while (i > 0 && t < segs[i].ini) i--; trocaSeg(i);
      desenhaZoom(t); pintaGeral(t);
      tTempo.innerHTML = fmt(t - segs[i].ini);
      const bpm = (segs[i].bpm || 124) * (1 + pitch / 100);
      tBpm.textContent = bpm.toFixed(1);
      tPitch.innerHTML = (pitch >= 0 ? "+" : "") + pitch.toFixed(2) + "<i>%</i>";
      fader.style.top = `calc(50% - 11px + ${clamp(pitch * 6, -100, 100)}px)`;
      const ang = t * 200;
      anel.style.transform = `rotate(${ang}deg)`; marca.style.transform = `rotate(${ang}deg)`;
      // inclinação da CDJ e nome ao fundo
      const p = clamp(scrollY / (deck.offsetHeight - innerHeight), 0, 1);
      cdj.style.setProperty("--inc", (7 * (1 - Math.min(1, p * 2.2))).toFixed(2));
      cdj.style.setProperty("--esc", (fit * (1 - p * .08)).toFixed(3));
      fundo[0].style.setProperty("--d", (-p * 260).toFixed(1)); fundo[1].style.setProperty("--d", (p * 260).toFixed(1));
      $(".deck-dica").style.opacity = p > .08 ? 0 : 1;
    }
    desenhaFaixas(agora); atualizaPlayer(agora);
    requestAnimationFrame(quadro);
  }
  function alternaPlay() { tocando = !tocando; $("#btn-play").classList.toggle("tocando", tocando); tocando ? jogVid.play().catch(() => {}) : jogVid.pause(); }
  $("#btn-play").addEventListener("click", alternaPlay);
  $("#btn-cue").addEventListener("click", () => { const t = tempo(), s = segs[segAtual]; scratch -= (t - s.ini); });
  new IntersectionObserver(es => es.forEach(e => { deckVisivel = e.isIntersecting; })).observe(deck);

  // overview: clicar pula para o ponto
  $("#overview").addEventListener("click", e => { const r = e.currentTarget.getBoundingClientRect(); scratch += ((e.clientX - r.left) / r.width) * TOTAL - tempo(); });
  // arrastar a waveform (como tocar no display)
  arrasta($(".tela-onda"), (dx) => { scratch -= dx / ($(".tela-onda").clientWidth * dpr / 220) * BIN; });
  // jog: scratch circular
  (() => {
    const jog = $("#jog"); let ang0 = null, era = tocando;
    const ang = e => { const r = jog.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    jog.addEventListener("pointerdown", e => { ang0 = ang(e); era = tocando; tocando = false; jog.setPointerCapture(e.pointerId); });
    jog.addEventListener("pointermove", e => { if (ang0 == null) return; let a = ang(e), d = a - ang0; if (d > 180) d -= 360; if (d < -180) d += 360; scratch += d / 200; ang0 = a; });
    const solta = () => { if (ang0 == null) return; ang0 = null; tocando = era; };
    jog.addEventListener("pointerup", solta); jog.addEventListener("pointercancel", solta);
  })();
  function arrasta(alvo, mover) {
    let x0 = null;
    alvo.addEventListener("pointerdown", e => { x0 = e.clientX; alvo.setPointerCapture(e.pointerId); });
    alvo.addEventListener("pointermove", e => { if (x0 == null) return; mover((e.clientX - x0) * dpr, e); x0 = e.clientX; });
    const fim = () => x0 = null; alvo.addEventListener("pointerup", fim); alvo.addEventListener("pointercancel", fim);
  }

  /* =========================================================
     BIO · pilha de fotos
     ========================================================= */
  const pilha = $("#bio-pilha"), fotos = K.fotosBio.map((src, i) => { const im = el("img"); im.src = src; im.alt = `Douglas Mor, ensaio de divulgação ${i + 1}`; im.loading = "lazy"; im.draggable = false; pilha.append(im); return im; });
  let frente = 0; $("#bio-total").textContent = String(fotos.length).padStart(2, "0");
  function arruma(dx = 0) {
    fotos.forEach((im, i) => {
      const k = (i - frente + fotos.length) % fotos.length;
      im.style.zIndex = fotos.length - k;
      im.style.opacity = k > 3 ? 0 : 1;
      im.style.filter = k ? `saturate(.6) brightness(${1 - k * .05})` : "none";
      im.style.transform = k === 0
        ? `translateX(${dx}px) rotate(${dx / 18}deg)`
        : `translate(${k * 16}px, ${-k * 12}px) rotate(${k * 3.2}deg) scale(${1 - k * .045})`;
      im.style.transition = (k === 0 && dx) ? "none" : "";
    });
    $("#bio-num").textContent = String(frente + 1).padStart(2, "0");
  }
  function proxima(dir = 1) { frente = (frente + dir + fotos.length) % fotos.length; arruma(); }
  arruma();
  (() => {
    let x0 = null, dx = 0, moveu = false;
    pilha.addEventListener("pointerdown", e => { x0 = e.clientX; dx = 0; moveu = false; pilha.setPointerCapture(e.pointerId); });
    pilha.addEventListener("pointermove", e => { if (x0 == null) return; dx = e.clientX - x0; if (Math.abs(dx) > 5) moveu = true; arruma(dx); });
    pilha.addEventListener("pointerup", () => { if (x0 == null) return; x0 = null; if (!moveu) proxima(1); else if (Math.abs(dx) > 70) proxima(dx < 0 ? 1 : -1); else arruma(); });
  })();
  let bioVisivel = false; new IntersectionObserver(es => bioVisivel = es[0].isIntersecting).observe(pilha);
  setInterval(() => { if (bioVisivel && !reduz) proxima(1); }, 4200);
  // tags que "pulsam" como medidor
  const tags = $$("#bio-tags li");
  setInterval(() => tags.forEach(li => li.style.setProperty("--n", (20 + Math.random() * 80) + "%")), 260);
  revelar($$(".bio-texto > *"), .07);

  /* ---------- Trajetória ---------- */
  const lt = $("#linha-tempo");
  K.trajetoria.forEach(m => lt.append(el("li", "marco", `<span class="marco-quando">${m.quando}</span><i class="marco-ponto"></i><h3>${m.titulo}</h3><p>${m.texto}</p>`)));
  const marcos = $$(".marco", lt);
  revelar(marcos, .1); revelar($$("#trajetoria .cab > *"));
  function atualizaTrajetoria() {
    const r = lt.getBoundingClientRect(), p = clamp((innerHeight * .75 - r.top) / (r.height + innerHeight * .2), 0, 1);
    lt.style.setProperty("--p", p.toFixed(3));
    marcos.forEach((m, i) => m.classList.toggle("aceso", p >= i / (marcos.length - 1) - .02));
  }

  /* ---------- Palcos · tracklist ---------- */
  const tl = $("#tracklist"), pf = $("#palco-foto");
  K.palcos.forEach((p, i) => {
    const f = el("div", "faixa", `
      <span class="faixa-n">${String(i + 1).padStart(2, "0")}</span>
      <span class="faixa-com"><small>${p.com ? "Line-up com" : "Casa"}</small>${p.com || p.casa}</span>
      <span class="faixa-casa">${p.com ? p.casa : ""}${p.nota ? `<span class="faixa-nota">${p.nota}</span>` : ""}</span>
      <span class="faixa-papel">${p.papel}</span>
      <span class="faixa-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`);
    f.setAttribute("role", "listitem");
    if (p.foto) {
      f.addEventListener("pointerenter", () => { pf.src = p.foto; pf.style.setProperty("--rot", (Math.random() * 8 - 4) + "deg"); pf.classList.add("on"); });
      f.addEventListener("pointerleave", () => pf.classList.remove("on"));
    }
    tl.append(f);
  });
  addEventListener("pointermove", e => { pf.style.left = e.clientX + 30 + "px"; pf.style.top = e.clientY + "px"; }, { passive: true });
  revelar($$(".faixa", tl), .06); revelar($$("#palcos .cab > *"));
  const nomes = K.letreiro.map(n => `<span>${n}</span><b>✦</b>`).join("");
  $("#letreiro").innerHTML = nomes + nomes;

  /* ---------- Sets (SoundCloud) ---------- */
  const sg = $("#sets-grade"); let scApi = null, widgets = [];
  const icPlay = '<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>', icPause = '<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  function carregaApi() { return scApi || (scApi = new Promise(ok => { const s = el("script"); s.src = "https://w.soundcloud.com/player/api.js"; s.onload = () => ok(window.SC); s.onerror = () => ok(null); document.head.append(s); })); }
  function semente(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
  K.sets.forEach(s => {
    const c = el("article", "set", `
      <div class="set-capa"><img src="${s.capa}" alt="Capa do set ${s.titulo}" loading="lazy"><button class="set-play" type="button" aria-label="Tocar ${s.titulo}">${icPlay}</button></div>
      <div class="set-info">
        <div class="set-meta"><span>${s.data}</span><b>${s.duracao}</b></div>
        <h3 class="set-titulo">${s.titulo}</h3>
        <canvas class="set-onda" aria-hidden="true"></canvas>
        <a class="set-link" href="${s.url}" target="_blank" rel="noopener">Abrir no SoundCloud ↗</a>
      </div>
      <div class="set-sc"></div>`);
    sg.append(c);
    const cv = $(".set-onda", c), rnd = semente(s.titulo), barras = Array.from({ length: 90 }, (_, i) => .25 + .75 * Math.abs(Math.sin(i * .37 + rnd() * 2)) * (.55 + rnd() * .45));
    let prog = 0, w = null, dur = 0;
    const pinta = () => {
      const d = Math.min(devicePixelRatio || 1, 2), W = cv.width = cv.clientWidth * d, H = cv.height = cv.clientHeight * d, bw = W / barras.length;
      const x = cv.getContext("2d"); x.clearRect(0, 0, W, H);
      barras.forEach((v, i) => { x.fillStyle = (i / barras.length) < prog ? "#2d50a0" : "#c8d2e2"; const h = v * H * .9; x.fillRect(i * bw + 1, H - h, Math.max(1, bw - 2 * d), h); });
    };
    requestAnimationFrame(pinta); addEventListener("resize", pinta);
    const btn = $(".set-play", c);
    async function abre() {
      if (w) { w.toggle(); return; }
      c.classList.add("aberto");
      const ifr = el("iframe"); ifr.allow = "autoplay"; ifr.title = "Player SoundCloud: " + s.titulo;
      ifr.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(s.url)}&color=%235b7fc4&auto_play=true&visual=false&show_comments=false&hide_related=true&show_teaser=false&show_reposts=false`;
      $(".set-sc", c).append(ifr);
      const SC = await carregaApi(); if (!SC) return;
      w = SC.Widget(ifr); widgets.push(w);
      const marca = () => { widgets.forEach(o => o !== w && o.pause()); c.classList.add("tocando"); btn.innerHTML = icPause; w.getDuration(d => dur = d); };
      w.bind(SC.Widget.Events.READY, () => { w.getDuration(d => dur = d); w.isPaused(p => { if (!p) marca(); }); });
      w.bind(SC.Widget.Events.PLAY, marca);
      w.bind(SC.Widget.Events.PAUSE, () => { c.classList.remove("tocando"); btn.innerHTML = icPlay; });
      w.bind(SC.Widget.Events.FINISH, () => { c.classList.remove("tocando"); btn.innerHTML = icPlay; });
      w.bind(SC.Widget.Events.PLAY_PROGRESS, e => { if (!c.classList.contains("tocando")) marca(); prog = e.relativePosition; pinta(); });
    }
    btn.addEventListener("click", abre);
    cv.addEventListener("click", e => {
      const r = cv.getBoundingClientRect(), p = (e.clientX - r.left) / r.width;
      if (!w) { abre(); return; }
      if (dur) { w.seekTo(dur * p); prog = p; pinta(); w.play(); }
    });
    if (!toque) {
      c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(); c.style.setProperty("--rx", ((e.clientX - r.left) / r.width - .5) * 6 + "deg"); c.style.setProperty("--ry", -((e.clientY - r.top) / r.height - .5) * 6 + "deg"); });
      c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    }
  });
  revelar($$(".set", sg), .1); revelar($$("#sets .cab > *"));

  /* ---------- Na pista (vídeos) ---------- */
  const vb = $("#videos"), cinema = $("#cinema"), cv2 = $("#cinema-video");
  K.videos.forEach(v => {
    const card = el("button", "video", `
      <img src="${v.poster}" alt="" loading="lazy">
      <video muted loop playsinline preload="none" src="${v.previa}"></video>
      <span class="video-rot"><span><b>${v.titulo}</b><small>${v.data}</small></span><span class="video-som"><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg></span></span>`);
    card.type = "button"; card.setAttribute("aria-label", `Assistir ${v.titulo} ${v.data} com som`);
    const pv = $("video", card);
    card.addEventListener("pointerenter", () => pv.play().catch(() => {}));
    card.addEventListener("pointerleave", () => pv.pause());
    card.addEventListener("click", () => { cv2.src = v.src; cv2.poster = v.poster; cinema.hidden = false; document.body.classList.add("travado"); cv2.play().catch(() => {}); });
    vb.append(card);
  });
  const fechaCinema = () => { cv2.pause(); cv2.removeAttribute("src"); cv2.load(); cinema.hidden = true; document.body.classList.remove("travado"); };
  $("#cinema-fechar").addEventListener("click", fechaCinema);
  cinema.addEventListener("click", e => { if (e.target === cinema) fechaCinema(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !cinema.hidden) fechaCinema(); });
  if (toque) {
    const io = new IntersectionObserver(es => es.forEach(e => { const v = $("video", e.target); e.target.classList.toggle("passando", e.isIntersecting); e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }), { threshold: .7 });
    $$(".video", vb).forEach(c => io.observe(c));
  }
  revelar($$(".video", vb), .1); revelar($$("#pista .cab > *"));
  const tira = [...K.fotosPista, ...K.fotosPista].map(f => `<img src="${f}" alt="" loading="lazy">`).join("");
  $("#tira").innerHTML = tira;

  /* ---------- Redes ---------- */
  const ICONES = {
    ig: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/></svg>',
    sc: '<svg viewBox="0 0 24 24"><path d="M1.2 14.4c0 .9.4 1.6.8 1.6s.6-.7.6-1.6-.3-1.6-.6-1.6-.8.7-.8 1.6zm2.1 2c.3 0 .5-.8.5-2.3s-.2-2.5-.5-2.5-.6 1-.6 2.5.3 2.3.6 2.3zm1.8.3c.3 0 .5-1 .5-2.6s-.2-3.1-.5-3.1-.6 1.5-.6 3.1.3 2.6.6 2.6zm1.8 0c.3 0 .5-1.1.5-2.7l-.5-4.4c-.3 0-.6 2.7-.6 4.4 0 1.6.3 2.7.6 2.7zm1.9 0c.3 0 .6-1.1.6-2.7l-.6-5.4c-.4 0-.7 3.6-.7 5.4 0 1.6.3 2.7.7 2.7zm1.9 0h9.4a3.7 3.7 0 0 0 0-7.4c-.5 0-1 .1-1.4.3A5.6 5.6 0 0 0 11.6 5c-.5 0-.9.1-.9.6v10.7c0 .3.2.4.5.4z"/></svg>',
    sp: '<svg viewBox="0 0 24 24"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.4-2.1-10.6-1.2a.75.75 0 1 1-.3-1.5c4.6-1 8.6-.6 11.7 1.3.4.3.5.7.2 1.1zm1.5-3.3a.94.94 0 0 1-1.3.3c-3.2-2-8.2-2.6-12-1.4a.94.94 0 1 1-.6-1.8c4.4-1.3 9.8-.7 13.5 1.6.5.3.6.9.4 1.3zm.1-3.4C15.3 8.3 8.9 8.1 5.2 9.2a1.1 1.1 0 1 1-.7-2.2c4.2-1.3 11.3-1 15.7 1.6a1.1 1.1 0 0 1-1.1 2z"/></svg>'
  };
  const rl = $("#redes-lista");
  K.redes.forEach(r => {
    const a = el("a", "rede", `<span class="rede-icone">${ICONES[r.icone] || ""}</span><span><span class="rede-nome">${r.nome}</span><span class="rede-user">${r.user}<span class="rede-seta" aria-hidden="true">↗</span></span></span>`);
    a.href = r.url; a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("pointerenter", e => { const b = a.getBoundingClientRect(); a.style.setProperty("--mx", e.clientX - b.left + "px"); a.style.setProperty("--my", e.clientY - b.top + "px"); });
    a.addEventListener("pointerleave", e => { const b = a.getBoundingClientRect(); a.style.setProperty("--mx", e.clientX - b.left + "px"); a.style.setProperty("--my", e.clientY - b.top + "px"); });
    rl.append(a);
  });
  revelar($$(".rede", rl), .1); revelar($$("#redes .cab > *"));

  /* ---------- Presskit · leque ---------- */
  const lq = $("#leque"), n = K.fotosPresskit.length;
  K.fotosPresskit.forEach((f, i) => {
    const im = el("img"); im.src = f; im.alt = ""; im.loading = "lazy";
    const k = i - (n - 1) / 2;
    im.style.setProperty("--r0", (k * 2) + "deg"); im.style.setProperty("--x0", (k * 6) + "%");
    im.style.setProperty("--r1", (k * 9) + "deg"); im.style.setProperty("--x1", (k * 28) + "%");
    im.style.zIndex = 5 - Math.abs(Math.round(k));
    lq.append(im);
  });
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setTimeout(() => lq.classList.add("aberto"), 300); }), { threshold: .4 }).observe(lq);
  revelar($$(".presskit-texto > *"), .08);

  /* ---------- Booking ---------- */
  const bt = $(".booking-tela");
  bt.addEventListener("pointermove", e => { const r = bt.getBoundingClientRect(); bt.style.setProperty("--mx", e.clientX - r.left + "px"); bt.style.setProperty("--my", e.clientY - r.top + "px"); });
  revelar($$(".booking-tela > *"), .1);
  revelar($$(".capa-grade > *"), .12);

  /* =========================================================
     A FAIXA QUE ACOMPANHA A NAVEGAÇÃO
     ========================================================= */
  const listaSec = $$(".secao"), nSec = listaSec.length;
  const nomeSec = sec => ($(".rotulo", sec)?.textContent || "").trim();
  const cueDe = id => K.cues.find(c => c.alvo === "#" + id);
  // 1. faixa de waveform no topo de cada seção (corre de lado com a rolagem)
  const faixas = listaSec.map((sec, i) => {
    const c = cueDe(sec.id), f = el("div", "onda-faixa", `<canvas></canvas><i></i>
      <span class="onda-rot"><b>${c ? c.letra : "▶"}</b>${nomeSec(sec)}</span>
      <span class="onda-folio">DM · ${String(i + 1).padStart(2, "0")} / ${String(nSec).padStart(2, "0")}</span>`);
    f.setAttribute("aria-hidden", "true");
    $(".onda-rot b", f).style.setProperty("--c", c ? c.cor : "#cfd8e5");
    sec.prepend(f);
    const cv = $("canvas", f), item = { sec, cv, x: cv.getContext("2d"), azul: sec.classList.contains("azul"), vis: false, base: i * 260 };
    new IntersectionObserver(es => item.vis = es[0].isIntersecting).observe(f);
    return item;
  });
  function desenhaFaixas(agora) {
    faixas.forEach(f => {
      if (!f.vis) return;
      const W = f.cv.width = Math.round(f.cv.clientWidth * dpr), H = f.cv.height = Math.round(f.cv.clientHeight * dpr);
      const x = f.x, passo = 4 * dpr, colunas = Math.ceil(W / passo) + 1, meio = H / 2;
      const pos = f.base + scrollY * .09 + agora / 1000 * 3.2, ini = Math.floor(pos), frac = pos - ini;
      const cores = f.azul ? ["rgba(255,255,255,.32)", "rgba(255,255,255,.62)", "#ffffff"] : ["#c6d3ea", "#5b7fc4", "#2d50a0"];
      for (let c = 0; c < colunas; c++) {
        const [lo, mi, hi] = B[(ini + c) % N], px = (c - frac) * passo, tocado = px < W / 2;
        x.globalAlpha = tocado ? 1 : .55;
        const w = passo - dpr;
        x.fillStyle = cores[0]; x.fillRect(px, meio - lo * meio, w, lo * H);
        x.fillStyle = cores[1]; x.fillRect(px, meio - mi * mi * meio * .75, w, mi * mi * H * .75);
        x.fillStyle = cores[2]; x.fillRect(px, meio - hi * hi * meio * .4, w, hi * hi * H * .4);
      }
      x.globalAlpha = 1;
    });
  }
  // 2. barra de reprodução fixa: a página inteira é a faixa
  const player = $("#player"), pc = $("#p-canvas"), px = pc.getContext("2d"), pAg = $("#p-agulha"), pCues = $("#p-cues"), pDisco = $(".player-disco");
  const ini0 = () => $("#capa").offsetTop, fim0 = () => document.documentElement.scrollHeight - innerHeight;
  const progresso = () => clamp((scrollY - ini0()) / Math.max(1, fim0() - ini0()), 0, 1);
  const posDe = sec => clamp((sec.offsetTop - ini0()) / Math.max(1, fim0() - ini0()), 0, 1);
  let pBase = null;
  function medirPlayer() {
    const W = pc.width = Math.round(pc.clientWidth * dpr), H = pc.height = Math.round(pc.clientHeight * dpr); if (!W) return;
    const passo = 3 * dpr, n = Math.floor(W / passo);
    px.clearRect(0, 0, W, H);
    for (let i = 0; i < n; i++) {
      const [lo, mi, hi] = B[Math.floor(i / n * N)], v = Math.max(lo, mi * .9, hi * .7);
      px.fillStyle = "#3a4252"; px.fillRect(i * passo, H / 2 - v * H / 2, passo - dpr, v * H);
    }
    pBase = px.getImageData(0, 0, W, H);
    pCues.innerHTML = "";
    K.cues.forEach(c => {
      const sec = $(c.alvo); if (!sec) return;
      const b = el("button", "", c.letra); b.type = "button"; b.title = c.nome; b.style.setProperty("--c", c.cor); b.style.left = (posDe(sec) * 100) + "%";
      b.addEventListener("click", e => { e.stopPropagation(); sec.scrollIntoView({ behavior: "smooth" }); });
      pCues.append(b);
    });
  }
  const mmss = t => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  let pUlt = -1;
  function atualizaPlayer(agora) {
    pDisco.style.transform = `rotate(${(scrollY * .6 + agora * .12) % 360}deg)`;
    if (!pBase) return;
    const p = progresso(); if (Math.abs(p - pUlt) < .0005) return; pUlt = p;
    const W = pc.width, H = pc.height;
    px.putImageData(pBase, 0, 0);
    px.globalCompositeOperation = "source-atop";
    const g = px.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#ffb347"); g.addColorStop(.35, "#5b8cff"); g.addColorStop(.65, "#5b8cff"); g.addColorStop(1, "#ffb347");
    px.fillStyle = g; px.fillRect(0, 0, W * p, H); px.globalCompositeOperation = "source-over";
    pAg.style.left = (p * 100) + "%";
    let atual = 0; listaSec.forEach((sec, i) => { if (sec.getBoundingClientRect().top < innerHeight * .5) atual = i; });
    $("#p-track").textContent = `Track ${String(atual + 1).padStart(2, "0")} / ${String(nSec).padStart(2, "0")}`;
    $("#p-nome").textContent = nomeSec(listaSec[atual]);
    $("#p-tempo").textContent = mmss(p * TOTAL); $("#p-resta").textContent = "-" + mmss((1 - p) * TOTAL);
  }
  $("#p-onda").addEventListener("click", e => {
    const r = e.currentTarget.getBoundingClientRect(), p = clamp((e.clientX - r.left) / r.width, 0, 1);
    scrollTo({ top: ini0() + p * (fim0() - ini0()), behavior: "smooth" });
  });

  /* ---------- Laço principal ---------- */
  let pedido = false;
  addEventListener("scroll", () => { if (pedido) return; pedido = true; requestAnimationFrame(() => { atualizaTopo(); atualizaTrajetoria(); pedido = false; }); }, { passive: true });
  addEventListener("resize", () => { medir(); medirPlayer(); pUlt = -1; });
  medir(); atualizaTopo(); atualizaTrajetoria();
  addEventListener("load", () => { medirPlayer(); pUlt = -1; });
  setTimeout(() => { medirPlayer(); pUlt = -1; }, 1500);
  requestAnimationFrame(quadro);
})();
