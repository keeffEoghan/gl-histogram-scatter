precision highp float;

uniform sampler2D test;
uniform sampler2D histogram;
uniform float valueMin;
uniform float fade;
uniform float bars;
uniform float scale;

varying vec2 uv;

const vec4 barIn = vec4(0, 0, 0, 1);
const vec4 barOut = vec4(0, 0, 1, 0.2);

void main() {
    // @todo Not sure why this needs to be flipped but it does.
    vec2 st = vec2(uv.x, 1.0-uv.y);
    vec4 pixel = texture2D(test, st);

    gl_FragColor = pixel;

    vec4 bin = texture2D(histogram, st)*scale;
    // vec4 bin = log(texture2D(histogram, st)+scale);
    // vec4 bin = pow(texture2D(histogram, st), vec4(scale));

    vec4 bar = mix(barOut, barIn, step(uv.y, bin.r+bin.g+bin.b+bin.a));

    gl_FragColor = mix(clamp(pixel, 0.0, 1.0),
        mix(clamp(bin, 0.0, 1.0), clamp(bar, 0.0, 1.0), bars),
        fade);
}
