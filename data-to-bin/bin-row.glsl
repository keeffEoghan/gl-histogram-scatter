/**
 * Scatters the data into its bin data-scaled row index (splitting into "local
 * histogram" for higher precision in limited-size data types).
 */

float binRow(in float index, in float splitRow) {
    return mod(index, splitRow);
}

float binRow(in vec4 data, in vec4 mask, in vec3 split, in float index,
        in float count) {
    return binRow(index, split.y);
}

#pragma glslify: export(binRow);
