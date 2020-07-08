import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://threejs.org/examples/jsm/controls/TransformControls.js";
//import { ConvexHull } from "https://threejs.org/examples/jsm/math/ConvexHull.js";
import CSG from "./three-csg.js";
import FCAD from "./fcad.js";
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
const backMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  opacity: 0.9,
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false
});
const frontMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  opacity: 0.1,
  transparent: true,
  side: THREE.FrontSide
});

const light = new THREE.PointLight("white", 0.5);
light.position.set(20, 30, 40);
scene.add(light);
const light1 = new THREE.PointLight("white", 0.5);
light1.position.set(-20, 30, -40);
scene.add(light1);
let tcontrol = new TransformControls(camera, renderer.domElement);
tcontrol.translationSnap = 0.05;
tcontrol.rotationSnap = Math.PI / 16;
scene.add(tcontrol);
let tbox = new THREE.Box3();
let enforceGround = mesh => {
  tbox.setFromObject(mesh);
  if (tbox.min.y < 0) mesh.position.y -= tbox.min.y;
};
let selection = [];
let wasDragged = false;
tcontrol.addEventListener("dragging-changed", event => {
  ocontrols.enabled = !event.value;
  wasDragged = event.value;
  if (!wasDragged) {
    for (let i = 0; i < selection.length; i++) enforceGround(selection[i]);
  }
  //debugger
});
let grid = new THREE.Mesh(
  new THREE.PlaneGeometry(10.0015, 10.0015),
  new GridMaterial(
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(
        "https://cdn.glitch.com/02b1773f-db1a-411a-bc71-ff25644e8e51%2Fmandala.jpg?v=1594201375330"
      ),
      transparent: true,
      opacity: 1,
      alphaTest: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  )
);
grid.rotation.x = Math.PI * -0.5;
grid.renderOrder = 0;
scene.add(grid);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
let selectionMaterial = frontMaterial.clone();
selectionMaterial.color.set(0xffd000);

let transformGroup = new THREE.Group();
scene.add(transformGroup);
tcontrol.attach(transformGroup);
let elements = [];
let updateInteraction = event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(elements); // scene.children );

  let setMaterial = (m, mat) => {
    if (!m.userData.saveMaterial) m.userData.saveMaterial = m.material;
    m.material = mat;
  };
  let select = o => {
    for (var j = 0; j < selection.length; j++) {
      scene.attach(selection[j]);
    }
    if (!event.shiftKey) {
      let nsel = [];
      for (var j = 0; j < selection.length; j++) {
        if (selection[j] != o) {
          selection[j].material = selection[j].userData.saveMaterial;
          delete selection[j].userData.selected;
        } else nsel.push(selection[j]);
      }

      selection.length = 0;
      for (let i = 0; i < nsel.length; i++) selection.push(nsel[i]);
    }

    if (o && !o.userData.selected) {
      selection.push(o);
      o.userData.selected = true;
      setMaterial(o, selectionMaterial);
    }
    transformGroup.position.set(0, 0, 0);
    for (var j = 0; j < selection.length; j++) {
      transformGroup.position.add(selection[j].position);
    }
    if (selection.length) {
      transformGroup.position.multiplyScalar(1 / selection.length);
      for (var j = 0; j < selection.length; j++)
        transformGroup.attach(selection[j]);
    }
  };
  if (event.type === "mousedown") {
    if(wasDragged)return;
    if (intersects.length) {
      let o = intersects[0].object;
      if(!o.userData.selected){
        select(o)
      }
    } else if(!wasDragged)select();
  }
  
  tcontrol.enabled = tcontrol.visible = selection.length ? true : false
  
};

window.addEventListener("mousemove", updateInteraction, false);
window.addEventListener("mousedown", updateInteraction, false);
let resizeFn = event => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};
resizeFn();
window.addEventListener("resize", resizeFn, false);
renderer.setAnimationLoop(() => {
  ocontrols.update();
  renderer.render(scene, camera);
});

/*
const mesh = new THREE.Mesh(geometry, backMaterial);
mesh.add(new THREE.Mesh(geometry,frontMaterial));
mesh.children[0].renderOrder = 2;
scene.add(mesh);
mesh.position.set(-.25,.5,-.25)
const mesh2 = mesh.clone();
scene.add(mesh2);
mesh2.position.set(.25,1.,.25)
elements = [mesh, mesh2]
*/

let cadScene = new THREE.Group();
scene.add(cadScene);
let fc = new FCAD(cadScene);
elements = fc.eval(`
`).elements;

for (let i = 0; i < elements.length; i++) enforceGround(elements[i]);
