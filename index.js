import dom from "./handyDOM.js";
/** @module gl-matrix */
import {glMatrix, vec3, mat4, quat, vec4 } from "./node_modules/gl-matrix/esm/index.js";
import BufferObject from './BufferObject.js';
import Program from "./Program.js";
import VAO, { VertexAttributeAttachment } from "./VAO.js";
import Texture from "./Texture.js";
import Cube from "./Cube.js";
import Model from "./Model.js";
import ResourceLocation from "./ResourceLocation.js";
import {loadText, loadImage, loadJSON} from './loaders.js';
window.ResourceLocation = ResourceLocation;

const elements = dom();

/**
 * @type WebGL2RenderingContext
 */
const gl = elements.canvas.getContext('webgl2');

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    elements.canvas.width = window.innerWidth;
    elements.canvas.height = window.innerHeight;
}

resizeCanvas();


function createShader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);

    gl.compileShader(shader);
    const log = gl.getShaderInfoLog(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        gl.deleteShader(shader);
        throw new Error(log);
    }
}

const quad = new Float32Array([
    -1, -1, 1, 0, 0, 1, 0, 1,
    -1, 1, 1, 0, 0, 1, 0, 0,
    1, -1, 1, 0, 0, 1, 1, 1,
    1, 1, 1, 0, 0, 1, 1, 0,
]);

const quadIndices = new Uint16Array([
    0, 1, 2,
    1, 3, 2,
])

const positions = [];
const normals = [];
const uvs = [];

// const cube = new Cube({   "from": [ 0, 0, 0 ],
// "to": [ 16, 16, 16 ],
// "faces": {
//     "down":  { "texture": "#down", "cullface": "down" },
//     "up":    { "texture": "#up", "cullface": "up" },
//     "north": { "texture": "#north", "cullface": "north" },
//     "south": { "texture": "#south", "cullface": "south" },
//     "west":  { "texture": "#west", "cullface": "west" },
//     "east":  { "texture": "#east", "cullface": "east" }
// }
// }, {"#log": "log", "#litlog": "litlog"});

// const {vertices, indices} = cube.bake();

// const vertices = new Float32Array(6 * 4 * 8);

// const indices = new Uint16Array(6 * 6)

// const AXES = [vec3.fromValues(1,0,0), vec3.fromValues(0,1,0), vec3.fromValues(0,0,1)];
// let f = 0;
// for (let i = 0; i < 2; i ++) {
//     for (let j = -1; j <= 1; j += 2) {
//         const copy = quad.slice();
//         for (let k = 0; k < 4; k ++) {
//             const pos = copy.subarray(0 + k * 8, 3 + k * 8);
//             const norm = copy.subarray(3 + k * 8, 6 + k * 8);
//             const uv = copy.subarray(6 + k * 8, 8 + k * 8);
//             positions.push(pos);
//             normals.push(norm);
//             uvs.push(uv);
//             const axis = vec3.scale(vec3.create(), AXES[i], j);
//             const rot = quat.setAxisAngle(quat.create(), axis, Math.PI/2);
//             vec3.transformQuat(pos, pos, rot);
//             vec3.transformQuat(norm, norm, rot);
//         }
//         vertices.set(copy, f * 8 * 4)
//         indices.set(quadIndices.map(index=>index + f * 4), f * 6);
//         f ++;
//     }
// }

// for (let k = 0; k < 4; k ++) {
//     const pos = quad.subarray(0 + k * 8, 3 + k * 8);
//     const norm = quad.subarray(3 + k * 8, 6 + k * 8);
//     const uv = quad.subarray(6 + k * 8, 8 + k * 8);
//     positions.push(pos);
//     normals.push(norm);
//     uvs.push(uv);
// }
// vertices.set(quad, f * 8 * 4);
// indices.set(quadIndices.map(index=>index + f * 4), f * 6);
// f++;

// {
//     const copy = quad.slice();
//     for (let k = 0; k < 4; k ++) {
//         const pos = copy.subarray(0 + k * 8, 3 + k * 8);
//         const norm = copy.subarray(3 + k * 8, 6 + k * 8);
//         const uv = copy.subarray(6 + k * 8, 8 + k * 8);
//         positions.push(pos);
//         normals.push(norm);
//         uvs.push(uv);
//         // const axis = vec3.scale(vec3.create(), AXES[1], j);
//         const rot = quat.setAxisAngle(quat.create(), AXES[1], Math.PI);
//         vec3.transformQuat(pos, pos, rot);
//         vec3.transformQuat(norm, norm, rot);
//     }
//     vertices.set(copy, f * 8 * 4)
//     indices.set(quadIndices.map(index=>index + f * 4), f * 6);
//     f ++;
// }

