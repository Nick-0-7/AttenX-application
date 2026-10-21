import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const LEG = 1;
const VIEW = new THREE.Vector3(1, 1, 1).normalize();
const ISO = Math.sqrt(2 / 3);

const FIT_W = 0.57;
const FIT_H = 0.41;

const THICK_MIN = 0.14;
const THICK_STEP = 0.02;

const ROUND_STEP = 0.08;
const MAX_RADIUS = 0.45 * LEG;

const BEND_SEGS = 40;
const LINE_SEGS = 4;

const AMBIENT = 0.35;
const KEY = new THREE.Vector3(0.55, 0.7, 0.45);
const BACK = new THREE.Vector3(0.25, 0.1, 0.25);

const FACE_KEYS = ["leftFace", "topFace", "rightFace"];
const SIGNS = [1, -1, -1];

const TEX_H = 256;
const MAX_TEX_W = 4096;
const GAP_EM = 0.9;

const SPEED_UNIT = 0.034 * LEG;
const FLING_DECAY = 3;
const MAX_HOVER_SPEED = 100;
const HOVER_ATTACK = 0.15;
const HOVER_RELEASE = 0.3;

const SHUTTER = 1;
const MAX_BLUR = 0.5;

const SHADOW_OFFSET = { x: -0.13, y: 0.74 };
const SHADOW_SIGMA = { x: 0.27, y: 0.1 };
const SHADOW_STEP = 0.054;

const FLOOR_GRADIENT = "linear-gradient(to bottom, rgba(0,0,0,0.11) 0%, rgba(0,0,0,0) 55%)";

// Elegant Monochrome / Black, White & Grey Defaults
const DEFAULT_LEFT = {
  text: "STUDENT ATTAINMENT ·",
  size: 6.5,
  weight: "bold",
  fill: "#ffffff",
  ink: "#111111",
};

const DEFAULT_TOP = {
  text: "STUDENT ATTAINMENT ·",
  size: 5,
  weight: "regular",
  fill: "#1f1f23",
  ink: "#ffffff",
};

const DEFAULT_RIGHT = {
  text: "STUDENT ATTAINMENT ·",
  size: 4,
  weight: "light",
  fill: "#52525b",
  ink: "#f4f4f6",
};

const FACE_DEFAULTS = {
  leftFace: DEFAULT_LEFT,
  topFace: DEFAULT_TOP,
  rightFace: DEFAULT_RIGHT,
};

const DEFAULT_FONT = {
  fontFamily: "Montserrat, 'Avenir Next', Inter, Helvetica, Arial, sans-serif",
  fontWeight: 400,
};

const DEFAULTS = {
  leftFace: DEFAULT_LEFT,
  topFace: DEFAULT_TOP,
  rightFace: DEFAULT_RIGHT,
  background: "transparent",
  font: DEFAULT_FONT,
  thickness: 4.8,
  roundness: 2.5,
  shadow: 0,
  hoverSpeed: 3,
  speed: 0.6,
  direction: "cw",
  drag: true,
  scale: 115,
};

function clamp(v, lo, hi, fallback) {
  const n = typeof v === "number" && isFinite(v) ? v : fallback;
  return Math.max(lo, Math.min(hi, n));
}

const colorCache = new Map();
let colorCtx = null;

function parseColor(input, fallback) {
  const raw = (input || fallback).trim();
  const hit = colorCache.get(raw);
  if (hit) return hit;
  let css = raw;
  const token = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(css);
  if (token) css = token[1];
  if (!colorCtx && typeof document !== "undefined") {
    colorCtx = document.createElement("canvas").getContext("2d");
  }
  let out = [0, 0, 0, 1];
  if (colorCtx) {
    colorCtx.fillStyle = "#000000";
    colorCtx.fillStyle = css;
    const normal = String(colorCtx.fillStyle);
    if (normal.startsWith("#") && normal.length === 7) {
      out = [
        parseInt(normal.slice(1, 3), 16) / 255,
        parseInt(normal.slice(3, 5), 16) / 255,
        parseInt(normal.slice(5, 7), 16) / 255,
        1,
      ];
    } else {
      const parts = normal.match(/[\d.]+/g);
      if (parts && parts.length >= 3) {
        out = [
          Number(parts[0]) / 255,
          Number(parts[1]) / 255,
          Number(parts[2]) / 255,
          parts.length > 3 ? Number(parts[3]) : 1,
        ];
      }
    }
  }
  colorCache.set(raw, out);
  return out;
}

