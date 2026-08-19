const VERSION = "0.1.0";
const TAU = Math.PI * 2;

const PALETTES = [
  ["#ff4d8d", "#ffb000", "#ffe66d", "#0ead69", "#143642"],
  ["#00b8a9", "#f8f3d4", "#f6416c", "#ffde7d", "#2f4858"],
  ["#6c4ab6", "#8d72e1", "#b9e0ff", "#ff8fb1", "#fff2f2"],
  ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c"],
  ["#f72585", "#7209b7", "#3a0ca3", "#4cc9f0", "#f1faee"],
  ["#f9844a", "#f9c74f", "#90be6d", "#43aa8b", "#577590"],
  ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93"],
  ["#ffadad", "#ffd6a5", "#fdffb6", "#9bf6ff", "#a0c4ff"]
];

const BACKGROUNDS = ["#f7f1e8", "#f1f5f2", "#fff7ed", "#eef2ff", "#17212b", "#252a30"];
const PETAL_SHAPES = ["round", "pointed", "heart", "diamond"];

function hashSeed(value) {
  const text = String(value ?? "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash += hash << 13;
  hash ^= hash >>> 7;
  hash += hash << 3;
  hash ^= hash >>> 17;
  hash += hash << 5;
  return hash >>> 0;
}

function randomFrom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(random, values) {
  return values[Math.floor(random() * values.length)];
}

function between(random, min, max) {
  return min + random() * (max - min);
}

function colorAt(palette, index) {
  return palette[((index % palette.length) + palette.length) % palette.length];
}

/** Create a serializable flower blueprint. The same seed and options always match. */
export function generate(seed, options = {}) {
  const normalizedSeed = String(seed ?? "");
  const random = randomFrom(hashSeed(`${normalizedSeed}|rosa@${VERSION}`));
  const palette = options.palette?.length >= 3 ? [...options.palette] : pick(random, PALETTES);
  const background = options.background ?? pick(random, BACKGROUNDS);
  const darkBackground = background === "#17212b" || background === "#252a30";
  const petalCount = options.petalCount ?? Math.floor(between(random, 4, 10));
  const layerCount = Math.floor(between(random, 1, 4));
  const baseRotation = between(random, 0, TAU);
  const outline = options.outline ?? (darkBackground ? "#f7f1e8" : "#fffaf2");
  const layers = [];

  for (let layer = 0; layer < layerCount; layer += 1) {
    const progress = layer / Math.max(1, layerCount - 1);
    layers.push({
      count: petalCount,
      shape: pick(random, PETAL_SHAPES),
      radius: between(random, 0.3, 0.39) * (1 - progress * 0.23),
      width: between(random, 0.13, 0.21) * (1 - progress * 0.18),
      innerRadius: between(random, 0.055, 0.12) + progress * 0.018,
      rotation: baseRotation + progress * Math.PI / petalCount,
      color: colorAt(palette, layer),
      accent: colorAt(palette, layer + 2),
      outlineWidth: between(random, 0.008, 0.018)
    });
  }

  return {
    kind: "rosa",
    version: VERSION,
    seed: normalizedSeed,
    background,
    outline,
    center: {
      radius: between(random, 0.07, 0.13),
      color: colorAt(palette, layerCount + 1),
      ringColor: colorAt(palette, layerCount + 2),
      ringWidth: between(random, 0.012, 0.026),
      dots: random() > 0.48 ? petalCount : 0
    },
    layers,
    speckles: random() > 0.72
  };
}

function tracePetal(context, layer) {
  const start = layer.innerRadius;
  const end = layer.radius;
  const half = layer.width / 2;
  context.beginPath();
  context.moveTo(start, 0);

  if (layer.shape === "pointed") {
    context.quadraticCurveTo(end * 0.62, -half, end, 0);
    context.quadraticCurveTo(end * 0.62, half, start, 0);
  } else if (layer.shape === "heart") {
    context.bezierCurveTo(end * 0.36, -half * 1.1, end * 0.92, -half, end * 0.88, 0);
    context.bezierCurveTo(end * 0.92, half, end * 0.36, half * 1.1, start, 0);
  } else if (layer.shape === "diamond") {
    context.lineTo(end * 0.64, -half);
    context.lineTo(end, 0);
    context.lineTo(end * 0.64, half);
    context.closePath();
  } else {
    context.bezierCurveTo(end * 0.42, -half * 1.15, end, -half * 0.78, end, 0);
    context.bezierCurveTo(end, half * 0.78, end * 0.42, half * 1.15, start, 0);
  }
}

function drawLayer(context, layer, outline) {
  for (let petal = 0; petal < layer.count; petal += 1) {
    context.save();
    context.rotate(layer.rotation + (petal * TAU) / layer.count);
    tracePetal(context, layer);
    context.fillStyle = layer.color;
    context.fill();
    context.lineWidth = layer.outlineWidth;
    context.strokeStyle = outline;
    context.stroke();

    context.beginPath();
    context.moveTo(layer.innerRadius * 1.2, 0);
    context.quadraticCurveTo(layer.radius * 0.55, 0, layer.radius * 0.78, 0);
    context.lineWidth = layer.outlineWidth * 0.55;
    context.strokeStyle = layer.accent;
    context.globalAlpha = 0.7;
    context.stroke();
    context.restore();
  }
}

function drawCenter(context, flower) {
  const center = flower.center;
  context.beginPath();
  context.arc(0, 0, center.radius, 0, TAU);
  context.fillStyle = center.color;
  context.fill();
  context.lineWidth = center.ringWidth;
  context.strokeStyle = center.ringColor;
  context.stroke();

  if (center.dots > 0) {
    const dotRadius = center.radius * 0.12;
    for (let dot = 0; dot < center.dots; dot += 1) {
      const angle = (dot * TAU) / center.dots;
      context.beginPath();
      context.arc(Math.cos(angle) * center.radius * 0.58, Math.sin(angle) * center.radius * 0.58, dotRadius, 0, TAU);
      context.fillStyle = center.ringColor;
      context.fill();
    }
  }
}

function drawSpeckles(context, flower) {
  if (!flower.speckles) return;
  const random = randomFrom(hashSeed(`${flower.seed}|speckles`));
  context.fillStyle = flower.outline;
  context.globalAlpha = 0.42;
  for (let index = 0; index < 18; index += 1) {
    const angle = random() * TAU;
    const radius = between(random, 0.41, 0.47);
    context.beginPath();
    context.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, between(random, 0.003, 0.008), 0, TAU);
    context.fill();
  }
  context.globalAlpha = 1;
}

/** Render a seed or pre-generated blueprint to a square HTML canvas. */
export function render(canvas, seedOrFlower, options = {}) {
  if (!canvas || typeof canvas.getContext !== "function") {
    throw new TypeError("Rosa.render expects a canvas-like object");
  }

  const flower = seedOrFlower?.kind === "rosa" ? seedOrFlower : generate(seedOrFlower, options);
  const size = Math.max(16, Math.min(4096, Math.round(options.size ?? canvas.width ?? 256)));
  const pixelRatio = Math.max(1, Math.min(4, Number(options.pixelRatio ?? 1)));
  const pixels = Math.round(size * pixelRatio);
  canvas.width = pixels;
  canvas.height = pixels;

  if (canvas.style && options.resizeCss !== false) {
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Rosa could not get a 2D canvas context");
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, size, size);
  context.fillStyle = flower.background;
  context.fillRect(0, 0, size, size);
  context.save();
  context.translate(size / 2, size / 2);
  context.scale(size, size);
  drawSpeckles(context, flower);
  flower.layers.forEach((layer) => drawLayer(context, layer, flower.outline));
  drawCenter(context, flower);
  context.restore();
  return flower;
}

export const rosa = Object.freeze({ version: VERSION, generate, render });
export default rosa;
