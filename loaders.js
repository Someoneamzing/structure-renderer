export async function loadText(path) {
    return await(await fetch(path)).text();
}

export async function loadJSON(path) {
    return await(await fetch(path)).json();
}

export function loadImage(path) {
    return new Promise((resolve, reject)=>{
        const image = new Image();
        image.onload = ()=>resolve(image);
        image.onerror = reject;
        image.src = path;
    })
}