/** @module gl-matrix */
import {glMatrix, vec2, vec3, mat4, quat, vec4 } from "./node_modules/gl-matrix/esm/index.js";
import Model from './Model.js';

function clamp(x, min, max) {
    // console.log(x);
    return Math.min(max, Math.max(min, x));
}

export default class Cube {
    constructor(data, textures, atlasLocations) {
        const {from, to, rotation, shade, faces} = data;
        const min = [Math.min(from[0], to[0]),Math.min(from[1], to[1]), Math.min(from[2], to[2])].map(e=>e/16)
        const max = [Math.max(from[0], to[0]),Math.max(from[1], to[1]), Math.max(from[2], to[2])].map(e=>e/16);
        this.positions = [];
        this.uvs = [];
        this.indices = [];
        this.normals = [];
        this.textures = [];
        for (let [face, faceData] of Object.entries(faces)) {
            const indices = [0 + this.positions.length, 1 + this.positions.length, 2 + this.positions.length, 1 + this.positions.length, 3 + this.positions.length, 2 + this.positions.length];
             indices.reverse(); 
            this.indices.push(...indices);
            this.positions.push(...Cube.FACES[face](min, max));
            const uvs = faceData.uv?[
                [faceData.uv[0],faceData.uv[1]],
                [faceData.uv[2],faceData.uv[1]],
                [faceData.uv[0],faceData.uv[3]],
                [faceData.uv[2],faceData.uv[3]],
            ].map(arr=>arr.map(e=>e/16)):Cube.UVS[face](min, max).map(arr=>arr.map(e=>clamp(e, 0, 1)));
            let texLoc;
            try {
                texLoc = Model.resolveTextureLocation(faceData.texture, textures);
                const tex = atlasLocations.get(texLoc)
                if (!tex) console.log(texLoc);
                if (!tex.uv) console.log(tex);
                this.uvs.push(...(faceData.rotation?Cube.UV_ROTATION[faceData.rotation](uvs):uvs).map(uv=>vec2.scale(uv, uv, tex.scale)).map(uv=>vec2.add(uv, uv, tex.uv)));
                // console.log(uvs);
                this.normals.push(...Array.from({length: 4}, _=>Cube.NORMALS[face]))
                this.textures.push(textures[faceData.texture]);
            } catch (e) {
                // console.log(faceData.texture, textures);
                // throw e;
            }
        }
        if (rotation) {
            const origin = vec3.scale(vec3.create(), rotation.origin, 1/16);
            for (let position of this.positions) {
                vec3["rotate" + rotation.axis.toUpperCase()](position, position, origin, rotation.angle * Math.PI / 180);
            }
        }
        if (rotation) for (let normal of this.normals) {
            vec3["rotate" + rotation.axis.toUpperCase()](normal, normal, vec3.create(), rotation.angle * Math.PI / 180);
        }
        // console.log(this);
    }

    bake() {
        return {vertices: new Float32Array(this.positions.reduce((arr, pos,i) => {
            arr.push(...pos);
            arr.push(...this.normals[i]);
            arr.push(...this.uvs[i]);
            return arr;
        }, [])), indices: new Uint16Array(this.indices)}
    }
}

Cube.FACES = {
    down(from, to) {
        return [
            [to[0], from[1], from[2]],
            [from[0], from[1], from[2]],
            [to[0], from[1], to[2]],
            [from[0], from[1], to[2]],
        ]
    },
    up(from, to){
        return [
            [from[0], to[1], from[2]],
            [to[0], to[1], from[2]],
            [from[0], to[1], to[2]],
            [to[0], to[1], to[2]],
        ]
    },
    north(from, to){
        return [
            [to[0], to[1], from[2]],
            [from[0], to[1], from[2]],
            [to[0], from[1], from[2]],
            [from[0], from[1], from[2]],
        ]
    },
    south(from, to) {
        return [
            [from[0], to[1], to[2]],
            [to[0], to[1], to[2]],
            [from[0], from[1], to[2]],
            [to[0], from[1], to[2]],
        ]
    },
    west(from, to) {
        return [
            [to[0], to[1], to[2]],
            [to[0], to[1], from[2]],
            [to[0], from[1], to[2]],
            [to[0], from[1], from[2]],
        ]
    },
    east(from, to) {
        return [
            [from[0], to[1], from[2]],
            [from[0], to[1], to[2]],
            [from[0], from[1], from[2]],
            [from[0], from[1], to[2]],
        ]
    }
}

Cube.NORMALS = {
    up: [0,1,0],
    down: [0,-1,0],
    north: [0,0,-1],
    south: [0,0,1],
    west: [-1,0,0],
    east: [1,0,0]
}

Cube.UVS = {
    up(min, max){
        return [
            [min[0], min[2]],
            [max[0], min[2]],
            [min[0], max[2]],
            [max[0], max[2]],
        ]
    },
    down(min, max){
        return [
            [min[0], max[2]],
            [max[0], max[2]],
            [min[0], min[2]],
            [max[0], min[2]],
        ]
    },
    north(min, max){
        return [
            [min[0], min[1]],
            [max[0], min[1]],
            [min[0], max[1]],
            [max[0], max[1]],
        ]
    },
    south(min, max){
        return [
            [min[0], min[1]],
            [max[0], min[1]],
            [min[0], max[1]],
            [max[0], max[1]],
        ]
    },
    east(min, max){
        return [
            [min[2], min[1]],
            [max[2], min[1]],
            [min[2], max[1]],
            [max[2], max[1]],
        ]
    },
    west(min, max){
        return [
            [min[2], min[1]],
            [max[2], min[1]],
            [min[2], max[1]],
            [max[2], max[1]],
        ]
    }
}

Cube.UV_ROTATION = {
    [0](uv) {return uv},
    [90](uv) {
        return [uv[2], uv[0], uv[3], uv[1]];
    },
    [180](uv) {
        return [uv[2], uv[3], uv[0], uv[1]];
    },
    [270](uv) {
        return [uv[1], uv[2], uv[3], uv[0]];
    },
}