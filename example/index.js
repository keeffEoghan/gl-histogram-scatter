// Any rendering library, but made with `regl` in mind.
import getRegl from 'regl';
import positions from '@epok.tech/gl-screen-triangle';

import { getHistogram, optionalExtensions } from '../';

import vert from '@epok.tech/gl-screen-triangle/uv-texture.vert.glsl';

const regl = getRegl({ optionalExtensions });

const framebuffer = regl.framebuffer();

const drawTest = regl({
    vert,
    frag: `
        precision highp float;

        uniform float tick;

        varying vec2 uv;

        void main() {
            gl_FragColor = vec4(sin(tick*0.02),
                floor(uv*10.0)/10.0,
                //uv,
                0.7+(cos(tick*0.03)*0.3));
                //1.0);
        }
    `,
    attributes: { position: positions },
    uniforms: { tick: regl.context('tick') },
    count: positions.length/2,
    framebuffer
});

const histogram = self.histogram = getHistogram(regl, {
        data: framebuffer,
        dataScale: 1,
        // colorMin: 1,
        // colorMin: 0.1,
        colorMin: 128,
        // colorMin: 255,
        mask: [1, 1, 1, 1],
        overChannels: 4
    },
    0);

const drawView = regl({
    vert,
    frag: `
        precision highp float;

        uniform sampler2D test;
        uniform sampler2D histogram;
        uniform float overChannels;
        uniform float limit;
        uniform float bars;

        varying vec2 uv;

        void main() {
            vec4 c;

            if(uv.y < limit) {
                vec2 st = vec2(uv.x, uv.y/limit);

                c = texture2D(histogram, st);

                if(bool(bars)) {
                    float bar = step(st.y, (c.r+c.g+c.b+c.a)/overChannels);

                    c = mix(vec4(0, 0, 1, 0.2), vec4(0, 0, 0, 1), bar);
                }
            }
            else {
                c = texture2D(test, vec2(uv.x, (uv.y-limit)/(1.0-limit)));
            }

            gl_FragColor = c;
        }
    `,
    attributes: { position: positions },
    uniforms: {
        test: regl.prop('framebuffer'),
        histogram: regl.prop('histogram.bins'),
        overChannels: regl.prop('histogram.overChannels'),
        limit: regl.prop('limit'),
        bars: regl.prop('bars')
    },
    count: positions.length/2
});

const viewProps = self.viewProps = {
    histogram,
    framebuffer,
    limit: 0.5,
    bars: 0
};

const clear = {
    view: { color: [0, 0, 0, 0], depth: 1 },
    framebuffer: { color: [0, 0, 0, 0], depth: 1, framebuffer },
    histogram: { color: [0, 0, 0, 0], depth: 1, framebuffer: histogram.bins }
};

function frame({ drawingBufferWidth: w, drawingBufferHeight: h }) {
    framebuffer.resize(w, h);
    // histogram.bins.resize(w, h);

    regl.clear(clear.framebuffer);
    regl.clear(clear.histogram);
    regl.clear(clear.view);

    drawTest();
    histogram.draw();
    drawView(viewProps);
}

function pollFrame() {
    regl.poll();
    regl.draw(frame);
}

document.addEventListener('mousemove', ({ clientY }) =>
    viewProps.limit = Math.max(0, 1-Math.min(clientY/innerHeight, 1)));

document.addEventListener('click', () => viewProps.bars = (!viewProps.bars) | 0);

regl.frame(frame);
