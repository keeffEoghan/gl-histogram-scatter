/**
 * Scatters the data into its bin index, as the data's luminance value.
 */

#pragma glslify: binIndex = require('glsl-luma');

float binIndex(in vec4 data, in vec4 mask, in vec3 split, in float index,
        in float count) {
    return binIndex(data*mask);
}

#pragma glslify: export(binIndex);
