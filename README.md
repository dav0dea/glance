# glance

Many plots, one WebGL2 canvas.

glance maps points and image data onto a canvas as fast as the GPU takes an upload. A page with
thirty small charts usually pays thirty times for a canvas commit, a path build and a main-thread
task. glance pays once: every plot is a rectangle and a GPU buffer, a new frame is a buffer upload,
and one animation frame draws every visible plot.

```ts
import { createSurface } from 'glance';

const surface = createSurface(canvas); // throws without WebGL2
surface.setView({ x: 0, y: 0, zoom: 1, width, height, dpr: devicePixelRatio });

const line = surface.addLine();
line.setRect(20, 20, 320, 160);
line.push({ rows: [samples] });
```

It owns pixels and nothing else: no data sources, no sockets, no DOM, no text, no dependencies.
What a plot shows, when it updates and how it is labelled are yours.

## Install

```sh
npm install github:dav0dea/glance
```

The package builds `dist/` (ES modules and declarations) on install.

## The surface

`setView` takes the pane in CSS pixels, a camera in world units and the device pixel ratio. Every
plot's rect is in world units, so a host with a pan-and-zoom canvas moves the camera and the plots
follow; a host without one passes `zoom: 1` and `x = y = 0`. Plots outside the pane are culled, a
lost context is restored, and overlapping plots draw in `setOrder(z)` order.

## Line plots

```ts
line.setBackground('#111111');
line.setSettings({ logX, logY, yAuto, yMin, yMax, points });
line.push({ rows: [Float32Array, ...], xs?, base? });
line.range();  // { xMin, xMax, yMin, yMax, scalar }: the numbers for your own labels
line.clear();  // background alone until the next push
line.remove();
```

Every row is one series, and every series is one instanced draw of line segments. A single row of
length 1 is a scalar: a bar at `x = value` over a running range. Rows of interleaved min/max pairs
with two `xs` per pair draw as the band they describe, so a decimated signal keeps its envelope.

The grid follows the window: 1-2-5 steps on a linear axis, decades with fainter mantissa lines on
a log axis, each axis on its own.

Series colours are procedural. `seriesColor(i)` takes the hue that bisects the widest arc left by
the series before it, at one OKLCH lightness and chroma per ring of eight, so any count stays
distinct and a series keeps its colour when more are added. Use it for your legends.

## Image plots

```ts
const image = surface.addImage();
image.setSettings({ lut: Uint8Array /* 256×3 */, stretch });
image.push({ values, width, height, channels, lo, hi });
```

One channel goes through the LUT, two draw as red and green, three as RGB, four as RGBA. An image
keeps its aspect ratio inside its rect unless `stretch` is set.

## Develop

```sh
npm install
npm test      # the pure parts: rects, windows, grids, layout, palette
npm run check
npm run build
```

MIT.
