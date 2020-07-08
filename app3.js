
import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
let camera, scene, renderer, controls;
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
document.body.appendChild(renderer.domElement);
controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
const geometry = new THREE.BoxBufferGeometry(5, 5, 5, 1, 1);
const material = new THREE.MeshStandardMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
const light = new THREE.PointLight();
light.position.set(20, 30, 40);
scene.add(light);
const light1 = new THREE.PointLight();
light1.position.set(20, 30, 40);
scene.add(light1);
let resizeFn = event => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};
resizeFn();
window.addEventListener("resize", resizeFn, false);

for(let t=0;t<100;t++){
  let tm = new THREE.Mesh(new THREE.PlaneGeometry(1,1))

}

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});