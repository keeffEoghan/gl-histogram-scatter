vec2 one = vec2(1.0);

vec2 indexToUV(in float index, in vec2 shape, in float count) {
    float i = index/count*shape.x*shape.y;

    return vec2(mod(i, shape.x), floor(i/shape.x))/(shape.xy-one);
}

#pragma glslify: export(indexToUV);
