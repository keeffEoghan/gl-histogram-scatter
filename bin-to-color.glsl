// Sets only the selected channel to the given colour value.

const ivec4 channelIndeces = ivec4(0, 1, 2, 3);

vec4 binToColor(in float channelIndex) {
    return vec4(equal(ivec4(int(channelIndex)), channelIndeces));
}

vec4 binToColor(in float channelIndex, in float value) {
    return binToColor(channelIndex)*value;
}


// These tie in with the values encoded by `./data-to-bin`.

vec4 binToColor(in vec4 bin) {
    return binToColor(bin.z);
}

vec4 binToColor(in vec4 bin, in float value) {
    return binToColor(bin.z, value);
}

#pragma glslify: export(binToColor);
