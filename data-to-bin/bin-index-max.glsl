/**
 * Scatters the data into its bin index, as the maximum channel value.
 */

float binIndexMax(in vec4 data) {
    return max(data[0], max(data[1], max(data[2], data[3])));
}

float binIndexMax(in vec4 data, in vec4 mask, in vec3 split, in float index,
        in float count) {
    return binIndexMax(data*mask);
}

#pragma glslify: export(binIndexMax);
