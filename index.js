import { map, range } from '@epok.tech/array-utils';

import defaultVert from './index.vert.glsl';
import defaultFrag from './index.frag.glsl';

export const optionalExtensions = ['OES_texture_half_float', 'OES_texture_float'];

export const bitSize = 2;
export const byteSize = 8;

/**
 * Gives the range of values available for a given data scale.
 *
 * @see dataBytesMap
 *
 * @param {number} splitData Number of bytes in the data type - see `dataBytesMap`.
 * @returns {number} The number of values in the data type.
 */
export const maxForBytes = (bytes) => bitSize**(byteSize*bytes);

/**
 * Map from texture data type to the number of bytes they have.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#TypedArray_objects
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
 * @see https://github.com/regl-project/regl/blob/gh-pages/API.md#texture-constructor
 *
 * @type {object.<number>}
 */
export const valueMinMap = {
    // Float types (should usually be large enough)
    ['float']: 1/maxForBytes(4),
    ['float32']: 1/maxForBytes(4),
    ['half float']: 1/maxForBytes(2),
    ['float16']: 1/maxForBytes(2),

    // Integer types (may need more scaling...)
    ['uint32']: 1/maxForBytes(4),
    ['uint16']: 1/maxForBytes(2),
    ['uint8']: 1/maxForBytes(1)
};

/**
 * Map from texture data type to how many multiples of it should be made to get enough
 * precision. 1 means no scaling. Assumes 4 is the most scaling needed, could be more.
 *
 * @see valueMinMap
 *
 * @type {object.<number>}
 */
export const splitDataMap = {
    max: 4,
    min: 1,

    // Float types (should usually be large enough)
    ['float']: 1,
    ['float32']: 1,
    ['half float']: 2,
    ['float16']: 2,

    // Integer types (may need more scaling...)
    ['uint32']: 1,
    ['uint16']: 2,
    ['uint8']: 4
};

/**
 * Map from alpha type to the right additive alpha blending - [tips](https://limnu.com/webgl-blending-youre-probably-wrong/).
 *
 * @type {object}
 */
export const blendMap = {
    separatedAlpha: {
        enable: true,
        func: {
            srcRGB: 'src alpha',
            srcAlpha: 1,
            dstRGB: 'one minus src alpha',
            dstAlpha: 'one minus src alpha'
        },
        equation: 'add'
    },
    premultpliedAlpha: {
        enable: true,
        func: { src: 1, dst: 'one minus src alpha' },
        equation: 'add'
    },
    normal: {
        enable: true,
        func: { src: 1, dst: 'one minus src alpha' },
        equation: 'add'
    },
    additive: {
        enable: true,
        func: { src: 1, dst: 1 },
        equation: 'add'
    }
};

export const defaultBlend = blendMap.additive;

/**
 * The minimum alpha we can blend unique values over each other for the data type,
 * without saturating the bins or losing precision.
 *
 * @see valueMinMap
 *
 * @param {object.<(number | object.<array.<object.<number>>>)>} props Properties.
 * @param {number} [props.valueMin] Explicitly-set minimum value; derived if not given.
 * @param {number} [props.bins.color[0].type] Height of the `bins` output framebuffer.
 *
 * @returns {number} The count as derived from the given properties.
 */
export const getValueMin = ({ bins: { color: c }, valueMin }) =>
    (valueMin || valueMinMap[c[0].type]);

/**
 * The number of vertices to be drawn, derived by default from the number of pixels in
 * the input texture unless overridden.
 *
 * @param {object.<object.<[number], [number]>, [number]>} props Properties.
 * @param {number} [props.count] Explicitly-set count, if given - derived otherwise.
 * @param {number} [props.data.width] Width of the `data` input texture.
 * @param {number} [props.data.height] Height of the `data` input texture.
 *
 * @returns {number} The count as derived from the given properties.
 */
export const getCount = ({ data, count }) =>
    (count || (data && (data.width*data.height)) || 0);

/**
 * Update the indexes buffer if the count has increased - if it's less or equal, the
 * old buffer will be fine, not all its indexes are drawn.
 *
 * @param {object.<buffer, ...>} props Properties.
 * @param {buffer} props.in Properties.
 */
