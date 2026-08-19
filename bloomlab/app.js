import { generate, render } from "../rosa/src/index.js";

const canvas = document.querySelector("#flower");
const form = document.querySelector("#seed-form");
const input = document.querySelector("#seed");
const specimenName = document.querySelector("#specimen-name");
const blueprint = document.querySelector("#blueprint");
const grid = document.querySelector("#flower-grid");
const toast = document.querySelector("#toast");
const words = ["velvet", "solar", "moss", "honey", "lunar", "wild", "coral", "quiet"];
const flowers = ["aster", "dahlia", "poppy", "cosmos", "zinnia", "lotus", "clover", "peony"];
let batch = 0;
let toastTimer;

function randomSeed() {
  const values = new Uint32Array(2);
  crypto.getRandomValues(values);
  return `${words[values[0] % words.length]}-${flowers[values[1] % flowers.length]}-${(values[0] ^ values[1]).toString(36).slice(0, 4)}`;
}

function currentSeed() {
  return input.value.trim() || "rosa";
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
}

function updateUrl(seed) {
  const url = new URL(location.href);
  url.searchParams.set("seed", seed);
  history.replaceState(null, "", url);
}

function bloom(seed, syncUrl = true) {
  input.value = seed;
  const flower = generate(seed);
  render(canvas, flower, { size: 720, pixelRatio: 1 });
  specimenName.textContent = flower.seed;
  blueprint.textContent = JSON.stringify(flower, null, 2);
  if (syncUrl) updateUrl(seed);
}

function renderVariants(reset = false) {
  if (reset) batch = 0;
  grid.replaceChildren();
  const root = currentSeed();
  for (let index = 0; index < 6; index += 1) {
    const seed = `${root}/${batch * 6 + index + 1}`;
    const card = document.createElement("button");
    const preview = document.createElement("canvas");
    card.type = "button";
    card.className = "flower-card";
    card.title = seed;
    render(preview, seed, { size: 160, pixelRatio: 1 });
    card.append(preview);
    card.addEventListener("click", () => {
      bloom(seed);
      renderVariants(true);
    });
    grid.append(card);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  bloom(currentSeed());
  renderVariants(true);
});

document.querySelector("#surprise").addEventListener("click", () => {
  bloom(randomSeed());
  renderVariants(true);
});

document.querySelector("#refresh-grid").addEventListener("click", () => {
  batch += 1;
  renderVariants();
});

document.querySelector("#download").addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  render(exportCanvas, currentSeed(), { size: 1024, pixelRatio: 1 });
  const safeSeed = currentSeed().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").slice(0, 60) || "rosa";
  const link = document.createElement("a");
  link.download = `rosa-${safeSeed}.png`;
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
  notify("Exported 1024 × 1024 PNG");
});

const initialSeed = new URL(location.href).searchParams.get("seed") || "midnight-marigold";
bloom(initialSeed, false);
renderVariants();
