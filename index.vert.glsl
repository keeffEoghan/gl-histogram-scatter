precision highp float;

// #define testOutput

attribute float index;

uniform sampler2D data;
uniform vec2 shape;
uniform vec4 mask;

uniform vec3 split;
uniform float count;
uniform float colorMin;

varying vec4 color;

#pragma glslify: map = require('glsl-map');

// The following may be overriden by macros to mix in other functions into this logic.

#ifndef indexToUV
    #pragma glslify: indexToUV = require('./index-to-uv');
#endif

#ifndef dataToBin
    #pragma glslify: dataToBin = require('./data-to-bin');
#endif

#ifndef binToColor
    #pragma glslify: binToColor = require('./bin-to-color');
#endif

const float pointSize = 1.0;

void main() {
    // Ranges for mapping.
    vec4 rangeBin = vec4(vec2(0), vec2(1));
    vec2 sizeNDC = vec2(1.0)-(pointSize/split.xy);
    vec4 rangeNDC = vec4(-sizeNDC, sizeNDC);

    // Maps a vertex index to a data texture lookup UV.
    vec2 uv = vec2(indexToUV(index, shape, count));
    vec4 pixel = texture2D(data, uv);

    #ifndef testOutput
        // Maps a pixel of data to a vertex output `bin`.
        vec4 bin = vec4(dataToBin(pixel, mask, split, index, count));

        // Maps the vertex output `bin` to a point colour.
        color = vec4(binToColor(bin, colorMin));

        // Map from bin coordinates to NDC less point pixels size.
        vec2 posXY = map(bin.xy, rangeBin.xy, rangeBin.zw, rangeNDC.xy, rangeNDC.zw);

        // Output the vertex position and size.
        gl_Position = vec4(posXY, bin.zw);
        gl_PointSize = pointSize;
    #else
        // Output the data read, for testing - for this to work, the framebuffer needs
        // its height set to the size of `data` instead of `split.y`.

        color = pixel;

        gl_Position = vec4(map(uv, rangeBin.xy, rangeBin.zw, rangeNDC.xy, rangeNDC.zw),
            0, 1);
    #endif
}
