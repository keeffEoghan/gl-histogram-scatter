# `gl-histogram-scatter`

WebGL histograms, highly parallel scatter approach using vertex shader samples, based on [AMD's _Efficient Histogram Generation Using Scattering on GPUs_](https://developer.amd.com/wordpress/media/2012/10/GPUHistogramGeneration_preprint.pdf) - BYORenderer (based on [`regl`](https://github.com/regl-project/regl/)).

Allows custom operations for histogram heuristics.

**Requires at least 1 [`MAX_VERTEX_TEXTURE_IMAGE_UNITS`](https://webglstats.com/webgl/parameter/MAX_VERTEX_TEXTURE_IMAGE_UNITS).**

## Usage

[See the demo](https://keeffeoghan.github.io/gl-histogram-scatter) and [its source code](./example/).
