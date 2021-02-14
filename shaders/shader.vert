#version 300 es
in vec3 a_position;
in vec2 a_uv;
in vec3 a_normal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

out vec2 v_uv;
out vec3 v_normal;
//out vec4 v_pos;



void main() {
    v_normal = (model * vec4(a_normal, 1) - model * vec4(0,0,0,1)).xyz;
    v_uv = a_uv;
    gl_Position = projection * view * model * vec4(a_position, 1.0);
}