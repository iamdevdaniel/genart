# Rosa

Rosa is a small, zero-dependency library that draws deterministic flower avatars on an HTML canvas.

A flower starts with a seed. A seed can be a username, database ID, email, or any other value. The same seed and options produce the same flower when using the same Rosa version.

## How it works

Rosa has two steps:

1. `generate(seed)` converts the seed into a flower blueprint.
2. `render(canvas, flower)` draws the blueprint on a square canvas.

The blueprint is plain JSON data. It contains the colors, petal shapes, petal count, layers, center, and background. It can be saved and rendered again later.

Rosa does not manage UI, files, storage, URLs, or user input. Those belong to the application using it.

## Basic use

```js
import { render } from "@genart/rosa";

const canvas = document.querySelector("canvas");

render(canvas, "user-1837", {
  size: 256,
  pixelRatio: 2
});
```

Rosa sets the canvas width and height to the same value. `size: 256` with `pixelRatio: 2` creates a `512 × 512` canvas displayed at `256 × 256` CSS pixels.

## Generate first, render later

```text
seed = current user's ID
flower = Rosa.generate(seed)

save flower as JSON

later:
  canvas = find canvas element
  Rosa.render(canvas, flower, size = 256)
```

JavaScript example:

```js
import { generate, render } from "@genart/rosa";

const flower = generate("user-1837");
const json = JSON.stringify(flower);

render(canvas, JSON.parse(json), { size: 256 });
```

## Custom generation

```text
flower = generate(seed, {
  background: "#f5efe3",
  outline: "#ffffff",
  palette: ["#e63946", "#ffb703", "#2a9d8f"],
  petalCount: 6
})
```

Generation options:

- `background`: canvas background color.
- `outline`: petal outline color.
- `palette`: array containing at least three colors.
- `petalCount`: number of petals in each layer.

If an option is omitted, Rosa chooses it from the seed.

## Render options

- `size`: square size in CSS pixels, from 16 to 4096.
- `pixelRatio`: output scale, from 1 to 4. Use `2` for a sharper image.
- `resizeCss`: set to `false` to avoid changing the canvas CSS width and height.

`render` accepts either a seed or an existing blueprint:

```js
render(canvas, "user-1837", { size: 256 });
render(canvas, flower, { size: 256 });
```

## CDN script

The standalone build exposes `Rosa` on `window`:

```html
<canvas id="avatar"></canvas>
<script src="https://unpkg.com/@genart/rosa/dist/rosa.global.js"></script>
<script>
  Rosa.render(document.querySelector("#avatar"), "user-1837", {
    size: 256,
    pixelRatio: 2
  });
</script>
```

Run `npm run build` before publishing to regenerate `dist/rosa.global.js`.

## API

```text
generate(seed, options?) -> Flower
render(canvas, seedOrFlower, options?) -> Flower
```

`render` returns the blueprint it drew. The package has no runtime dependencies.
