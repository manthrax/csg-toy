import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://threejs.org/examples/jsm/controls/TransformControls.js";
import GridMaterial from "./grid-material.js";
let camera, scene, renderer, controls;
let aspect = window.innerWidth / window.innerHeight;
camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
camera.position.set(0, 5, 10);
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x101010);
document.body.appendChild(renderer.domElement);
controls = new OrbitControls(camera, renderer.domElement);
//controls.autoRotate = true;
const geometry = new THREE.BoxBufferGeometry(5, 5, 5, 1, 1);
const material = new THREE.MeshStandardMaterial();
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
mesh.position.y += 2.5;
const light = new THREE.PointLight("white", 0.5);
light.position.set(20, 30, 40);
scene.add(light);
const light1 = new THREE.PointLight("white", 0.5);
light1.position.set(-20, 30, -40);
scene.add(light1);

let grid = new THREE.Mesh(new THREE.PlaneGeometry(10, 10),new GridMaterial());
grid.rotation.x = Math.PI * -0.5;
scene.add(grid);

let resizeFn = event => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};
resizeFn();
window.addEventListener("resize", resizeFn, false);

for (let t = 0; t < 100; t++) {
  let tm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1));
}

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});