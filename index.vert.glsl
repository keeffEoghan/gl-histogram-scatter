precision highp float;

// Output the normal bin data.
#define outputBins 0

// For these tests to work, the framebuffer shape should be same as the `data` shape,
// instead of `split.xy`.
#define outputTestRead 1
#define outputTestBins 2

// Switch the output mode.
#define outputMode outputBins

attribute float index;

uniform sampler2D data;
uniform vec2 shape;
uniform vec4 mask;

uniform vec3 split;
uniform float count;
uniform float valueMin;

varying vec4 color;

#pragma glslify: map = require('glsl-map');

// The following may be overriden by macros to mix in other functions into this logic.

#ifndef indexToUV
    #pragma glslify: indexToUV = require('./index-to-uv');
#endif

#ifndef dataToBin
    #pragma glslify: dataToBin = require('./data-to-bin');
#endif

#ifndef dataToColor
    #pragma glslify: dataToColor = require('./data-to-color');
#endif

const float pointSize = 1.0;

// Ranges for mapping.
vec4 rangeBin = vec4(vec2(0), vec2(1));
vec2 sizeNDC = vec2(1.0)-(pointSize/split.xy);
vec4 rangeNDC = vec4(-sizeNDC, sizeNDC);

void main() {
    // Maps a vertex index to a data texture lookup UV.
    vec2 uv = vec2(indexToUV(index, shape, count));
    vec4 pixel = texture2D(data, uv);

    // Maps a pixel of data to a vertex output `bin`.
    vec4 bin = vec4(dataToBin(pixel, mask, split, index, count));

    #if outputMode == outputBins
        // Maps the vertex output `bin` to a point colour.
        color = vec4(dataToColor(pixel, bin, valueMin,
            mask, split, index, count));

        // Map from bin coordinates to NDC less point pixels size.
        vec2 xy = map(bin.xy, rangeBin.xy, rangeBin.zw, rangeNDC.xy, rangeNDC.zw);

        // Output the vertex position and size.
        gl_Position = vec4(xy, bin.zw);
    #else
        #if outputMode == outputTestRead
            // Output the data read, for testing.
            color = pixel;
        #elif outputMode == outputTestBins
            // Output the derived bin, for testing.
            color = bin;
        #endif

        gl_Position = vec4(map(uv, rangeBin.xy, rangeBin.zw, rangeNDC.xy, rangeNDC.zw),
            0, 1);
    #endif

    gl_PointSize = pointSize;
}