function isTransparent(input) {
  let css = (input || "").trim().toLowerCase();
  const token = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(css);
  if (token) css = token[1].trim();
  if (!css || css === "transparent") return true;
  if (/^#[0-9a-f]{8}$/.test(css)) return css.endsWith("00");
  if (/^#[0-9a-f]{4}$/.test(css)) return css.endsWith("0");
  const alpha = /^(?:rgba?|hsla?)\(.*[,/]\s*([\d.]+)(%?)\s*\)$/.exec(css);
  return Boolean(alpha && Number(alpha[1]) === 0);
}

function fontWeightFor(face, font) {
  if (face.weight === "light") return "300";
  if (face.weight === "bold") return "700";
  return String(font?.fontWeight ?? 400);
}

function fontStringFor(face, font, px) {
  const family = font?.fontFamily || DEFAULT_FONT.fontFamily;
  const style = font?.fontStyle === "italic" ? "italic" : "normal";
  return `${style} ${fontWeightFor(face, font)} ${px}px ${family}`;
}

function lineOf(face) {
  return String(face.text ?? "").replace(/\s+/g, " ").trim();
}

function faceKeyOf(face, font) {
  return [
    lineOf(face),
    face.size,
    fontWeightFor(face, font),
    font?.fontFamily,
    font?.fontStyle,
    font?.letterSpacing,
  ].join("|");
}

function drawStrip(face, font) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const text = lineOf(face);
  const fontPx = (clamp(face.size, 0, 10, 5) / 10) * TEX_H;
  if (!ctx || !text || fontPx < 1) {
    canvas.width = 4;
    canvas.height = 4;
    if (ctx) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 4, 4);
    }
    return { canvas, aspect: 1 };
  }

  const setFont = () => {
    ctx.font = fontStringFor(face, font, fontPx);
    const spacing = font?.letterSpacing;
    if (spacing !== undefined && spacing !== null && "letterSpacing" in ctx) {
      try {
        ctx.letterSpacing =
          typeof spacing === "number" ? `${spacing}px` : String(spacing);
      } catch {
        // Ignore unsupported letterSpacing error
      }
    }
  };

  setFont();
  const gap = GAP_EM * fontPx;
  const unitW = ctx.measureText(text).width + gap;
  const scale = Math.min(1, MAX_TEX_W / unitW);
  canvas.width = Math.max(4, Math.round(unitW * scale));
  canvas.height = Math.max(4, Math.round(TEX_H * scale));

  setFont();
  ctx.setTransform(canvas.width / unitW, 0, 0, canvas.height / TEX_H, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, unitW, TEX_H);
  ctx.fillStyle = "#FFF";
  ctx.textBaseline = "alphabetic";

  const cap = ctx.measureText("H").actualBoundingBoxAscent || fontPx * 0.7;
  ctx.fillText(text, gap / 2, TEX_H / 2 + cap / 2);
  return { canvas, aspect: unitW / TEX_H };
}

