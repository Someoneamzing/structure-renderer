export default class Texture {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Image} image 
     */
    constructor(gl, image) {
        this.gl = gl;
        this.ptr = gl.createTexture();
        this.bind();
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    bind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.ptr);
    }
}