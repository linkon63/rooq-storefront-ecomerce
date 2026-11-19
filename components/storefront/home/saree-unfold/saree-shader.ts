/**
 * Cloth shader for the unfolding saree. `uOpen` 0 → 1 takes the plane from
 * an accordion of PLEATS folds (each pleat tilted by up to ~83°) to an open
 * length; as it opens, a slow drape wave and a lifting aanchal take over.
 * Normals come from screen-space derivatives, so the folds light correctly
 * without rebuilding geometry.
 */
export const SAREE_VERTEX = /* glsl */ `
uniform float uOpen;
uniform float uTime;
uniform float uLength;
varying vec2 vUv;
varying vec3 vView;
const float PLEATS = 10.0;

void main() {
  vUv = uv;
  float u = uv.x;
  float v = uv.y;
  float theta = (1.0 - uOpen) * 1.45;
  float pleat = uLength / PLEATS;
  float k = floor(min(u, 0.9999) * PLEATS);
  float f = u * PLEATS - k;
  float tri = mod(k, 2.0) < 0.5 ? f : 1.0 - f;

  vec3 p = position;
  p.x = (u - 0.5) * uLength * cos(theta);
  p.z = (tri - 0.5) * pleat * sin(theta);
  p.z += uOpen * (0.22 * sin(u * 6.5 - uTime * 0.8) + 0.07 * sin(v * 4.0 + u * 9.0 + uTime * 1.2));
  p.y += uOpen * 0.06 * sin(u * 3.0 + uTime * 0.6) * (1.0 - v);
  p.z += uOpen * smoothstep(0.7, 1.0, u) * 0.2 * sin(uTime * 1.1 + v * 3.0);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const SAREE_FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
varying vec2 vUv;
varying vec3 vView;

void main() {
  vec3 n = normalize(cross(dFdx(vView), dFdy(vView)));
  vec3 base = texture2D(uMap, vUv).rgb;
  if (!gl_FrontFacing) base *= 0.8;

  vec3 viewDir = normalize(-vView);
  vec3 light = normalize(vec3(0.35, 0.6, 0.75));
  float diffuse = max(dot(n, light), 0.0);
  float zari = smoothstep(0.22, 0.4, dot(base, vec3(0.299, 0.587, 0.114)));
  float spec = pow(max(dot(n, normalize(light + viewDir)), 0.0), 40.0) * (0.12 + 0.88 * zari);
  float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0) * 0.25;

  vec3 colour = base * (0.42 + 0.72 * diffuse) + vec3(1.0, 0.88, 0.66) * spec * 0.7 + base * rim;
  gl_FragColor = vec4(colour, 1.0);
  #include <colorspace_fragment>
}
`;
