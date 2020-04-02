let camera, scene, renderer;
let material;
let clock;

const vertexShader = `
  precision mediump float;

  attribute vec3 aPosition;
  attribute vec3 aRotationAxis;
  attribute float aRotationAngle;

  varying vec2 vUv;
  varying float vRandom;

  uniform float uTime;

  #define PI 3.1415926538

  mat4 rotationMatrix(vec3 axis, float angle) {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;

      return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                  oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                  oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                  0.0,                                0.0,                                0.0,                                1.0);
  }

  vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
  }

  vec3 getDistortion(float at) {
    float t = uTime * 0.0;
    float mag = 0.5;
    vec3 freq = vec3(1.32, 0.98, 1.137) * 5.;

    vec3 distortion = vec3(
      sin(at * freq.x + t), 
      -sin(at * freq.y + t) * 0.1, 
      cos(-at * freq.z + t)
    );

    distortion *= mag;

    return distortion;
  }

  void main() {
    vUv = uv;
    vRandom = aRotationAngle;

    vec3 pos = position + aPosition * 1.;

    float t = uTime * 0.5;

    vec3 distortion = getDistortion(pos.x);
    pos += distortion;

    float freq = 2.;
    float amp = 1.0;

    // pos.x += sin(pos.x * freq + t) * amp;

    pos = rotate(pos, aRotationAxis, aRotationAngle * PI * 2.);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  }
`;

const fragmentShader = `
  precision mediump float;

  varying vec2 vUv;
  varying float vRandom;

  uniform float uTime;

  vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
  }

  float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  void main() {
    float random = map(vRandom, 0., 1., 0.05, 0.2);
    float rt = uTime * random;
    float o = fract(rt);
    float length = map(vRandom, 0., 1., 0.01, 0.025);

    if(
      abs(vUv.x - o) > length && 
      abs(vUv.x - o - 1.) > length && 
      abs(vUv.x - o + 1.) > length
    ) {
      discard;
    }

    vec3 iQolor = palette(
      sin(vUv.x * 2. + rt) * 1., 
      vec3(0.5, 0.5, 0.5),	
      vec3(0.5, 0.5, 0.5),	
      vec3(1.0, 1.0, 1.0), 
      vec3(0.00, 0.33, 0.67) 
    );  


    gl_FragColor = vec4(iQolor, 1.);
  }
`;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
 camera.position.set(0, 0, 7.5);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(0xffffff, 1);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  clock = new THREE.Clock();
  
  // Base Geometry
  const baseGeometry = new THREE.PlaneBufferGeometry(3, .1, 1000, 1);
  
  // Material
  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: new THREE.Uniform(null)
    },
    side: THREE.DoubleSide,
  });
  
  // Instance Geometry
  const instanceCount = 50;
  const instancedGeometry = new THREE.InstancedBufferGeometry().copy(baseGeometry);
  instancedGeometry.maxInstancedCount = instanceCount;

  // Instance Buffer Attributes
  let aPosition = [];
  let aRotationAngle = [];
  let aRotationAxis = [];
  for (let i = 0; i < instanceCount; i++) {
    aPosition.push(
      2 * (Math.random() - 0.5),
      2 * (Math.random() - 0.5),
      2 * (Math.random() - 0.5)
    );

    aRotationAxis.push(
      2 * (Math.random() - 0.5),
      2 * (Math.random() - 0.5),
      2 * (Math.random() - 0.5)
    );

    aRotationAngle.push(
      Math.random()
    );
  }

  const aPositionFloat32 = new Float32Array(aPosition);
  const aRotationAngleFloat32 = new Float32Array(aRotationAngle);
  const aRotationAxisFloat32 = new Float32Array(aRotationAxis);

  instancedGeometry.setAttribute("aPosition", new THREE.InstancedBufferAttribute(aPositionFloat32, 3, false)); 
  instancedGeometry.setAttribute("aRotationAxis", new THREE.InstancedBufferAttribute(aRotationAxisFloat32, 3, false)); 
  instancedGeometry.setAttribute("aRotationAngle", new THREE.InstancedBufferAttribute(aRotationAngleFloat32, 1, false));   
  
  // Mesh
  const mesh = new THREE.Mesh(instancedGeometry, material);
  scene.add(mesh);

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize(event) {
  let width = window.innerWidth;
  let height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);  
}

function animate() {
  requestAnimationFrame(animate);
  material.uniforms.uTime.value = clock.getElapsedTime();
  render(); 
}

function render() {
  renderer.render(scene, camera);
}