export default class BufferObject {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {ArrayBufferView|ArrayBuffer} buffer 
     * @param {number} type 
     * @param {number} point 
     * @param {number} usage 
     */
    constructor(gl, buffer, point, usage) {
        this.ptr = gl.createBuffer();
        this.gl = gl;
        this.point = point;
        this.usage = usage;
        this.bind();
        gl.bufferData(point, buffer, usage);
    }

    bind() {
        this.gl.bindBuffer(this.point, this.ptr);
    }
}