function buildPath(R) {
  const L = LEG;
  const pts = [];
  const marks = { midTop: 0, midBottom: 0 };
  const push = (c, t) => {
    const last = pts[pts.length - 1];
    if (last && last.c.distanceToSquared(c) < 1e-14) return;
    pts.push({ c, t: t.clone().normalize() });
  };

  const arc = (centre, e0, e1, from, to) => {
    const segs = Math.max(2, Math.round((BEND_SEGS * Math.abs(to - from)) / (Math.PI / 2)));
    for (let i = 0; i <= segs; i++) {
      const a = from + ((to - from) * i) / segs;
      const c = centre
        .clone()
        .addScaledVector(e0, R * Math.cos(a))
        .addScaledVector(e1, R * Math.sin(a));
      const t = e0.clone().multiplyScalar(-Math.sin(a)).addScaledVector(e1, Math.cos(a));
      push(c, t);
    }
  };

  const line = (a, b) => {
    const t = b.clone().sub(a);
    let mid = 0;
    for (let i = 0; i <= LINE_SEGS; i++) {
      push(a.clone().lerp(b, i / LINE_SEGS), t);
      if (i === LINE_SEGS / 2) mid = pts.length - 1;
    }
    return mid;
  };

  const X = new THREE.Vector3(1, 0, 0);
  const Y = new THREE.Vector3(0, 1, 0);
  const Z = new THREE.Vector3(0, 0, 1);
  const nX = X.clone().negate();
  const nY = Y.clone().negate();
  const nZ = Z.clone().negate();
  const lap = new THREE.Vector3(L, L, L);

  line(new THREE.Vector3(0, L / 2, 0), new THREE.Vector3(0, L - R, 0));
  arc(new THREE.Vector3(R, L - R, 0), nX, Y, 0, Math.PI / 2);
  marks.midTop = line(new THREE.Vector3(R, L, 0), new THREE.Vector3(L - R, L, 0));
  arc(new THREE.Vector3(L - R, L, R), nZ, X, 0, Math.PI / 2);
  marks.midBottom = line(new THREE.Vector3(L, L, R), new THREE.Vector3(L, L, L - R));
  arc(new THREE.Vector3(L, L + R, L - R), nY, Z, 0, Math.PI / 2);
  line(new THREE.Vector3(L, L + R, L), new THREE.Vector3(0, L / 2, 0).add(lap));
  return { pts, marks };
}

