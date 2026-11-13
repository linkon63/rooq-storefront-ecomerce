/**
 * GLSL for the hero cloth: a plane draped by layered travelling waves, an
 * deep-green twill face and a magenta lining on the back. Lighting is a cheap
 * half-Lambert from screen-space derivatives, so no normal attribute is needed.
 */

export const CLOTH_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying vec3 vWorld;

  float drape(vec2 p, float t) {
    float hang = (1.0 - p.y) * (1.0 - p.y) * 0.55;            // heavier toward the hem
    float folds = sin(p.x * 7.0 + t * 0.9) * 0.16
                + sin(p.x * 13.0 - t * 1.3 + p.y * 3.0) * 0.05
                + sin((p.x + p.y) * 4.0 + t * 0.6) * 0.12;
    float sway = sin(t * 0.45 + p.y * 2.2) * 0.18 * (1.0 - p.y);
    float touch = exp(-8.0 * distance(p, uPointer)) * 0.22;   // the pointer lifts the cloth a little
    return (folds * (0.35 + hang)) + sway + touch;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.z += drape(uv, uTime);
    pos.x += sin(uv.y * 3.0 + uTime * 0.4) * 0.08 * (1.0 - uv.y);
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const CLOTH_FRAGMENT = /* glsl */ `
  uniform vec3 uFace;
  uniform vec3 uFaceLight;
  uniform vec3 uLining;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    vec3 light = normalize(vec3(-0.4, 0.8, 0.9));
    float lambert = dot(gl_FrontFacing ? n : -n, light) * 0.5 + 0.5;

    // Twill: fine diagonal ribs, like denim seen up close.
    float rib = sin((vUv.x * 1.0 + vUv.y * 0.6) * 520.0) * 0.5 + 0.5;
    vec3 face = mix(uFace, uFaceLight, lambert * 0.85) * (0.92 + rib * 0.08);
    vec3 lining = uLining * (0.55 + lambert * 0.6);

    vec3 color = gl_FrontFacing ? face : lining;
    // Selvedge stripe along the left edge.
    float edge = smoothstep(0.012, 0.0, vUv.x);
    color = mix(color, vec3(0.95), edge * 0.8);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Brand colours as linear 0–1 RGB triples (ink, a lit green, magenta). */
export const CLOTH_COLORS = {
  face: [0.110, 0.224, 0.204] as const,
  faceLight: [0.263, 0.447, 0.408] as const,
  lining: [0.608, 0.102, 0.255] as const,
};
