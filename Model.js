import Cube from "./Cube";
import {loadJSON, loadImage} from './loaders.js';
import ResourceLocation from "./ResourceLocation";
/** @module gl-matrix */
import {vec2} from "./node_modules/gl-matrix/esm/index.js";
import Texture from "./Texture";


export default class Model {
    constructor(model,atlasLocations,registry) {
        const {textures, elements, parent} = model;
        this.textures = Model.collapseTextures(model, atlasLocations, registry);
        this.elements = Model.getElements(model, registry).map(element=>new Cube(element, this.textures, atlasLocations));
        this.parent = parent;
    }

    static collapseTextures(model, atlasLocations, registry) {
        if (model.parent && !registry.has(model.parent)) {
            console.error(registry);
            throw new Error("Unknown model " + model.parent)
        }
        return{...model.parent?Model.collapseTextures(registry.get(model.parent), atlasLocations, registry):{}, ...(model.textures?model.textures:{})};
    }

    // static resolveTextures(model, atlasLocations, registry) {
    //     const result = model.parent?Model.resolveTextures(model.parent, atlasLocations, registry):{};
    //     if (model.textures) for (let [name, location] of Object.entries(model.textures)) {
    //         result[name] = atlasLocations.get(Model.resolveTextureLocation(location, result));
    //     }
    //     return result;
    // }

    static resolveTextureLocation(location, textures) {
        if (location.startsWith("#")) {
            if (location.substring(1) in textures) {
                location = Model.resolveTextureLocation(textures[location.substring(1)], textures);
            } else {
                throw new Error(`Unable to resolve texture "${location}"`);
            }
        }
        return location;
    }

    bake() {
        let I = 0;
        return {
            vertices: new Float32Array(this.elements.reduce((arr,element)=>element.positions.reduce((acc, pos, i)=>{
                arr.push(...pos);
                arr.push(...element.normals[i]);
                arr.push(...element.uvs[i]);
                return arr;
            }, arr), [])),
            indices: new Uint16Array(this.elements.reduce((acc, element, i)=>{
                if (i > 0) I += this.elements[i-1].positions.length;
                return acc.concat(element.indices.map(index=>index + I))
            }, []))
        }
    }

    static getElements(model, registry) {
        // console.log(model);
        return model.elements?model.elements:(model.parent?Model.getElements(registry.get(model.parent), registry):null);
    }

    static async loadBulk(locations) {
        const registry = new Map();
        const modelDatas = await Promise.all(locations.map(async location=>{
            const data = await loadJSON((location instanceof ResourceLocation?location:new ResourceLocation(location, "models")).toURL());
            registry.set(location.toString(), data);
            return data;
        }));
        const textures = new Map();
        const texturePromises = new Map();
        for (let model of modelDatas) {
            if (model.textures) for (let [variable, location] of Object.entries(model.textures)) {
                // console.log(variable, location);
                if (!location.startsWith("#") && !texturePromises.has(location)) texturePromises.set(location, (async ()=>{
                    const image = await loadImage(new ResourceLocation(location, "textures").toURL());
                    textures.set(location, {image, uv: vec2.create(), scale: 0});
                    // console.log(image.complete);
                    return image;
                })());
            }
        }
        await Promise.all(texturePromises.values());
        const gridWidth = Math.ceil(Math.sqrt(textures.size));
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        //TODO: Change to image dependant cell sizes;
        canvas.width = gridWidth * 16;
        canvas.height = gridWidth * 16;
        console.log(textures);
        ctx.fillStyle = "red";
        // ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.save();
        // ctx.scale(1,-1);
        for (let [i, atlasLocation] of Array.from(textures.values()).entries()) {
            const {image, uv} = atlasLocation;
            atlasLocation.scale = 1 / gridWidth;
            vec2.set(uv, i % gridWidth / gridWidth, Math.floor(i / gridWidth) / gridWidth)
            // console.log(image, uv);
            // console.log( uv[0] * canvas.width, uv[1] * canvas.height);
            ctx.drawImage(image, 0, 0, 16, 16, uv[0] * canvas.width, uv[1] * canvas.height, 16, 16);
        }
        ctx.restore();
        canvas.classList.add('debug-canvas')
        document.body.append(canvas)
        const models = new Map();
        for (let [i, data] of modelDatas.entries()) {
            if (Model.getElements(data, registry)) {
                const model = new Model(data, textures, registry);
                models.set(locations[i], model);
            }
        }
        console.log(models);
        // const models = modelDatas.filter(data=>data.elements).map(data=>new Model(data, textures, registry))
        return {atlas: canvas, models}
    } 
}