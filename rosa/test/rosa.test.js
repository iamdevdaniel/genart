import test from "node:test";
import assert from "node:assert/strict";
import { generate, render } from "../src/index.js";

test("a seed always creates the same blueprint", () => {
  assert.deepEqual(generate("marigold-42"), generate("marigold-42"));
});

test("different seeds create different blueprints", () => {
  assert.notDeepEqual(generate("marigold-42"), generate("marigold-43"));
});

test("the blueprint is JSON serializable", () => {
  const flower = generate("portable");
  assert.deepEqual(JSON.parse(JSON.stringify(flower)), flower);
});

test("explicit constraints are respected", () => {
  const flower = generate("custom", {
    background: "#000000",
    outline: "#ffffff",
    palette: ["#111111", "#222222", "#333333"],
    petalCount: 7
  });
  assert.equal(flower.background, "#000000");
  assert.equal(flower.outline, "#ffffff");
  assert.ok(flower.layers.every((layer) => layer.count === 7));
});

test("render always produces a square canvas", () => {
  const noop = () => {};
  const context = {
    arc: noop,
    beginPath: noop,
    bezierCurveTo: noop,
    clearRect: noop,
    closePath: noop,
    fill: noop,
    fillRect: noop,
    lineTo: noop,
    moveTo: noop,
    quadraticCurveTo: noop,
    restore: noop,
    rotate: noop,
    save: noop,
    scale: noop,
    setTransform: noop,
    stroke: noop,
    translate: noop
  };
  const canvas = { width: 300, height: 120, style: {}, getContext: () => context };

  render(canvas, "square-law", { size: 384, pixelRatio: 2 });

  assert.equal(canvas.width, 768);
  assert.equal(canvas.height, 768);
  assert.equal(canvas.style.width, "384px");
  assert.equal(canvas.style.height, "384px");
});
