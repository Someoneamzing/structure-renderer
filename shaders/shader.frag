#version 300 es

precision highp float;

in vec2 v_uv;
in vec3 v_normal;
//in vec4 v_pos;

uniform sampler2D tex;

out vec4 fragColor;

void main() {
    float light = 1.0;//dot(normalize(v_normal), normalize(vec3(1,1,1)));
    vec4 color = texture(tex, v_uv) * vec4(light, light, light, 1.0);
    if (color.a < 0.5) discard; 
    fragColor = color;
}