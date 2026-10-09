/*
 * Small raw-WebGL helpers (no library):
 *  - attachDistort(img): on hover, a canvas takes over the image and bends it toward the cursor
 *    with a soft RGB split; it hands back to the <img> and frees its context when the hover ends.
 *  - createLiquid(canvas): a two-texture noise dissolve used by the weapon stage.
 */

const VERT = `attribute vec2 p; varying vec2 v;
void main(){ v = p * 0.5 + 0.5; v.y = 1.0 - v.y; gl_Position = vec4(p, 0.0, 1.0); }`;

const DISTORT = `precision mediump float;
varying vec2 v;
uniform sampler2D t;
uniform vec2 mouse;
uniform float amt;
uniform float time;
uniform float aspect;
uniform vec4 fit;
void main(){
  vec2 uv = v;
  vec2 d = uv - mouse;
  float dist = length(d * vec2(aspect, 1.0));
  float f = smoothstep(0.45, 0.0, dist) * amt;
  uv -= d * f * 0.28;
  uv += vec2(sin(uv.y * 16.0 + time * 2.2), cos(uv.x * 12.0 + time * 1.7)) * 0.0035 * amt;
  vec2 tuv = uv * fit.xy + fit.zw;
  float s = 0.014 * f + 0.0015 * amt;
  vec4 c = texture2D(t, tuv);
  float r = texture2D(t, tuv + vec2(s, 0.0)).r;
  float b = texture2D(t, tuv - vec2(s, 0.0)).b;
  vec4 col = vec4(r, c.g, b, c.a);
  if (tuv.x < 0.0 || tuv.x > 1.0 || tuv.y < 0.0 || tuv.y > 1.0) col = vec4(0.0);
  gl_FragColor = col;
}`;

const LIQUID = `precision mediump float;
varying vec2 v;
uniform sampler2D a;
uniform sampler2D b;
uniform vec4 fitA;
uniform vec4 fitB;
uniform float prog;
uniform float dir;
uniform float time;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
vec4 tex(sampler2D s, vec2 uv, vec4 fit){
  vec2 t = uv * fit.xy + fit.zw;
  if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return vec4(0.0);
  return texture2D(s, t);
}
void main(){
  float n = noise(v * 5.0 + time * 0.15) * 0.65 + noise(v * 13.0) * 0.35;
  float sweep = dir > 0.0 ? v.x : 1.0 - v.x;
  float m = smoothstep(0.0, 1.0, (prog * 1.8 - 0.4) - (n * 0.5 + sweep * 0.5) + 0.25);
  vec2 off = vec2((n - 0.5) * 0.22, (n - 0.5) * 0.06);
  vec4 ca = tex(a, v + off * m * dir, fitA);
  vec4 cb = tex(b, v - off * (1.0 - m) * dir, fitB);
  gl_FragColor = mix(ca, cb, m);
}`;

function program(gl: WebGLRenderingContext, frag: string) {
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  gl.useProgram(p);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(p, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return p;
}

function texture(gl: WebGLRenderingContext, img: TexImageSource, unit = 0) {
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  return t;
}

/** uv transform reproducing CSS object-fit (cover/contain) + object-position. */
export function fitUV(boxW: number, boxH: number, iw: number, ih: number, mode: "cover" | "contain", posX = 0.5, posY = 0.5) {
  const s = mode === "cover" ? Math.max(boxW / iw, boxH / ih) : Math.min(boxW / iw, boxH / ih);
  const rw = iw * s;
  const rh = ih * s;
  const ox = (boxW - rw) * posX;
  const oy = (boxH - rh) * posY;
  return [boxW / rw, boxH / rh, -ox / rw, -oy / rh];
}

function objectPos(cs: CSSStyleDeclaration) {
  const parts = cs.objectPosition.split(" ");
  const pct = (s: string | undefined, fallback: number) => (s && s.endsWith("%") ? parseFloat(s) / 100 : s === "left" || s === "top" ? 0 : s === "right" || s === "bottom" ? 1 : fallback);
  return [pct(parts[0], 0.5), pct(parts[1], 0.5)];
}

export function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl");
  } catch {
    return false;
  }
}

