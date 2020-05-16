// Sets only the selected channel to the given colour value.

const ivec4 channelIndeces = ivec4(0, 1, 2, 3);

float colorChannel(in float index, in float splitChannels) {
    return mod(index, splitChannels);
}

vec4 dataToColor(in float channelIndex) {
    return vec4(equal(ivec4(int(channelIndex)), channelIndeces));
}

vec4 dataToColor(in float channelIndex, in float value) {
    return dataToColor(channelIndex)*value;
}

vec4 dataToColor(in float index, in vec3 split) {
    return dataToColor(colorChannel(index, split.z));
}

vec4 dataToColor(in float index, in vec3 split, in float value) {
    return dataToColor(colorChannel(index, split.z), value);
}

vec4 dataToColor(in vec4 data, in vec4 bin, in float value,
        in vec4 mask, in vec3 split, in float index, in float count) {
    return dataToColor(colorChannel(index, split.z), value);
}

#pragma glslify: export(dataToColor);
