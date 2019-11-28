precision highp float;

uniform sampler2D image;
uniform float tick;

varying vec2 uv;

#pragma glslify: noise = require(glsl-noise/simplex/3d)

void main() {
    gl_FragColor = mix(texture2D(image, uv),
        vec4(
            sin((uv.x*tick*0.017)-(uv.y*tick*0.02)),
            floor(uv*10.0)/10.0,
            noise(vec3(uv*3.0, tick*0.02))
        ),
        0.5);
}
