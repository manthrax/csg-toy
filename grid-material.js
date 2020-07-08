import * as THREE from "https://threejs.org/build/three.module.js";

let fs = `
// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)
#extension GL_OES_standard_derivatives : enable
varying vec3 vertex;
void main() {
  vec2 coord = vertex.xz;// Compute anti-aliased world-space grid lines
  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = min(grid.x, grid.y);
  gl_FragColor = vec4(vec3(1.0 - min(line, 1.0)), 1.0);// Just visualize the grid lines directly
}
`;

class GridMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() }
      },
      //vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: fs,
      extensions:{derivatives:true}
    });
  }
}

export default GridMaterial