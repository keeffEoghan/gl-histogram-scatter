/**
 * Scatters the data into its bin index, as the data's length.
 */

float binIndexLength(in vec4 data) {
    return length(data);
}

float binIndexLength(in vec4 data, in vec4 mask, in vec3 split, in float index,
        in float count) {
    return binIndexLength(data*mask);
}

#pragma glslify: export(binIndexLength);
