export default class ResourceLocation {
    constructor(namespace, resource = null, context = null) {
        if (resource !== null && context !== null) {
            this.namespace = namespace;
            this.resource = resource;
            this.context = context;
        } else if (resource !== null && context === null) {
            const res = namespace.match(ResourceLocation.Regex)
            if (res[2].length <= 0) throw new SyntaxError(`Invalid Resource Location "${namespace}". Must contain a location.`)
            this.namespace = res[1]&&res[1].length > 0?res[1]:"minecraft";
            this.resource = res[2];
            this.context = resource;
        } else {
            throw new TypeError(`Invalid signature to ResourceLocation. ${namespace}, ${resource}, ${context}`)
        }
    }

    toString() {
        return `${this.namespace}:${this.resource} (${this.context})`;
    }

    toURL() {
        return new URL(`/assets/${this.namespace}/${this.context}/${this.resource}${ResourceLocation.CONTEXT_EXTENSIONS[this.context]}`, document.location)
    }
}

ResourceLocation.CONTEXT_EXTENSIONS = {
    "models": ".json",
    "textures": ".png",
}

ResourceLocation.Regex = /(?:(\w+)\:)?([^\/]+(?:\/[^\/]+)*)/;