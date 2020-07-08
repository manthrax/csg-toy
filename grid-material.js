import * as THREE from "https://threejs.org/build/three.module.js";
let vs = `
varying vec3 vertex;
void main() {
  vertex = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`


let gridValFrag=`
float gridVal;
{
  vec2 coord = (vUv.xy-.5)*100.;// Compute anti-aliased world-space grid lines
  vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = min(grid.x, grid.y);
  gridVal =  1.0 - min(line, 1.0);
  if(gridVal<.001)gridVal=0.;//discard;
}
`
let fs = `
// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)
//#extension GL_OES_standard_derivatives : enable
varying vec3 vertex;
uniform vec4 color;
void main() {
${gridValFrag}
  gl_FragColor = vec4(color.xyz, color.w*gridVal);// Just visualize the grid lines directly
}
`;

class GridMaterial{
  constructor(template) {
    template = template.clone();
    if(template){
      template.onBeforeCompile = (shader,renderer)=>{
        shader.fragmentShader=shader.fragmentShader.replace(`#ifdef TRANSPARENCY
		diffuseColor.a`,`

#if ( defined( USE_UV ) && ! defined( UVS_VERTEX_ONLY ) )
  //varying vec2 vUv;
  //outgoingLight.rgb=vec3(1.,0.,0.);
  ${gridValFrag}
  diffuseColor.a *= gridVal;
//outgoingLight.rgb = vec3(1.)-outgoingLight.rgb;
outgoingLight.rgb = outgoingLight.brg;
#endif
#ifdef TRANSPARENCY
diffuseColor.a`)
        console.log(shader.fragmentShader)
      }
      return template
    }else
      return new THREE.ShaderMaterial({
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
    })
  }
}

export default GridMaterial