function buildBeam(width, R) {
  const { pts: path, marks } = buildPath(R);
  const count = path.length;
  const half = width / 2;

  const s = new Float64Array(count);
  const p = [];
  const q = [];
  let fp = new THREE.Vector3(0, 0, 1);
  let fq = new THREE.Vector3().crossVectors(path[0].t, fp).normalize();
  const turn = new THREE.Quaternion();
  for (let i = 0; i < count; i++) {
    if (i > 0) {
      s[i] = s[i - 1] + path[i].c.distanceTo(path[i - 1].c);
      turn.setFromUnitVectors(path[i - 1].t, path[i].t);
      fp = fp.clone().applyQuaternion(turn);
      const t = path[i].t;
      fp.addScaledVector(t, -fp.dot(t)).normalize();
      fq = new THREE.Vector3().crossVectors(t, fp).normalize();
    }
    p.push(fp);
    q.push(fq);
  }

  const verts = count * 2 * 4;
  const position = new Float32Array(verts * 3);
  const normal = new Float32Array(verts * 3);
  const aU = new Float32Array(verts);
  const aV = new Float32Array(verts);
  const index = [];
  const n = new THREE.Vector3();
  const m = new THREE.Vector3();
  const v = new THREE.Vector3();
  let k = 0;
  for (let face = 0; face < 4; face++) {
    const base = k;
    for (let i = 0; i < count; i++) {
      const sign = face < 2 ? 1 : -1;
      n.copy(face % 2 === 0 ? p[i] : q[i]).multiplyScalar(sign);

      m.crossVectors(n, path[i].t);
      for (const side of [-1, 1]) {
        v.copy(path[i].c).addScaledVector(n, half).addScaledVector(m, side * half);
        position.set([v.x, v.y, v.z], k * 3);
        normal.set([n.x, n.y, n.z], k * 3);
        aU[k] = s[i];
        aV[k] = side * half;
        k++;
      }
    }
    for (let i = 0; i < count - 1; i++) {
      const a = base + i * 2;
      const b = a + 1;
      const a2 = a + 2;
      const b2 = a + 3;
      index.push(a, a2, b, a2, b2, b);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
  geometry.setAttribute("aU", new THREE.BufferAttribute(aU, 1));
  geometry.setAttribute("aV", new THREE.BufferAttribute(aV, 1));
  geometry.setIndex(index);
  const length = s[count - 1];

  return {
    geometry,
    length,
    cuts: [s[marks.midBottom], length * 2, s[marks.midTop]],
  };
}

const BEAM_VERTEX = `
attribute float aU;
attribute float aV;
varying vec3 vN;
varying float vU;
varying float vV;
varying float vScreenY;
void main() {
    vN = normal;
    vU = aU;
    vV = aV;
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vScreenY = clip.y / clip.w;
    gl_Position = clip;
}
`;

const BEAM_FRAGMENT = `
uniform sampler2D uTex0;
uniform sampler2D uTex1;
uniform sampler2D uTex2;
uniform vec3 uLambda;
uniform vec3 uPhase;
uniform vec3 uBlur;

uniform vec3 uTexW;
uniform vec3 uSign;
uniform vec3 uCut;
uniform float uLoop;
uniform float uWidth;
uniform vec3 uFill0;
uniform vec3 uFill1;
uniform vec3 uFill2;
uniform vec3 uInk0;
uniform vec3 uInk1;
uniform vec3 uInk2;
uniform vec3 uKey;
uniform vec3 uBack;
uniform float uAmbient;
varying vec3 vN;
varying float vU;
varying float vV;
varying float vScreenY;

vec2 bandUV(float lambda, float phase, float s, float cut) {
    float u = vU >= cut ? vU - uLoop : vU;
    return vec2(s * (u / lambda - phase), 0.5 + s * vV / uWidth);
}

float smear(sampler2D tex, vec2 uv, vec2 gx, vec2 gy, float blur, float texW) {
    if (blur * texW < 1.0) return textureGrad(tex, uv, gx, gy).r;
    const float n = 3.0;

    vec2 sx = gx + vec2((gx.x < 0.0 ? -1.0 : 1.0) * blur / n, 0.0);
    float sum = 0.0;
    for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float o = ((fi + 0.5) / n - 0.5) * blur;
        sum += textureGrad(tex, uv + vec2(o, 0.0), sx, gy).r;
    }
    return sum / n;
}

void main() {
    vec3 n = normalize(vN);
    vec2 uv0 = bandUV(uLambda.x, uPhase.x, uSign.x, uCut.x);
    vec2 uv1 = bandUV(uLambda.y, uPhase.y, uSign.y, uCut.y);
    vec2 uv2 = bandUV(uLambda.z, uPhase.z, uSign.z, uCut.z);

    vec2 gx0 = dFdx(uv0); vec2 gy0 = dFdy(uv0);
    vec2 gx1 = dFdx(uv1); vec2 gy1 = dFdy(uv1);
    vec2 gx2 = dFdx(uv2); vec2 gy2 = dFdy(uv2);
    vec3 fill;
    vec3 ink;
    float c;

    if (n.z >= n.x && n.z >= n.y) {
        fill = uFill0; ink = uInk0; c = smear(uTex0, uv0, gx0, gy0, uBlur.x, uTexW.x);
    } else if (n.y >= n.x) {
        fill = uFill1; ink = uInk1; c = smear(uTex1, uv1, gx1, gy1, uBlur.y, uTexW.y);
    } else {
        fill = uFill2; ink = uInk2; c = smear(uTex2, uv2, gx2, gy2, uBlur.z, uTexW.z);
    }
    float shade = clamp(uAmbient + dot(max(n, 0.0), uKey) + dot(max(-n, 0.0), uBack), 0.0, 1.06);

    shade *= 0.975 + 0.025 * vScreenY;
    gl_FragColor = vec4(mix(fill, ink, c) * shade, 1.0);
}
`;

const SHADOW_VERTEX = `
void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const SHADOW_FRAGMENT = `
uniform vec2 uCenter;
uniform vec2 uSigma;
uniform float uStrength;
void main() {
    if (uStrength <= 0.001) {
        gl_FragColor = vec4(0.0);
        return;
    }
    vec2 d = (gl_FragCoord.xy - uCenter) / uSigma;
    float distSq = dot(d, d);
    if (distSq > 9.0) {
        gl_FragColor = vec4(0.0);
        return;
    }
    float alpha = uStrength * exp(-0.5 * distSq);
    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
}
`;

class DeltaScene {
  constructor(container, cfg) {
    this.container = container;
    this.cfg = cfg;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x000000, 0);

    const canvas = this.renderer.domElement;
    canvas.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;background:transparent;";
    container.appendChild(canvas);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 40);
    this.scene = new THREE.Scene();

    const target = new THREE.Vector3(LEG / 3, (2 * LEG) / 3, 0);
    this.camera.position.copy(target).addScaledVector(VIEW, 10 * LEG);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(target);

    const blank = () => {
      const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
      t.needsUpdate = true;
      return t;
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: BEAM_VERTEX,
      fragmentShader: BEAM_FRAGMENT,
      side: THREE.FrontSide,
      uniforms: {
        uTex0: { value: blank() },
        uTex1: { value: blank() },
        uTex2: { value: blank() },
        uLambda: { value: new THREE.Vector3(1, 1, 1) },
        uPhase: { value: new THREE.Vector3() },
        uBlur: { value: new THREE.Vector3() },
        uTexW: { value: new THREE.Vector3(4, 4, 4) },
        uSign: { value: new THREE.Vector3(...SIGNS) },
        uCut: { value: new THREE.Vector3() },
        uLoop: { value: 1 },
        uWidth: { value: 0.24 },
        uFill0: { value: new THREE.Vector3() },
        uFill1: { value: new THREE.Vector3() },
        uFill2: { value: new THREE.Vector3() },
        uInk0: { value: new THREE.Vector3() },
        uInk1: { value: new THREE.Vector3() },
        uInk2: { value: new THREE.Vector3() },
        uKey: { value: KEY.clone() },
        uBack: { value: BACK.clone() },
        uAmbient: { value: AMBIENT },
      },
    });

    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    this.shadowMaterial = new THREE.ShaderMaterial({
      vertexShader: SHADOW_VERTEX,
      fragmentShader: SHADOW_FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uCenter: { value: new THREE.Vector2() },
        uSigma: { value: new THREE.Vector2(1, 1) },
        uStrength: { value: 0 },
      },
    });
    this.shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.shadowMaterial);
    this.shadowMesh.frustumCulled = false;
    this.shadowMesh.renderOrder = -1;
    this.scene.add(this.shadowMesh);

    this.geometryKey = "";
    this.beamWidth = 0.24;
    this.loopLength = 1;
    this.textures = [null, null, null];
    this.textureKeys = ["", "", ""];
    this.aspects = [1, 1, 1];
    this.lambdas = [1, 1, 1];

    this.width = 1;
    this.height = 1;
    this.side = 1;
    this.frameId = 0;
    this.lastT = 0;
    this.disposed = false;
    this.visible = true;
    this.observer = null;
    this.reducedMotion = null;

    this.scroll = 0;
    this.fling = 0;
    this.press = { id: -1, angle: 0, time: 0, velocity: 0 };

    this.rate = -1;
    this.hovering = false;
    this.drawnScroll = 0;
    this.onRedraw = null;
    this.fontRequests = new Set();

    if (typeof window.matchMedia === "function") {
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    }
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.addEventListener("loadingdone", this.onFontsLoaded);
    }

    this.applyConfig();
  }

  applyConfig() {
    const cfg = this.cfg;
    const width = (THICK_MIN + THICK_STEP * clamp(cfg.thickness, 0, 10, DEFAULTS.thickness)) * LEG;
    const radius = Math.max(
      width / 2,
      Math.min(MAX_RADIUS, width / 2 + width * ROUND_STEP * clamp(cfg.roundness, 0, 10, DEFAULTS.roundness))
    );
    const geometryKey = `${width}|${radius}`;
    if (geometryKey !== this.geometryKey) {
      this.geometryKey = geometryKey;
      const { geometry, length, cuts } = buildBeam(width, radius);
      this.mesh.geometry.dispose();
      this.mesh.geometry = geometry;
      this.beamWidth = width;
      this.loopLength = length;
      this.material.uniforms.uCut.value.set(cuts[0], cuts[1], cuts[2]);
      this.material.uniforms.uLoop.value = length;
    }
    this.material.uniforms.uWidth.value = this.beamWidth;

    this.buildTextures(false);

    const u = this.material.uniforms;
    cfg.faces.forEach((face, i) => {
      const fallback = FACE_DEFAULTS[FACE_KEYS[i]];
      const fill = parseColor(face.fill, fallback.fill);
      const ink = parseColor(face.ink, fallback.ink);
      u[`uFill${i}`].value.set(fill[0], fill[1], fill[2]);
      u[`uInk${i}`].value.set(ink[0], ink[1], ink[2]);
    });

    this.layout();
  }

  buildTextures(force) {
    const cfg = this.cfg;
    const maxAniso = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    cfg.faces.forEach((face, i) => {
      const key = faceKeyOf(face, cfg.font);
      if (!force && key === this.textureKeys[i] && this.textures[i]) return;
      this.textureKeys[i] = key;
      const strip = drawStrip(face, cfg.font);
      const texture = new THREE.CanvasTexture(strip.canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = maxAniso;
      texture.colorSpace = THREE.NoColorSpace;
      texture.needsUpdate = true;
      this.textures[i]?.dispose();
      this.textures[i] = texture;
      this.aspects[i] = strip.aspect;
      this.material.uniforms.uTexW.value.setComponent(i, strip.canvas.width);
      this.material.uniforms[`uTex${i}`].value = texture;
      this.requestFont(face);
    });

    for (let i = 0; i < 3; i++) this.lambdas[i] = this.beamWidth * this.aspects[i];
    this.material.uniforms.uLambda.value.set(this.lambdas[0], this.lambdas[1], this.lambdas[2]);
  }

  requestFont(face) {
    if (typeof document === "undefined" || !document.fonts) return;
    const spec = fontStringFor(face, this.cfg.font, 32);
    if (this.fontRequests.has(spec)) return;
    this.fontRequests.add(spec);
    document.fonts.load(spec, lineOf(face) || "A").then(
      () => this.onFontsLoaded(),
      () => undefined
    );
  }

  onFontsLoaded = () => {
    if (this.disposed) return;
    this.buildTextures(true);
    this.onRedraw?.();
  };

  layout() {
    const w = this.width;
    const h = this.height;
    const fitted = Math.max(1, Math.min(w * FIT_W, h * FIT_H));
    this.side = fitted * (clamp(this.cfg.scale, 10, 200, DEFAULTS.scale) / 100);
    const pxPerUnit = this.side / (LEG * ISO);
    const halfW = w / 2 / pxPerUnit;
    const halfH = h / 2 / pxPerUnit;
    this.camera.left = -halfW;
    this.camera.right = halfW;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();

    const dpr = this.renderer.getPixelRatio();
    const cx = w / 2 + SHADOW_OFFSET.x * this.side;
    const cy = h / 2 + SHADOW_OFFSET.y * this.side;
    const su = this.shadowMaterial.uniforms;
    su.uCenter.value.set(cx * dpr, (h - cy) * dpr);
    su.uSigma.value.set(SHADOW_SIGMA.x * this.side * dpr, SHADOW_SIGMA.y * this.side * dpr);
    const strength = SHADOW_STEP * clamp(this.cfg.shadow, 0, 10, 0);
    su.uStrength.value = strength;
    this.shadowMesh.visible = strength > 0.001;
  }

  draw(moving = false) {
    const phase = (lambda) => {
      const x = this.scroll / lambda;
      return x - Math.floor(x);
    };
    const u = this.material.uniforms;
    u.uPhase.value.set(phase(this.lambdas[0]), phase(this.lambdas[1]), phase(this.lambdas[2]));

    const step = moving ? Math.abs(this.scroll - this.drawnScroll) * SHUTTER : 0;
    this.drawnScroll = this.scroll;
    const blur = (lambda) => Math.min(MAX_BLUR, step / lambda);
    u.uBlur.value.set(blur(this.lambdas[0]), blur(this.lambdas[1]), blur(this.lambdas[2]));
    this.renderer.render(this.scene, this.camera);
  }

  targetRate() {
    const still = this.reducedMotion?.matches ? 0 : 1;
    const steps = this.hovering
      ? clamp(this.cfg.hoverSpeed, 0, MAX_HOVER_SPEED, DEFAULTS.hoverSpeed)
      : clamp(this.cfg.speed, 0, 10, DEFAULTS.speed);
    return steps * SPEED_UNIT * still;
  }

  advance(dt) {
    const target = this.targetRate();
    if (this.rate < 0) this.rate = target;
    const ease = this.hovering ? HOVER_ATTACK : HOVER_RELEASE;
    this.rate += (target - this.rate) * (1 - Math.exp(-dt / ease));
    if (this.press.id !== -1) return;
    const dir = this.cfg.direction === "ccw" ? -1 : 1;
    this.scroll += (dir * this.rate + this.fling) * dt;
    this.fling *= Math.exp(-FLING_DECAY * dt);
    if (Math.abs(this.fling) < 1e-4) this.fling = 0;
  }

  angleOf(event) {
    const rect = this.container.getBoundingClientRect();
    return Math.atan2(
      event.clientY - (rect.top + rect.height / 2),
      event.clientX - (rect.left + rect.width / 2)
    );
  }

  onPointerDown = (event) => {
    if (!this.cfg.drag) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    this.press = { id: event.pointerId, angle: this.angleOf(event), time: performance.now(), velocity: 0 };
    this.fling = 0;
    try {
      this.container.setPointerCapture(event.pointerId);
    } catch {
      // Ignored
    }
    this.setCursor("grabbing");
  };

  onPointerMove = (event) => {
    if (event.pointerId !== this.press.id) return;
    const angle = this.angleOf(event);
    let delta = angle - this.press.angle;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    delta = Math.max(-0.5, Math.min(0.5, delta));
    this.press.angle = angle;
    const ds = (delta / (2 * Math.PI)) * this.loopLength;
    this.scroll += ds;
    const now = performance.now();
    const dt = Math.max(1, now - this.press.time) / 1000;
    this.press.time = now;
    this.press.velocity = this.press.velocity * 0.5 + (ds / dt) * 0.5;
  };

  onPointerUp = (event) => {
    if (event.pointerId !== this.press.id) return;
    const dir = this.cfg.direction === "ccw" ? -1 : 1;
    const idle = performance.now() - this.press.time > 80;
    this.fling = idle ? 0 : this.press.velocity - dir * Math.max(0, this.rate);
    this.press.id = -1;
    this.setCursor(this.cfg.drag ? "grab" : "");
  };

  onPointerEnter = (event) => {
    if (event.pointerType === "touch") return;
    this.hovering = true;
  };

  onPointerLeave = (event) => {
    if (event.pointerType === "touch") return;
    this.hovering = false;
  };

  setCursor(value) {
    if (this.container.style.cursor === value) return;
    this.container.style.cursor = value;
  }

  attach() {
    const node = this.container;
    node.addEventListener("pointerdown", this.onPointerDown);
    node.addEventListener("pointermove", this.onPointerMove);
    node.addEventListener("pointerup", this.onPointerUp);
    node.addEventListener("pointercancel", this.onPointerUp);
    node.addEventListener("pointerenter", this.onPointerEnter);
    node.addEventListener("pointerleave", this.onPointerLeave);
    if (typeof IntersectionObserver !== "undefined") {
      this.observer = new IntersectionObserver((entries) => {
        this.visible = entries.some((e) => e.isIntersecting);
      });
      this.observer.observe(node);
    }
  }

  detach() {
    const node = this.container;
    node.removeEventListener("pointerdown", this.onPointerDown);
    node.removeEventListener("pointermove", this.onPointerMove);
    node.removeEventListener("pointerup", this.onPointerUp);
    node.removeEventListener("pointercancel", this.onPointerUp);
    node.removeEventListener("pointerenter", this.onPointerEnter);
    node.removeEventListener("pointerleave", this.onPointerLeave);
    this.hovering = false;
    this.observer?.disconnect();
    this.observer = null;
  }

  setSize(width, height) {
    if (this.disposed) return;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.layout();
  }

  updateConfig(cfg) {
    if (this.disposed) return;
    this.cfg = cfg;
    this.applyConfig();
    this.setCursor(cfg.drag ? "grab" : "");
  }

  renderStatic() {
    if (this.disposed) return;
    this.draw();
  }

  start() {
    this.attach();
    this.setCursor(this.cfg.drag ? "grab" : "");
    this.lastT = -1;

    const loop = (now) => {
      if (this.disposed) return;
      this.frameId = requestAnimationFrame(loop);
      let dt = this.lastT < 0 ? 0 : (now - this.lastT) / 1000;
      this.lastT = now;
      if (!this.visible) return;
      if (!isFinite(dt) || dt < 0) dt = 0;
      if (dt > 0.1) dt = 0.1;
      this.advance(dt);
      this.draw(true);
    };
    this.frameId = requestAnimationFrame(loop);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.detach();
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.removeEventListener("loadingdone", this.onFontsLoaded);
    }
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.shadowMesh.geometry.dispose();
    this.shadowMaterial.dispose();
    this.textures.forEach((t) => t?.dispose());
    for (let i = 0; i < 3; i++) {
      const t = this.material.uniforms[`uTex${i}`].value;
      if (!this.textures.includes(t)) t?.dispose?.();
    }
    this.renderer.dispose();
    const canvas = this.renderer.domElement;
    canvas.parentNode?.removeChild(canvas);
  }
}

export default function TickerDelta(props) {
  const {
    leftFace = DEFAULT_LEFT,
    topFace = DEFAULT_TOP,
    rightFace = DEFAULT_RIGHT,
    background = DEFAULTS.background,
    font = DEFAULT_FONT,
    thickness = DEFAULTS.thickness,
    roundness = DEFAULTS.roundness,
    shadow = DEFAULTS.shadow,
    hoverSpeed = DEFAULTS.hoverSpeed,
    speed = DEFAULTS.speed,
    direction = DEFAULTS.direction,
    drag = DEFAULTS.drag,
    scale = DEFAULTS.scale,
    style,
    className,
  } = props;

  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  const cfgRef = useRef(null);
  const cfg = {
    faces: [
      { ...DEFAULT_LEFT, ...leftFace },
      { ...DEFAULT_TOP, ...topFace },
      { ...DEFAULT_RIGHT, ...rightFace },
    ],
    font: { ...DEFAULT_FONT, ...font },
    thickness,
    roundness,
    shadow,
    hoverSpeed,
    speed,
    direction,
    drag,
    scale,
  };
  cfgRef.current = cfg;

  const faceKey = cfg.faces
    .map((f) => `${faceKeyOf(f, cfg.font)}#${f.fill}#${f.ink}`)
    .join("||");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let scene;
    try {
      scene = new DeltaScene(container, cfgRef.current);
    } catch (err) {
      console.error("TickerDelta initialization error:", err);
      return;
    }
    sceneRef.current = scene;
    scene.setSize(container.clientWidth, container.clientHeight);
    scene.start();

    const ro = new ResizeObserver(() => {
      scene.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.updateConfig(cfgRef.current);
  }, [faceKey, thickness, roundness, shadow, hoverSpeed, speed, direction, drag, scale]);

  const label = cfg.faces.map(lineOf).filter(Boolean).join(" · ");

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={label || "Student Attainment infinite delta triangle wrapped in scrolling type"}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 120,
        minHeight: 120,
        overflow: "hidden",
        backgroundColor: "transparent",
        backgroundImage: "none",
        touchAction: drag ? "pan-y" : undefined,
        userSelect: "none",
        ...style,
      }}
    />
  );
}
