/* Smooth Gradients
   Uso (dentro de uma seção com position relative; conteúdo depois com z-index 1):
   <div data-cx="smooth-gradients"></div>
   Degradê pastel macio de 4 cores com pontos de cor que derivam devagar e granulado fino. Presets prontos.
   Opções gerais: data-velocidade (1), data-qualidade (resolução, padrão 1), data-preset (sky-cream, lavanda, menta, por-do-sol, site).
   Cores aceitam "#hex" ou "var(--token)". Com prefers-reduced-motion, mostra um quadro parado. */
(function () {
  var ID = "smooth-gradients";
  var FRAG = "void main(){vec2 uv=gl_FragCoord.xy/u_res;float t=u_time*.06;\nvec2 a=vec2(.15+.1*sin(t),.2+.1*cos(t*1.3)),b=vec2(.85+.08*cos(t*.9),.8+.1*sin(t*1.1)),c=vec2(.85+.1*sin(t*1.2),.15+.1*cos(t*.8)),d=vec2(.2+.1*cos(t*.7),.85+.08*sin(t));\nc=mix(c,u_mouse,u_hover*.3);\nfloat wa=1./pow(length(uv-a)+.15,2.5),wb=1./pow(length(uv-b)+.15,2.5),wc=1./pow(length(uv-c)+.15,2.5),wd=1./pow(length(uv-d)+.15,2.5);\nvec3 col=(u_c1*wa+u_c2*wb+u_c3*wc+u_c4*wd)/(wa+wb+wc+wd);col+=(hash(gl_FragCoord.xy+fract(u_time*3.))-.5)*u_grao;gl_FragColor=vec4(col,1.);}";
  var OPC = {"c1": ["#a9b8c6", "c"], "c2": ["#f3e3c8", "c"], "c3": ["#f2b3a8", "c"], "c4": ["#e6d3c0", "c"], "grao": ["0.035", "f"]};
  var CFG = {"presets": {"sky-cream": {}, "lavanda": {"c1": "#b9b2e6", "c2": "#f6e7f2", "c3": "#e7a8c9", "c4": "#d6d9f5"}, "menta": {"c1": "#9fd8c8", "c2": "#eef6df", "c3": "#c5e7a8", "c4": "#d7efe9"}, "por-do-sol": {"c1": "#ffb38a", "c2": "#ffe3a8", "c3": "#f27a8a", "c4": "#ffd0b8"}, "site": {"c1": "var(--fundo)", "c2": "var(--fundo-2)", "c3": "var(--acento)", "c4": "var(--fundo)"}}};
  var poucoMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var LIB = [
    "precision highp float;",
    "uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform float u_hover;uniform vec3 u_click;",
    "uniform sampler2D u_img;uniform vec2 u_imgRes;uniform float u_temImg;",
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}",
    "float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.02+3.1;a*=.5;}return v;}",
    "vec2 capa(vec2 uv){float ra=u_res.x/u_res.y,ri=u_imgRes.x/max(u_imgRes.y,1.);vec2 s=ra>ri?vec2(1.,ri/ra):vec2(ra/ri,1.);return (uv-.5)*s+.5;}"
  ].join("\n");

  function rgb(el, cor) {
    var v = /^var\((--[\w-]+)\)$/.exec(String(cor).trim());
    if (v) cor = getComputedStyle(el).getPropertyValue(v[1]).trim() || "#000";
    var c = document.createElement("canvas").getContext("2d"); c.fillStyle = cor; var f = c.fillStyle;
    if (f[0] === "#") return [parseInt(f.substr(1, 2), 16) / 255, parseInt(f.substr(3, 2), 16) / 255, parseInt(f.substr(5, 2), 16) / 255];
    var m = f.match(/[\d.]+/g) || [0, 0, 0]; return [m[0] / 255, m[1] / 255, m[2] / 255];
  }
  function camel(s) { return s.replace(/-(\w)/g, function (_, c) { return c.toUpperCase(); }); }

  function preparar(el) {
    var area = el.parentElement;
    if (getComputedStyle(area).position === "static") area.style.position = "relative";
    el.classList.add("cx-" + ID);
    el.setAttribute("aria-hidden", "true");
    var o = el.dataset, preset = (CFG.presets && CFG.presets[o.preset]) || {};
    function valor(nome, padrao) { var k = camel(nome); return o[k] !== undefined ? o[k] : (preset[nome] !== undefined ? preset[nome] : padrao); }

    var tela = document.createElement("canvas");
    var gl = tela.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: true });
    if (!gl) return; // sem WebGL: fica a cor de fundo do CSS
    el.appendChild(tela);
    var decl = Object.keys(OPC).map(function (n) { return "uniform " + (OPC[n][1] === "c" ? "vec3" : "float") + " u_" + n.replace(/-/g, "_") + ";"; }).join("\n");
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) console.warn(ID + ": " + gl.getShaderInfoLog(x)); return x; }
    var prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, LIB + "\n" + decl + "\n" + FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { tela.remove(); return; }
    gl.useProgram(prog);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    var U = {}; function u(n) { return U[n] || (U[n] = gl.getUniformLocation(prog, n)); }

    var escala = parseFloat(o.qualidade) || CFG.escala || 1, vel = parseFloat(o.velocidade) || 1;
    var mouse = [.5, .5], alvo = [.5, .5], hover = 0, dentro = false, clique = [.5, .5, -100];
    var t0 = performance.now(), visivel = false, rodando = false, tick = 0;

    function cores() {
      Object.keys(OPC).forEach(function (n) {
        var d = OPC[n], v = valor(n, d[0]);
        if (d[1] === "c") gl.uniform3fv(u("u_" + n.replace(/-/g, "_")), rgb(el, v));
        else gl.uniform1f(u("u_" + n.replace(/-/g, "_")), parseFloat(v));
      });
    }
    function medir() {
      var dpr = Math.min(1.5, devicePixelRatio || 1) * escala;
      tela.width = Math.max(1, el.clientWidth * dpr | 0); tela.height = Math.max(1, el.clientHeight * dpr | 0);
      gl.viewport(0, 0, tela.width, tela.height); gl.uniform2f(u("u_res"), tela.width, tela.height);
      desenhar(performance.now());
    }
    function tempo(agora) { return poucoMovimento ? (CFG.tempoParado || 8) : (agora - t0) / 1000 * vel; }
    function desenhar(agora) {
      if (tick++ % 60 === 0) cores();
      mouse[0] += (alvo[0] - mouse[0]) * .08; mouse[1] += (alvo[1] - mouse[1]) * .08;
      hover += ((dentro ? 1 : 0) - hover) * .06;
      gl.uniform1f(u("u_time"), tempo(agora));
      gl.uniform2f(u("u_mouse"), mouse[0], mouse[1]); gl.uniform1f(u("u_hover"), hover);
      gl.uniform3f(u("u_click"), clique[0], clique[1], clique[2]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function laco(agora) {
      if (!visivel || document.hidden) { rodando = false; return; }
      desenhar(agora);
      if (CFG.paraEm && tempo(agora) - Math.max(0, clique[2]) > CFG.paraEm) { rodando = false; return; }
      requestAnimationFrame(laco);
    }
    function ligar() { if (!rodando && visivel && !poucoMovimento) { rodando = true; requestAnimationFrame(laco); } }

    if (CFG.imagem) {
      var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 20, 20, 255]));
      gl.uniform1f(u("u_temImg"), 0);
      var src = valor("imagem", CFG.imagemPadrao || "");
      if (src) {
        var im = new Image(); im.crossOrigin = "anonymous";
        im.onload = function () {
          gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
          ["TEXTURE_WRAP_S", "TEXTURE_WRAP_T"].forEach(function (w) { gl.texParameteri(gl.TEXTURE_2D, gl[w], gl.CLAMP_TO_EDGE); });
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.uniform2f(u("u_imgRes"), im.naturalWidth, im.naturalHeight); gl.uniform1f(u("u_temImg"), 1);
          t0 = performance.now(); clique[2] = -100; desenhar(performance.now()); ligar();
        };
        im.src = src;
      }
    }

    area.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      alvo = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; dentro = true;
      if (poucoMovimento) desenhar(performance.now());
    });
    area.addEventListener("pointerleave", function () { dentro = false; if (CFG.mouseVoltaAoCentro !== false) alvo = [.5, .5]; });
    area.addEventListener("pointerdown", function (e) {
      var r = el.getBoundingClientRect();
      clique = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, tempo(performance.now())]; ligar();
    });

    cores(); medir();
    var tt; new ResizeObserver(function () { clearTimeout(tt); tt = setTimeout(medir, 120); }).observe(el);
    new IntersectionObserver(function (e) { visivel = e[0].isIntersecting; ligar(); }).observe(el);
    document.addEventListener("visibilitychange", ligar);
  }

  function iniciar() { document.querySelectorAll('[data-cx="' + ID + '"]').forEach(preparar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
