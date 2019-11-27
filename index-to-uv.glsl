vec2 indexToUV(in float index, in vec2 shape) {
    return vec2(mod(index, shape.x)/(shape.x-1.0), floor(index/shape.x)/(shape.y-1.0));
}

vec2 indexToUV(in float index, in vec2 shape, in float count) {
    return indexToUV(index, shape);
}

#pragma glslify: export(indexToUV);
