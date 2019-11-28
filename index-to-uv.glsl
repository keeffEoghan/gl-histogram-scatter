vec2 one = vec2(1.0);

vec2 indexToUV(in float index, in vec2 shape) {
    return vec2(mod(index, shape.x), floor(index/shape.x))/(shape.xy-one);
}

vec2 indexToUV(in float index, in vec2 shape, in float count) {
    return indexToUV(index, shape);
}

#pragma glslify: export(indexToUV);
