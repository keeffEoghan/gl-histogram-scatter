# `gl-histogram-scatter`

WebGL histograms, parallel scatter approach using vertex shader samples, based on [AMD's _Efficient Histogram Generation Using Scattering on GPUs_](https://developer.amd.com/wordpress/media/2012/10/GPUHistogramGeneration_preprint.pdf) - BYORenderer (based on [`regl`](https://github.com/regl-project/regl/)).

Allows custom operations for histogram heuristics.

**Requires at least 1 [`MAX_VERTEX_TEXTURE_IMAGE_UNITS`](https://webglstats.com/webgl/parameter/MAX_VERTEX_TEXTURE_IMAGE_UNITS).**

## Installation

Install from [`npm`](https://www.npmjs.com/package/@epok.tech/gl-histogram-scatter) using:
```bash
npm install @epok.tech/gl-histogram-scatter
```
or:
```bash
yarn add @epok.tech/gl-histogram-scatter
```

## Usage

[See the demo](https://keeffeoghan.github.io/gl-histogram-scatter) and [its source code](https://github.com/keeffEoghan/gl-histogram-scatter/tree/master/example).
