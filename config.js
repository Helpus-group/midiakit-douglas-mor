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

  // Hot cues da tela da CDJ: cada um leva a uma seção
  cues: [
    { letra: "A", nome: "Bio",       alvo: "#bio",      cor: "#ff3b5c" },
    { letra: "B", nome: "Trajetória", alvo: "#trajetoria", cor: "#ff8a1f" },
    { letra: "C", nome: "Palcos",    alvo: "#palcos",   cor: "#ffd31a" },
    { letra: "D", nome: "Sets",      alvo: "#sets",     cor: "#2fe07a" },
    { letra: "E", nome: "Na pista",  alvo: "#pista",    cor: "#22d3ee" },
    { letra: "F", nome: "Redes",     alvo: "#redes",    cor: "#3b82ff" },
    { letra: "G", nome: "Presskit",  alvo: "#presskit", cor: "#a855f7" },
    { letra: "H", nome: "Booking",   alvo: "#booking",  cor: "#ff4fd8" }
  ],

  // Faixas que "carregam" na CDJ conforme o vídeo do jog muda
  // (a waveform da tela é o áudio real destes quatro clipes, nesta ordem; dur = segundos)
  deck: [
    { faixa: "Live @ DOPE GV", info: "24.10", bpm: 124, clube: "DOPE", dur: 36.05, video: "assets/videos/dope-2410-a-previa.mp4" },
    { faixa: "Live @ DOPE GV", info: "24.10 · II", bpm: 124, clube: "DOPE", dur: 32.92, video: "assets/videos/dope-2410-b-previa.mp4" },
    { faixa: "Live @ Amazon Club", info: "16.05", bpm: 123, clube: "AMAZON", dur: 40.0, video: "assets/videos/amazon-1605-previa.mp4" },
    { faixa: "Live @ DOPE GV", info: "27.06", bpm: 125, clube: "DOPE", dur: 45.06, video: "assets/videos/dope-2706-previa.mp4" }
  ],

  trajetoria: [
    { quando: "Início", titulo: "Festas do ensino médio", texto: "Vindo de uma família de músicos, começou tocando nas festas da escola e ali construiu a conexão com a pista." },
    { quando: "2017", titulo: "Curso de DJ na AIMEC", texto: "A formação que transformou o hobby em ofício." },
    { quando: "2023", titulo: "Curso avançado com Marcos Deon", texto: "Aprofundou técnica, leitura de pista e construção de set." },
    { quando: "Hoje", titulo: "Residente da DOPE", texto: "O House como base, com passagens pelo Progressive e pelo Melodic House & Techno." },
    { quando: "2026", titulo: "Vencedor do contest Amazon Club", texto: "Conquistou a abertura da Inside, no line-up com D-Nox e PACS." }
  ],

  palcos: [
    { casa: "Inside · Amazon Club", papel: "Opening", com: "D-Nox & PACS", nota: "Vencedor do contest · 2026", foto: "assets/pista/p-amazon.webp" },
    { casa: "Anti-Dope", papel: "Closing", com: "Rafael Cerato", nota: "Depois do set de 3 h", foto: "assets/pista/p-150.webp" },
    { casa: "Anti-Dope", papel: "Warm-up", com: "ZAC", nota: "", foto: "assets/pista/p-151.webp" },
    { casa: "Anti-Dope", papel: "Warm-up", com: "Victor Lou", nota: "", foto: "assets/pista/p-152.webp" },
    { casa: "Triplex", papel: "Warm-up", com: "GIU", nota: "", foto: "" },
    { casa: "Triplex", papel: "Closing B2B", com: "Duarte", nota: "Encerrando a noite", foto: "" },
    { casa: "DOPE", papel: "Residência", com: "", nota: "Casa do Douglas", foto: "assets/pista/p-142.webp" }
  ],
  letreiro: ["ZAC", "Rafael Cerato", "D-Nox", "PACS", "Victor Lou", "GIU", "Duarte"],

  sets: [
    { titulo: "Warm Up at Dope.GV 2 Anos", data: "18.06.2025", duracao: "2:19:20", capa: "assets/capas/set-dope.webp", url: "https://soundcloud.com/djdouglasmor/douglas-mor-warm-up-at-dope-gv" },
    { titulo: "DJ Contest Amazon w/ D-Nox & PACS", data: "Amazon Club", duracao: "1:09:05", capa: "assets/capas/set-amazon.webp", url: "https://soundcloud.com/djdouglasmor/douglas-mor-dj-contest-amazon" },
    { titulo: "Solaris", data: "14.03.2026", duracao: "1:27:26", capa: "assets/capas/set-solaris.webp", url: "https://soundcloud.com/djdouglasmor/douglas-mor-solaris-14-03-2026" },
    { titulo: "DM Radio Mix #02 · Deep House and House", data: "Radio Mix", duracao: "1:19:29", capa: "assets/capas/set-radio.webp", url: "https://soundcloud.com/djdouglasmor/sets/dm-radio-mix" }
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
    { nome: "Spotify", user: "Douglas Mor", url: "https://open.spotify.com/user/22ykdwasonckyx5g3mh7gepha", icone: "sp" }
  ],

  fotosBio: ["assets/fotos/bio-10.webp", "assets/fotos/bio-11.webp", "assets/fotos/bio-12.webp", "assets/fotos/bio-1-2.webp", "assets/fotos/bio-13.webp", "assets/fotos/bio-4.webp"],
  fotosPresskit: ["assets/fotos/bio-1.webp", "assets/fotos/bio-4.webp", "assets/fotos/bio-10.webp", "assets/fotos/bio-13.webp", "assets/fotos/bio-11.webp"]
};
