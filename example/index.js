// Any rendering library, but made with `regl` in mind.
import getRegl from 'regl';
import positions from '@epok.tech/gl-screen-triangle';

import { getHistogram, optionalExtensions } from '../';
import imageSrc from './assets/baboon.png';

import vert from '@epok.tech/gl-screen-triangle/uv-texture.vert.glsl';

import testFrag from './test.frag.glsl';
import viewFrag from './view.frag.glsl';

const regl = getRegl({ optionalExtensions });

const framebuffer = regl.framebuffer();

const img = new Image();
const image = regl.texture();

img.addEventListener('load', () => image(img));
img.src = imageSrc;

const drawTest = regl({
    vert,
    frag: testFrag,
    attributes: { position: positions },
    uniforms: {
        tick: regl.context('tick'),
        image
    },
    count: positions.length/2,
    framebuffer
});

const histogram = self.histogram = getHistogram(regl, {
        data: framebuffer.color[0],
        // mask: [1, 1, 1, 0],
        // splitChannels: 3
    },
    0);

let scale = 1;

const drawView = regl({
    vert,
    frag: viewFrag,
    attributes: { position: positions },
    uniforms: {
        test: regl.prop('framebuffer'),
        histogram: regl.prop('histogram.bins.color[0]'),
        fade: regl.prop('fade'),
        bars: regl.prop('bars')
    },
    count: positions.length/2
});

const viewProps = self.viewProps = {
    histogram,
    framebuffer,
    fade: 0,
    bars: 1
};

const clear = {
    view: { color: [0, 0, 0, 0], depth: 1 },
    framebuffer: { color: [0, 0, 0, 0], depth: 1, framebuffer },
    histogram: { color: [0, 0, 0, 0], depth: 1, framebuffer: histogram.bins }
};

function frame({ drawingBufferWidth: w, drawingBufferHeight: h }) {
    framebuffer.resize(w, h);
    // histogram.bins.resize(w, h);

    histogram.count = Math.round(w*h*scale);

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

document.addEventListener('mousemove', ({ clientX: x, clientY: y }) => {
    viewProps.fade = Math.max(0, Math.min(x/innerWidth, 1));
    scale = (1-(y/innerHeight))**5;

    console.log('fade [input = 0, histogram = 1]:', viewProps.fade, 'scale:', scale);
});

document.addEventListener('click', () => {
    viewProps.bars = ((!viewProps.bars) | 0);

    console.log('bars:', viewProps.bars);
});

regl.frame(frame);