export function attachDistort(img: HTMLImageElement) {
  let canvas: HTMLCanvasElement | null = null;
  let gl: WebGLRenderingContext | null = null;
  let uni: Record<string, WebGLUniformLocation | null> = {};
  let raf = 0;
  let amt = 0;
  let target = 0;
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  const t0 = performance.now();

  const teardown = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    canvas?.remove();
    canvas = null;
    gl = null;
    img.style.opacity = "";
  };

  const setup = () => {
    if (!img.complete || !img.naturalWidth) return false;
    canvas = document.createElement("canvas");
    canvas.className = "gl-layer";
    img.insertAdjacentElement("afterend", canvas);
    gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true, antialias: false });
    if (!gl) {
      canvas.remove();
      canvas = null;
      return false;
    }
    const p = program(gl, DISTORT);
    texture(gl, img);
    for (const n of ["t", "mouse", "amt", "time", "aspect", "fit"]) uni[n] = gl.getUniformLocation(p, n);
    gl.uniform1i(uni.t, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    return true;
  };

  const frame = () => {
    if (!canvas || !gl) return;
    amt += (target - amt) * 0.08;
    mouse.x += (mouse.tx - mouse.x) * 0.15;
    mouse.y += (mouse.ty - mouse.y) * 0.15;
    // follow the image's own box and transform (it may be parallaxing)
    const cs = getComputedStyle(img);
    const w = img.offsetWidth;
    const h = img.offsetHeight;
    Object.assign(canvas.style, {
      left: img.offsetLeft + "px",
      top: img.offsetTop + "px",
      width: w + "px",
      height: h + "px",
      transform: cs.transform === "none" ? "" : cs.transform,
      transformOrigin: cs.transformOrigin,
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    const [px, py] = objectPos(cs);
    const fit = fitUV(w, h, img.naturalWidth, img.naturalHeight, cs.objectFit === "contain" ? "contain" : "cover", px, py);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uni.mouse, mouse.x, mouse.y);
    gl.uniform1f(uni.amt, amt);
    gl.uniform1f(uni.time, (performance.now() - t0) / 1000);
    gl.uniform1f(uni.aspect, w / Math.max(1, h));
    gl.uniform4f(uni.fit, fit[0], fit[1], fit[2], fit[3]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    img.style.opacity = "0";
    if (target === 0 && amt < 0.004) return teardown();
    raf = requestAnimationFrame(frame);
  };

  const host = img.parentElement!;
  const onEnter = () => {
    target = 1;
    if (!canvas && !setup()) return;
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const onMove = (e: PointerEvent) => {
    const r = img.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = (e.clientY - r.top) / r.height;
  };
  const onLeave = () => {
    target = 0;
  };
  host.addEventListener("pointerenter", onEnter);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerleave", onLeave);
  return () => {
    host.removeEventListener("pointerenter", onEnter);
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    teardown();
  };
}

/** Two-texture liquid dissolve. Returns null when WebGL is unavailable. */
export function createLiquid(canvas: HTMLCanvasElement, sources: string[]) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
  if (!gl) return null;
  const p = program(gl, LIQUID);
  const u = Object.fromEntries(["a", "b", "fitA", "fitB", "prog", "dir", "time"].map((n) => [n, gl.getUniformLocation(p, n)]));
  gl.uniform1i(u.a, 0);
  gl.uniform1i(u.b, 1);
  const imgs: HTMLImageElement[] = sources.map((src) => {
    const im = new Image();
    im.src = src;
    return im;
  });
  const texs = new Map<number, WebGLTexture | null>();
  const tex = (i: number, unit: number) => {
    const im = imgs[i];
    if (!im.complete || !im.naturalWidth) return false;
    if (!texs.has(i)) texs.set(i, texture(gl, im, unit));
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texs.get(i)!);
    return true;
  };
  const t0 = performance.now();
  const draw = (from: number, to: number, prog: number, dir: number) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    if (!tex(from, 0) || !tex(to, 1)) return false;
    const fa = fitUV(w, h * 0.78, imgs[from].naturalWidth, imgs[from].naturalHeight, "contain");
    const fb = fitUV(w, h * 0.78, imgs[to].naturalWidth, imgs[to].naturalHeight, "contain");
    // keep the image in the middle 78% of the stage height
    const shift = (m: number[]) => [m[0], m[1] / 0.78, m[2], m[3] - (0.11 / 0.78) * m[1]];
    const A = shift(fa);
    const B = shift(fb);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform4f(u.fitA, A[0], A[1], A[2], A[3]);
    gl.uniform4f(u.fitB, B[0], B[1], B[2], B[3]);
    gl.uniform1f(u.prog, prog);
    gl.uniform1f(u.dir, dir);
    gl.uniform1f(u.time, (performance.now() - t0) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return true;
  };
  return {
    draw,
    ready: (i: number) => imgs[i].complete && imgs[i].naturalWidth > 0,
    onLoad: (cb: () => void) => imgs.forEach((im) => im.addEventListener("load", cb)),
    destroy: () => gl.getExtension("WEBGL_lose_context")?.loseContext(),
  };
}
