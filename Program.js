/** @module gl-matrix */
import {glMatrix, vec2, vec3, vec4, mat3, mat4} from '/node_modules/gl-matrix/esm/index.js';

export default class Program {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {WebGLShader} vert 
     * @param {WebGLShader} frag 
     */
    constructor(gl, vert, frag) {
        this.gl = gl;
        this.ptr = gl.createProgram();
        this.attributes = new Map();
        this.uniforms = new Map();
        gl.attachShader(this.ptr, vert);
        gl.attachShader(this.ptr, frag);
        gl.linkProgram(this.ptr);
        if (!gl.getProgramParameter(this.ptr, gl.LINK_STATUS)) {
            const log = gl.getProgramInfoLog(this.ptr);
            gl.deleteProgram(this.ptr);
            throw new Error(log);
        }
    }

    getAttributeLocation(attribute) {
        return (this.attributes.has(attribute)?this.attributes:this.attributes.set(attribute, this.gl.getAttribLocation(this.ptr, attribute))).get(attribute);
    }

    getUniformLocation(uniform) {
        return (this.uniforms.has(uniform)?this.uniforms:this.uniforms.set(uniform, this.gl.getUniformLocation(this.ptr, uniform))).get(uniform);
    }

    setUniform(uniform, value){
        this.use();
        if (typeof uniform === 'string') uniform = this.getUniformLocation(uniform);
        if (value.length === 4) {
            this.gl.uniform4fv(uniform, value);
        } else if (value.length === 3) {
            this.gl.uniform3fv(uniform, value);
        } else if (value.length === 2) {
            this.gl.uniform2fv(uniform, value);
        } else if (value.length === 16) {
            this.gl.uniformMatrix4fv(uniform, false, value);
        } else if (value.length === 9) {
            this.gl.uniformMatrix3fv(uniform, false, value);
        }
    }

    use() {
        this.gl.useProgram(this.ptr);
    }
}