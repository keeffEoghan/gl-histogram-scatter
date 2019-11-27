/**
 * Scatters the data into its bin applied to `gl_Position`, with:
 * - x: bin index (along x-axis).
 * - y: bin data-scaled row index (along y-axis).
 * - z: bin channel index.
 * - w: 1
 */

// The following may be overriden by macros to mix in other functions into this logic.

#ifndef binIndex
    #pragma glslify: binIndex = require('./bin-index-max');
#endif

#ifndef binRow
    #pragma glslify: binRow = require('./bin-row');
#endif

#ifndef binChannel
    #pragma glslify: binChannel = require('./bin-channel');
#endif

#ifndef binW
    #pragma glslify: binW = require('./bin-w');
#endif


vec4 dataToBin(in vec4 data, in vec4 mask, in vec3 split, in float index,
        in float count) {
    return vec4(
        binIndex(data, mask, split, index, count),
        binRow(data, mask, split, index, count),
        binChannel(data, mask, split, index, count),
        binW(data, mask, split, index, count)
    );
}

#pragma glslify: export(dataToBin);
