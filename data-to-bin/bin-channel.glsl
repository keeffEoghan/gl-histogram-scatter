/**
 * Scatters the data into its bin channel index (splitting into "local histogram" for
 * higher precision in limited-size data types).
 */

float binChannel(in float index, in float splitChannels) {
    return mod(index, splitChannels);
}

float binChannel(in vec4 data, in vec4 mask, in vec3 split, in float index,
        in float count) {
    return binChannel(index, split.z);
}

#pragma glslify: export(binChannel);