export function getIndexes(api, props, cache) {
    const { buffer } = api;
    const { data, indexes = buffer({ usage: 'dynamic' }) } = props;
    const { count: past = 0 } = cache;
    const count = cache.count = getCount(props);

    /** @todo Rather than a full reinitialisation, [use partial buffer subdata](https://github.com/regl-project/regl/blob/gh-pages/API.md#buffer-subdata). */
    return ((past >= count)? indexes : indexes(map((v, i) => i, range(count), 0)));
}

/**
 * @todo Use `gl_MaxVertexTextureImageUnits` in vertex shader?
 * @todo Try rendering past image directly into a vertex attribute buffer, alongside
 *     or instead of texture uniform?
 */
export function getHistogram(api, state, out = {}) {
    const { gl = api, prop, buffer } = api;

    const {
            // Aliases for the same value:
            MAX_VERTEX_TEXTURE_IMAGE_UNITS: maxA,
            maxVertexTextureImageUnits: maxB,
            maxVertexTextureUnits = (maxA || maxB)
        } = (api.limits || api);

    (maxVertexTextureUnits ||
        console.warn('`gl-histogram-scatter`: need at least 1 vertex texture unit ('+
            '`MAX_VERTEX_TEXTURE_IMAGE_UNITS`)',
            maxVertexTextureUnits));

    out = (out || state);

    const cache = {
        split: [0, 0, 0],
        shape: [0, 0],
        count: 0
    };

    const {
            vert = defaultVert,
            frag = defaultFrag,

            data,
            // A `vec4` mask to turn on or off channels read from the data texture.
            mask = [1, 1, 1, 1],

            // How many distinct values are measured in the histogram framebuffer, or
            // a full framebuffer.
            bins = 2**8,
            indexes = getIndexes(api, state, cache),
            blend = defaultBlend,
            primitive = 'points',

            // How many divisions within a bin may be used to increase the accuracy
            // of the histogram's blended result.
            splitChannels = 4
        } = state;

    out.vert = vert;
    out.frag = frag;
    out.data = data;
    out.mask = mask;
    out.indexes = indexes;
    out.blend = blend;
    out.primitive = primitive;
    out.splitChannels = splitChannels;

    if(isNaN(bins)) {
        // Assume a provided framebuffer.
        out.bins = bins;
    }
    else {
        // Or values we can create one from with as much precision as available.
        const { texture, framebuffer, hasExtension } = api;

        const {
                dataType = ((hasExtension('OES_texture_float'))? 'float'
                    : ((hasExtension('OES_texture_half_float'))? 'half float'
                    :   'uint8')),

                // How many rows of bins may be used to extend the accuracy of the
                // histogram's blended result in limited data types.
                splitData = (splitDataMap[dataType] || 1),

                // How many channels to creat in the framebuffer - by default, at least the
                // number we may split values across, for a valid framebuffer attachment.
                channels = Math.max(splitChannels, 3)
            } = state;

        out.bins = framebuffer({
            color: texture({
                width: bins,
                // Scale the rows of bins as needed to compensate for size of data type.
                height: splitData,
                colorType: dataType,
                channels
            }),
            depth: false,
            stencil: false
        });
    }

    const command = out.command = {
        vert: prop('vert'),
        frag: prop('frag'),
        attributes: { index: (c, props) => getIndexes(api, props, cache) },
        uniforms: {
            data: prop('data'),
            mask: prop('mask'),
            count: (c, props) => getCount(props),
            split: (c, { bins: { width: w, height: h }, splitChannels: z, split }) => {
                if(!split) {
                    ({ split } = cache);

                    split[0] = w;
                    split[1] = h;
                    split[2] = z;
                }

                return split;
            },
            shape: (c, { data: { width: w, height: h }, shape }) => {
                if(!shape) {
                    ({ shape } = cache);

                    shape[0] = w;
                    shape[1] = h;
                }

                return shape;
            },
            valueMin: (c, props) => getValueMin(props)
        },
        blend,
        primitive: prop('primitive'),
        depth: { enable: false },
        count: (c, props) => getCount(props),
        framebuffer: prop('bins')
    };

    if(typeof gl === 'function') {
        const draw = gl(command);

        out.draw = (props = out) => draw(props);
    }

    return out;
}

export default getHistogram;
