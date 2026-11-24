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

  /* ---------- Bio: copiar o texto ---------- */
  const bioCopiar = $("#bio-copiar");
  bioCopiar.addEventListener("click", async () => {
    const texto = $$(".bio-texto > p:not(.rotulo)").map(p => p.textContent.trim().replace(/\s+/g, " ")).join("\n\n");
    const rot = $("span", bioCopiar);
    try { await navigator.clipboard.writeText(texto); rot.textContent = "Bio copiada"; }
    catch { const t = el("textarea"); t.value = texto; document.body.append(t); t.select(); document.execCommand("copy"); t.remove(); rot.textContent = "Bio copiada"; }
    bioCopiar.classList.add("ok"); setTimeout(() => { rot.textContent = "Copiar bio"; bioCopiar.classList.remove("ok"); }, 2200);
  });

  /* ---------- Intro ---------- */
  const intro = $("#intro");
  window.scrollTo(0, 0);
  setTimeout(() => intro.classList.add("fim"), reduz ? 300 : 2300);
  setTimeout(() => intro.remove(), reduz ? 900 : 3400);

  /* ---------- Menu (topo) ---------- */
  const nav = $("#topo-nav");
  K.menu.forEach(c => { const a = el("a", "", `<span>${c.nome}</span>`); a.href = c.alvo; nav.append(a); });
  const topo = $("#topo"), flut = $(".whats-flutuante"), deck = $("#deck");
  const secoes = K.menu.map(c => $(c.alvo)).filter(Boolean);
  function atualizaTopo() {
    const passou = scrollY > deck.offsetHeight * .7;
    topo.classList.toggle("escondido", !passou);
    flut.classList.toggle("escondido", !passou);
    let atual = -1;
    secoes.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .4) atual = i; });
    $$("a", nav).forEach((a, i) => a.classList.toggle("ativo", i === atual));
  }

  /* ---------- Revelar ao rolar ---------- */
  const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); obs.unobserve(e.target); } }), { threshold: .12 });
  function revelar(alvos, passo = .08) { alvos.forEach((a, i) => { a.classList.add("revela"); a.style.setProperty("--atraso", (i * passo) + "s"); obs.observe(a); }); }
  $$(".secao").forEach(s => obs.observe(s));

  /* ---------- Hero: a foto afunda e o nome sobe na rolagem ---------- */
  const heroFoto = $(".hero-foto"), heroConteudo = $(".hero-conteudo");
  function atualizaHero() {
    if (reduz) return;
    const p = clamp(scrollY / deck.offsetHeight, 0, 1);
    heroFoto.style.transform = `translateY(${p * 18}%) scale(${1 + p * .06})`;
    heroConteudo.style.transform = `translateY(${-p * 60}px)`;
    heroConteudo.style.opacity = 1 - p * 1.3;
  }

  /* =========================================================
     BIO · galeria de fotos
     ========================================================= */
  /* Spotlight Hover Gallery (biblioteca): colagem numerada; o cursor destaca, o clique leva ao centro */
  const gal = $("#bio-galeria");
  Object.assign(gal.dataset, { cx: "spotlight-hover-gallery", auto: "4", proporcao: "1" });
  K.fotosBio.forEach((src, i) => { const im = el("img"); im.src = src; im.alt = `Douglas Mor, foto ${i + 1}`; im.loading = "lazy"; gal.append(im); });
  revelar($$(".bio-texto > *"), .07);

  /* ---------- Marcos da carreira · Accordion Tab Switch (biblioteca) ---------- */
  const ta = $("#traj-acordeao");
  Object.assign(ta.dataset, { cx: "accordion-tab-switch", altura: "min(640px, 80vh)", rotulo: "Cinco marcos" });
  K.marcos.forEach(m => {
    const it = el("div", "", `<h3>${m.titulo}</h3><p>${m.texto}</p>`);
    it.dataset.item = ""; it.dataset.imagem = m.foto; it.dataset.alt = `Douglas Mor · ${m.titulo}`;
    ta.append(it);
  });
  revelar([ta]); revelar($$("#trajetoria .cab > *"));

  /* ---------- Palcos · Synced Accordion (biblioteca) ---------- */
  const pa = $("#palcos-acordeao");
  Object.assign(pa.dataset, { cx: "synced-accordion", grupo: "palcos", altura: "540", dobrado: "92", gap: "12", raio: "18", rotulo: "Palco" });
  K.palcos.forEach(p => {
    const it = el("div", "", `<h3>${p.casa}</h3><p>${p.texto}</p>`);
    it.dataset.item = ""; it.dataset.tag = p.papel;
    if (p.foto) { it.dataset.imagem = p.foto; it.dataset.alt = `Douglas Mor · ${p.casa}`; }
    pa.append(it);
  });
  revelar([pa]); revelar($$("#palcos .cab > *"));
  const nomes = K.letreiro.map(n => `<span>${n}</span><b>/</b>`).join("");
  $("#letreiro").innerHTML = nomes + nomes;

  const cinema = $("#cinema"), cv2 = $("#cinema-video");
  /* ---------- Ao vivo no YouTube · Expand Image Cards (biblioteca) ---------- */
  const av = $("#aovivo-acordeao");
  Object.assign(av.dataset, { cx: "expand-image-cards", altura: "560", gap: "14", raio: "18", cresce: "3.2", tinta: "0.35" });
  K.aoVivo.forEach((v, i) => {
    const it = el("div", "", `<h3>${v.titulo}</h3><p>${v.estilo}</p><a data-cta href="https://youtu.be/${v.id}">Assistir</a>`);
    Object.assign(it.dataset, { item: "", imagem: v.capa, alt: `Douglas Mor · ${v.titulo}`, tag: `Set ${String(i + 1).padStart(2, "0")} · YouTube` });
    av.append(it);
  });
  const tocaYT = (card, id) => {
    if ($("iframe", card)) return;
    card.classList.add("tocando-yt");
    const f = el("iframe", "yt-quadro"); f.title = "Set ao vivo no YouTube";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"; f.allowFullscreen = true;
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    card.append(f);
  };
  av.addEventListener("click", e => {
    const card = e.target.closest(".cx-eic-card"); if (!card) return;
    const i = $$(".cx-eic-card", av).indexOf(card), play = e.target.closest(".yt-play, .cx-eic-cta");
    if (play && card.classList.contains("is-aberto")) { e.preventDefault(); e.stopPropagation(); tocaYT(card, K.aoVivo[i].id); }
    // ao trocar de card, para o vídeo do outro
    setTimeout(() => $$(".cx-eic-card", av).forEach(c => { if (!c.classList.contains("is-aberto")) { $("iframe", c)?.remove(); c.classList.remove("tocando-yt"); } }), 0);
  }, true);
  revelar([av]); revelar($$("#aovivo .cab > *"));

  /* ---------- Ouça · Showcase Accordion (biblioteca) ---------- */
  const sa = $("#sets-acordeao");
  Object.assign(sa.dataset, { cx: "showcase-accordion", altura: "500" });
  K.sets.forEach(s => {
    const botao = s.tipo === "perfil" ? s.botao : "Ouvir aqui";
    const it = el("div", "", `<h3>${s.titulo}</h3><p>${s.texto}</p><a data-cta href="${s.url}">${botao}</a>`);
    Object.assign(it.dataset, { item: "", imagem: s.capa, alt: s.titulo, subtitulo: s.sub });
    sa.append(it);
  });
  const somBox = $("#cinema-som");
  sa.addEventListener("click", e => {
    const a = e.target.closest(".cx-sa-aberto a"); if (!a) return;
    const i = $$(".cx-sa-item", sa).indexOf(a.closest(".cx-sa-item")), s = K.sets[i];
    e.preventDefault();
    if (s.tipo === "perfil") { open(s.url, "_blank", "noopener"); return; }
    somBox.innerHTML = `<p>${s.sub || s.titulo}</p><iframe title="Player SoundCloud: ${s.sub || s.titulo}" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(s.url)}&color=%233340e6&auto_play=true&visual=true&show_comments=false&hide_related=true&show_teaser=false&show_reposts=false"></iframe>`;
    somBox.hidden = false; cv2.hidden = true; cinema.hidden = false; document.body.classList.add("travado");
  });
  revelar([sa]); revelar($$("#sets .cab > *"));

  /* ---------- Na pista (vídeos) ---------- */
  const vb = $("#videos");
  K.videos.forEach(v => {
    const card = el("button", "video", `
      <img src="${v.poster}" alt="" loading="lazy">
      <video muted loop playsinline preload="none" src="${v.previa}"></video>
      <span class="video-rot"><span><b>${v.titulo}</b><small>${v.data}</small></span><span class="video-som"><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg></span></span>`);
    card.type = "button"; card.setAttribute("aria-label", `Assistir ${v.titulo} ${v.data} com som`);
    const pv = $("video", card);
    card.addEventListener("pointerenter", () => pv.play().catch(() => {}));
    card.addEventListener("pointerleave", () => pv.pause());
    card.addEventListener("click", () => { somBox.hidden = true; cv2.hidden = false; cv2.src = v.src; cv2.poster = v.poster; cinema.hidden = false; document.body.classList.add("travado"); cv2.play().catch(() => {}); });
    vb.append(card);
  });
  const fechaCinema = () => { cv2.pause(); cv2.removeAttribute("src"); cv2.load(); somBox.innerHTML = ""; somBox.hidden = true; cinema.hidden = true; document.body.classList.remove("travado"); };
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
    yt: '<svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>',
    sp: '<svg viewBox="0 0 24 24"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm5.5 17.3a.75.75 0 0 1-1 .25c-2.8-1.7-6.4-2.1-10.6-1.2a.75.75 0 1 1-.3-1.5c4.6-1 8.6-.6 11.7 1.3.4.3.5.7.2 1.1zm1.5-3.3a.94.94 0 0 1-1.3.3c-3.2-2-8.2-2.6-12-1.4a.94.94 0 1 1-.6-1.8c4.4-1.3 9.8-.7 13.5 1.6.5.3.6.9.4 1.3zm.1-3.4C15.3 8.3 8.9 8.1 5.2 9.2a1.1 1.1 0 1 1-.7-2.2c4.2-1.3 11.3-1 15.7 1.6a1.1 1.1 0 0 1-1.1 2z"/></svg>'
  };
  /* Premium Glow Cards (biblioteca): cards escuros com luz azul flutuando e borda que acende no cursor */
  const rl = $("#redes-lista");
  Object.assign(rl.dataset, { cx: "premium-glow-cards", halo: "240", corBorda: "#c9cdff" });
  const CORES_REDES = ["#4f5bff", "#7a83ff", "#3340e6", "#9aa1ff"];
  K.redes.forEach((r, i) => {
    const a = el("a", "rede", `<span class="rede-user">${r.user}</span><span class="rede-icone" aria-hidden="true">${ICONES[r.icone] || ""}</span><span class="rede-pe"><span class="rede-nome">${r.nome}</span><span class="rede-seta" aria-hidden="true">↗</span></span>`);
    a.href = r.url; a.target = "_blank"; a.rel = "noopener";
    a.dataset.card = ""; a.dataset.cor = CORES_REDES[i % CORES_REDES.length];
    rl.append(a);
  });
  revelar($$(".rede", rl), .1); revelar($$("#redes .cab > *"));

  /* ---------- Presskit · Card Stack (biblioteca): as fotos vão passando ---------- */
  /* Helix Spiral (biblioteca): fotos do presskit numa espiral 3D que gira sozinha e com o arrasto */
  const pk = $("#pk-helice"), pequeno = matchMedia("(max-width:760px)").matches;
  Object.assign(pk.dataset, { cx: "helix-spiral", altura: pequeno ? "460" : "600", raio: pequeno ? "150" : "250", largura: pequeno ? "150" : "210", alturaItem: pequeno ? "205" : "290", espaco: "38", velocidade: "0.16", acento: "#4f5bff" });
  K.fotosPresskit.forEach((f, i) => { const im = el("img"); im.src = f; im.alt = `Douglas Mor, foto de divulgação ${i + 1}`; im.loading = "lazy"; pk.append(im); });
  revelar($$(".presskit-texto > *"), .08);

  /* ---------- Booking ---------- */
  const bt = $(".booking-tela");
  bt.addEventListener("pointermove", e => { const r = bt.getBoundingClientRect(); bt.style.setProperty("--mx", e.clientX - r.left + "px"); bt.style.setProperty("--my", e.clientY - r.top + "px"); });
  revelar($$(".booking-tela > *"), .1);
  revelar($$(".capa-grade > *"), .12);

  /* ---------- Numeração das seções + progresso da leitura no menu ---------- */
  $$(".secao").forEach((sec, i) => { const r = $(".rotulo", sec); if (r) r.dataset.n = String(i + 1).padStart(2, "0"); });
  const barra = $("#topo-barra");
  function atualizaGuia() {
    const ini = $("#capa").offsetTop, fim = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${clamp((scrollY - ini) / Math.max(1, fim - ini), 0, 1)})`;
  }

  /* ---------- Ajustes depois que os componentes da biblioteca montam ---------- */
  document.addEventListener("DOMContentLoaded", () => setTimeout(() => {
    $$(".cx-eic-card", av).forEach(c => c.querySelector(".cx-eic-cont").insertAdjacentHTML("beforeend",
      '<button type="button" class="yt-play" aria-label="Tocar o set"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></svg></button>'));
    $$(".cx-sa-aberto a", sa).forEach(a => { a.target = "_blank"; a.rel = "noopener"; });
  }, 0));

  /* ---------- Laço principal ---------- */
  let pedido = false;
  const tudo = () => { atualizaTopo(); atualizaHero(); atualizaGuia(); pedido = false; };
  addEventListener("scroll", () => { if (pedido) return; pedido = true; requestAnimationFrame(tudo); }, { passive: true });
  addEventListener("resize", tudo);
  tudo();
})();
