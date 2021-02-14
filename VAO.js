export class VertexAttributeAttachment {
    constructor(buffer, location, size, type, stride, offset) {
        this.buffer = buffer;
        this.location = location;
        this.size = size;
        this.type = type;
        this.stride = stride;
        this.offset = offset;
    }

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    attach(gl) {
        gl.enableVertexAttribArray(this.location);
        gl.vertexAttribPointer(this.location, this.size, this.type, false, this.stride, this.offset)
    }
}

export default class VAO {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl) {
        this.gl = gl;
        this.ptr = gl.createVertexArray();
    }

    bind() {
        this.gl.bindVertexArray(this.ptr);
    }

    attach(attachments, indices) {
        this.bind();
        for (let attachment of attachments) {
            attachment.attach(this.gl);
        }
        if(indices) indices.bind();
    }
}