# Notes

## To-do

- Look into the alternative method of _"rendering the input image pixels into a vertex buffer [Scheuermann 2006]"_ as mentioned in the paper.
    - Try rendering state data directly into a vertex attribute buffer, alongside or instead of texture uniform?
        - Would remove need for texture sampling in cases where the calculations only need the local data lookup.
        - [Updating buffer dynamically/streaming](https://github.com/regl-project/regl/blob/gh-pages/API.md#buffer-subdata).
        - [Reading from FBO into buffer](https://github.com/regl-project/regl/blob/gh-pages/API.md#reading-pixels).