// console.log(vertices, indices);
// console.log(positions, normals, uvs);



const model = mat4.create();

const projection = mat4.create();
const view = mat4.create();
const inverseView = mat4.create();

mat4.rotateX(view, view, -Math.PI/10);
mat4.translate(view, view, vec3.fromValues(0,0,2));
let a = 0;

loadJSON('/model_list.json').then((modelList)=>
Promise.all([
    loadText('/shaders/shader.vert'),
    loadText('/shaders/shader.frag'),
    loadImage('/gradient.png'),
    Model.loadBulk(modelList.map(e=>"block/" + e)),
])).then(([
    vertSrc,
    fragSrc,
    image,
    modelLoad,
])=>{
    const vert = createShader(gl.VERTEX_SHADER, vertSrc);
    const frag = createShader(gl.FRAGMENT_SHADER, fragSrc);
    const program = new Program(gl, vert, frag);
    
    const {atlas, models} = modelLoad;
    const texture = new Texture(gl, atlas);//new Texture(gl, image);

    const {vertices, indices} = models.get('block/water').bake();//new Model(modelJSON).bake();
    
    const vertBuffer = new BufferObject(gl, vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    const indexBuffer = new BufferObject(gl, indices, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);


    const vao = new VAO(gl);
    vao.attach([
        new VertexAttributeAttachment(vertBuffer, program.getAttributeLocation('a_position'), 3, gl.FLOAT, 8 * 4, 0),
        new VertexAttributeAttachment(vertBuffer, program.getAttributeLocation("a_normal"), 3, gl.FLOAT, 8 * 4, 3 * 4),
        new VertexAttributeAttachment(vertBuffer, program.getAttributeLocation("a_uv"), 2, gl.FLOAT, 8 * 4, 6 * 4),
    ], indexBuffer);

    function draw() {

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.clearColor(0.5,0.5,0.5,1.0);
        gl.depthFunc(gl.LESS);
        // gl.enable(gl.BLEND);
        // gl.blendEquation(gl.FUNC_ADD)
        // gl.blendFunc(gl.ONE, gl.ONE);

        // mat4.rotate(model, model, 0.01, vec3.fromValues(1,0,0));
        mat4.identity(model);
        mat4.rotate(model, model, a, vec3.fromValues(0,1,0));
        mat4.translate(model, model, vec3.fromValues(-0.5, -0.5, -0.5));
        
        // mat4.rotate(view, view, 0.1, vec3.fromValues(0,1,0));
        // const t = mat4.getTranslation(vec3.create(), view);
        // vec3.scale(t, t, -1);
        // vec3.add(t, t, vec3.fromValues(Math.sin(a), 0, 0));
        a += 0.01;
        // mat4.translate(view, view, t);
        mat4.perspective(projection, Math.PI/2, gl.canvas.width / gl.canvas.height, 0.01, 100)


        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // gl.depthRange(-1, 1);
        // gl.clearDepth(-1);
        gl.viewport(0,0,gl.canvas.width, gl.canvas.height);

        // const temp = vec4.transformMat4(vec4.create(), vec4.fromValues(vertices[0],vertices[1],vertices[2], 1.0), model);
        // vec4.transformMat4(temp, temp, view);
        // vec4.transformMat4(temp, temp, projection);

        // console.log(temp);

        program.setUniform("model", model);
        program.setUniform("projection", projection);
        const rotation =  mat4.getRotation(quat.create(), view);
        const rotMat = mat4.fromQuat(mat4.create(), rotation);
        const translation = mat4.getTranslation(vec3.create(), view);
        // const scale = mat4.getScaling(vec3.create(), view);
        // quat.invert(rotation, rotation);
        vec3.scale(translation, translation, -1);
        // vec3.inverse(scale, scale);
        // mat4.invert(inverseView, mat4.fromRotationTranslation());
        mat4.multiply(inverseView, mat4.fromTranslation(mat4.create(), translation), mat4.transpose(rotMat, rotMat));
        // console.log(inverseView);
        program.setUniform("view", inverseView);

        program.use();
        vao.bind();
        texture.bind();
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(draw);
    
    }



    draw();
})