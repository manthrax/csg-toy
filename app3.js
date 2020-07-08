import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://threejs.org/examples/jsm/controls/TransformControls.js";
import GridMaterial from "./grid-material.js";
let camera, scene, renderer, ocontrols;
let aspect = window.innerWidth / window.innerHeight;
camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
camera.position.set(0, 5, 10);
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x101010);
document.body.appendChild(renderer.domElement);
ocontrols = new OrbitControls(camera, renderer.domElement);
//ocontrols.autoRotate = true;
const geometry = new THREE.BoxBufferGeometry(1, 1, 1, 1, 1);
const backMaterial = new THREE.MeshStandardMaterial({color:'white',opacity:.5,transparent:true,side:THREE.BackSide,depthWrite:false});
const frontMaterial = new THREE.MeshStandardMaterial({color:'white',opacity:.5,transparent:true,side:THREE.FrontSide});
const mesh = new THREE.Mesh(geometry, backMaterial);
mesh.add(new THREE.Mesh(geometry,frontMaterial));
mesh.children[0].renderOrder = 2;
scene.add(mesh);

mesh.position.y += 0.5;

const mesh2 = mesh.clone();
scene.add(mesh2);

const light = new THREE.PointLight("white", 0.5);
light.position.set(20, 30, 40);
scene.add(light);
const light1 = new THREE.PointLight("white", 0.5);
light1.position.set(-20, 30, -40);
scene.add(light1);
let tcontrol = new TransformControls(camera, renderer.domElement);
scene.add(tcontrol);
let tbox = new THREE.Box3();


let enforceGround=(mesh)=>{
  
    tbox.setFromObject(mesh);
    if (tbox.min.y < 0) mesh.position.y -= tbox.min.y;
}


let selection = [];
let wasDragged = false;
tcontrol.addEventListener("dragging-changed", event => {
  ocontrols.enabled = !event.value;
  wasDragged = event.
  if (!event.value) {
    for(let i=0;i<selection.length;i++)
      enforceGround(selection[i])
  }else wasDragged = true
});
let grid = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new GridMaterial());
grid.rotation.x = Math.PI * -0.5;
scene.add(grid);

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

let selectionMaterial = mesh.material.clone();
selectionMaterial.color.set(0xffd000);

let updateInteraction=(event)=>{
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects([mesh, mesh2]); // scene.children );
  scene.traverse(e => {
    if (!(e.isMesh && e.material.color)) return;
    if (!e.userData.saveMaterial) e.userData.saveMaterial = e.material;
    e.material = e.userData.saveMaterial;
  });

  for (var i = 0; i < intersects.length; i++) {
    let o = intersects[i].object;
    if(wasDragged) break;
    wasDragged = false;
    if (event.type==='mousedown') {
      o.material = selectionMaterial;
      for (var j = 0; j < selection.length; j++)
        selection[j] != o && tcontrol.detach(selection[j]);
      if(!event.shiftKey)selection = []
      selection.push(intersects[i].object);
      for (var j = 0; j < selection.length; j++) tcontrol.attach(selection[j]);
    }
    break;
  }
}

let clicked = false;
function onMouseDown(event) {
  updateInteraction(event)
}
function onMouseMove(event) {
  updateInteraction(event)
}
//debugger
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("mousedown", onMouseDown, false);

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
  ocontrols.update();
  renderer.render(scene, camera);
});
