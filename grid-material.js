import * as THREE from "https://threejs.org/build/three.module.js";
let vs = `
varying vec3 vertex;
void main() {
  vertex = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`
let fs = `
// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)
//#extension GL_OES_standard_derivatives : enable
varying vec3 vertex;
uniform vec4 color;
void main() {
  vec2 coord = vertex.xy;// Compute anti-aliased world-space grid lines
  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = min(grid.x, grid.y);
  float val =  1.0 - min(line, 1.0);
  if(val<.5)discard;
  gl_FragColor = vec4(color.xyz, color.w*val);// Just visualize the grid lines directly
}
`;

class GridMaterial extends THREE.ShaderMaterial {
  constructor(params) {
    //ebugger
    super({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        color: { value: new THREE.Vector4(1,1,0,1) }
      },
      vertexShader:vs,
      fragmentShader: fs,
      extensions:{derivatives:true},
      transparent:true,
      side:THREE.DoubleSide
    });
  }
}

export default GridMaterial