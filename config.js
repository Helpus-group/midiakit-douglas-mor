/* Mídia Kit · Douglas Mor · 2026—2027
   Tudo o que muda com o tempo fica aqui: contatos, sets, vídeos, palcos e redes. */
window.KIT = {
  nome: "Douglas Mor",
  booking: {
    numero: "5551991604664",
    formatado: "(51) 99160-4664",
    email: "djdouglasmor@gmail.com",
    mensagem: "Olá, Douglas! Vi seu mídia kit e quero conversar sobre uma data."
  },
  presskit: "https://drive.google.com/drive/folders/1JhwWlDSShDJVC8HDlIAgw7wyaS-foBo4?usp=drive_link",

  // Menu do topo e indicador de navegação: cada item leva a uma seção
  menu: [
    { nome: "Bio",      alvo: "#bio" },
    { nome: "Marcos",   alvo: "#trajetoria" },
    { nome: "Palcos",   alvo: "#palcos" },
    { nome: "Ao vivo",  alvo: "#aovivo" },
    { nome: "Ouça",     alvo: "#sets" },
    { nome: "Na pista", alvo: "#pista" },
    { nome: "Redes",    alvo: "#redes" },
    { nome: "Presskit", alvo: "#presskit" },
    { nome: "Booking",  alvo: "#booking" }
  ],

  // Marcos da carreira (sem ano). Fotos intercalam fundo de estúdio (cinza) e fundos diferentes, sem poses parecidas em sequência.
  marcos: [
    { titulo: "Residente da DOPE", texto: "Residente da casa, com o House como base e passagens pelo Progressive House e pelo Melodic House & Techno.", foto: "assets/fotos/bio-9.webp" },
    { titulo: "Vencedor do contest da Amazon", texto: "Venceu o contest da Amazon Club e conquistou a abertura da Inside, no line-up com D-Nox e PACS.", foto: "assets/pista/amazon-q27.webp" },
    { titulo: "Dividiu line-up com grandes nomes da cena", texto: "Rafael Cerato, ZAC, D-Nox & PACS, Victor Lou, GIU, Duarte, Gaabe e Albuquerque, com destaque para o closing na Anti-Dope depois das três horas de Rafael Cerato.", foto: "assets/fotos/bio-6.webp" },
    { titulo: "Flexibilidade na pista", texto: "Curadoria para todos os momentos da noite, do warm up ao end up, lendo o público sem perder a identidade.", foto: "assets/pista/p-151.webp" },
    { titulo: "Música, energia e atmosfera", texto: "Grooves consistentes, atmosferas envolventes e uma construção progressiva de energia, sempre em busca de uma conexão natural com a pista.", foto: "assets/fotos/bio-21.webp" }
  ],

  // Onde já tocou: um painel por casa (acordeão sincronizado)
  palcos: [
    { casa: "Inside · Amazon Club", papel: "Opening · Contest 2026", texto: "Venceu o contest da Amazon Club e abriu a Inside, no line-up com D-Nox & PACS.", foto: "assets/pista/amazon-q9.webp" },
    { casa: "Anti-Dope", papel: "Closing · Warm-ups", texto: "Closing depois do set de 3 h de Rafael Cerato. Warm-ups para ZAC e Victor Lou.", foto: "assets/pista/p-152.webp" },
    { casa: "Triplex", papel: "Warm-up · B2B", texto: "Warm-up para GIU e closing B2B com Duarte, encerrando a noite.", foto: "assets/fotos/bio-24.webp" },
    { casa: "DOPE", papel: "Residência", texto: "A casa do Douglas: residente, com o House como base da pista.", foto: "assets/pista/p-142.webp" }
  ],
  letreiro: ["Rafael Cerato", "Gaabe", "ZAC", "D-Nox", "PACS", "Albuquerque", "Victor Lou", "GIU", "Duarte"],

  // Sets ao vivo gravados para o YouTube (acordeão com dois blocos e play na tela)
  aoVivo: [
    { id: "PQ07AauFSkY", titulo: "Live @ Amazon Club", estilo: "House · Deep House · Melodic House", capa: "assets/pista/amazon-q3.webp" },
    { id: "MAOnj8HmxIg", titulo: "Warm-up Set · Anti-Dope", estilo: "House · Melodic House", capa: "assets/pista/p-150.webp" }
  ],

  // "Ouça aqui" (Showcase Accordion): os dois primeiros são os perfis; os outros, sets do SoundCloud que tocam aqui mesmo
  sets: [
    { titulo: "YouTube", sub: "Sets em vídeo", texto: "Sets completos gravados ao vivo, em vídeo.", capa: "assets/pista/p-145.webp", url: "https://youtube.com/@djdouglasmor", tipo: "perfil", botao: "Abrir canal" },
    { titulo: "SoundCloud", sub: "Todos os sets", texto: "Perfil com todos os sets e mixes.", capa: "assets/fotos/bio-11.webp", url: "https://soundcloud.com/djdouglasmor", tipo: "perfil", botao: "Abrir perfil" },
    { titulo: "Warm Up · Dope.GV 2 Anos", sub: "Dope.GV 2 Anos", texto: "Warm up · 18.06.2025 · 2:19:20", capa: "assets/capas/set-dope.webp", url: "https://soundcloud.com/djdouglasmor/douglas-mor-warm-up-at-dope-gv" },
    { titulo: "DJ Contest Amazon", sub: "Contest Amazon", texto: "Com D-Nox & PACS · Amazon Club · 1:09:05", capa: "assets/capas/set-amazon.webp", url: "https://soundcloud.com/djdouglasmor/douglas-mor-dj-contest-amazon" },
    { titulo: "Solaris", sub: "Solaris", texto: "14.03.2026 · 1:27:26", capa: "assets/capas/set-solaris.webp", url: "https://soundcloud.com/djdouglasmor/douglas-mor-solaris-14-03-2026" },
    { titulo: "DM Radio Mix #02", sub: "DM Radio Mix #02", texto: "Deep House and House · 1:19:29", capa: "assets/capas/set-radio.webp", url: "https://soundcloud.com/djdouglasmor/sets/dm-radio-mix" }
  ],

  videos: [
    { titulo: "DOPE GV", data: "24.10", src: "assets/videos/dope-2410-a.mp4", previa: "assets/videos/dope-2410-a-previa.mp4", poster: "assets/videos/dope-2410-a.jpg" },
    { titulo: "Amazon Club", data: "16.05", src: "assets/videos/amazon-1605.mp4", previa: "assets/videos/amazon-1605-previa.mp4", poster: "assets/videos/amazon-1605.jpg" },
    { titulo: "DOPE GV", data: "27.06", src: "assets/videos/dope-2706.mp4", previa: "assets/videos/dope-2706-previa.mp4", poster: "assets/videos/dope-2706.jpg" },
    { titulo: "DOPE GV", data: "24.10 · II", src: "assets/videos/dope-2410-b.mp4", previa: "assets/videos/dope-2410-b-previa.mp4", poster: "assets/videos/dope-2410-b.jpg" }
  ],
  fotosPista: ["assets/pista/p-145.webp", "assets/pista/p-150.webp", "assets/pista/p-amazon.webp", "assets/pista/p-151.webp", "assets/pista/p-152.webp", "assets/pista/p-142.webp"],

  redes: [
    { nome: "Instagram", user: "@djdouglasmor", url: "https://www.instagram.com/djdouglasmor/", icone: "ig" },
    { nome: "SoundCloud", user: "djdouglasmor", url: "https://soundcloud.com/djdouglasmor", icone: "sc" },
    { nome: "YouTube", user: "@djdouglasmor", url: "https://www.youtube.com/@djdouglasmor", icone: "yt" },
    { nome: "Spotify", user: "Douglas Mor", url: "https://open.spotify.com/user/22ykdwasonckyx5g3mh7gepha", icone: "sp" }
  ],

  // Intercaladas: estúdio cinza / fundo diferente, sem poses parecidas lado a lado
  fotosBio: ["assets/fotos/bio-10.webp", "assets/fotos/bio-15.webp", "assets/fotos/bio-1.webp", "assets/fotos/bio-16.webp", "assets/fotos/bio-5.webp", "assets/fotos/bio-24.webp"],
  fotosPresskit: ["assets/fotos/bio-1-2.webp", "assets/fotos/bio-20.webp", "assets/fotos/bio-13.webp", "assets/fotos/bio-14.webp", "assets/fotos/bio-3.webp"]
};
