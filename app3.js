import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "https://threejs.org/examples/jsm/controls/TransformControls.js";
//import { ConvexHull } from "https://threejs.org/examples/jsm/math/ConvexHull.js";
import CSG from "./three-csg.js";
import FCAD from "./fcad.js";
import GridMaterial from "./grid-material.js";

import Environment from "./cool-env.js"



let camera, scene, renderer, ocontrols;
let aspect = window.innerWidth / window.innerHeight;
camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

let lastSavedPosition=new THREE.Vector3(2, 1.5, 2)

scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x101010);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);
ocontrols = new OrbitControls(camera, renderer.domElement);

//debugger
//ocontrols.autoRotate = true;
try{ 
  //throw ''
  camera.position.copy(JSON.parse(localStorage.cameraPosition)) 
  ocontrols.target.copy(JSON.parse(localStorage.controlsTarget)) 
}
catch
{
  camera.position.copy(lastSavedPosition);
  ocontrols.target.set(0,0,0) 
}


let environment = new Environment(renderer,scene,camera)

/*
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
*/

let frontMaterial = Environment.mkMat('yellow')
frontMaterial.transparent = true;
frontMaterial.opacity = .25;

/*
const light = new THREE.PointLight("white", 0.5);
light.position.set(20, 30, 40);
scene.add(light);
const light1 = new THREE.PointLight("white", 0.5);
light1.position.set(-20, 30, -40);
scene.add(light1);
*/
let tcontrol = new TransformControls(camera, renderer.domElement);
tcontrol.translationSnap = 0.05;
tcontrol.rotationSnap = Math.PI / 16;
scene.add(tcontrol);
let tbox = new THREE.Box3();
let enforceGround = mesh => {
  let par = mesh.parent;
  scene.attach(mesh)
  tbox.setFromObject(mesh);
  if (tbox.min.y < 0) mesh.position.y-=tbox.min.y
  par.attach(mesh)
};

let gridmat = Environment.mkMat(0x404040)
gridmat.transparent = true;
scene.add(GridMaterial.makeGrid(gridmat));

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

let selectionMaterial = frontMaterial.clone();
selectionMaterial.color.set(0xffd000);
selectionMaterial.opacity = .9

let transformGroup = new THREE.Group();
scene.add(transformGroup);
tcontrol.attach(transformGroup);

let tv30 = new THREE.Vector3();
class Elements {
  constructor() {
    this.selected = {};
    this.selection = [];
    this.elements = [];
  }
  get selectedCount() {
    return this.selection.length;
  }
  forEach(fn) {
    this.elements.forEach(fn);
  }
  forSelected(fn) {
    this.selection.forEach(fn);
  }
  setMaterial(m, mat) {
    if (!m.userData.saveMaterial && m.userData.material !== m.material)
      m.userData.saveMaterial = m.material;
    m.material = mat;
  }
  clearSelection() {
    this.forSelected((e)=>{
      scene.attach(e);
      if (e.userData.saveMaterial) e.material = e.userData.saveMaterial
    })
    this.selected = {};
    this.selection = [];
  }

  deselect(idx) {
    let e = this.selected[idx];
    if (e) {
      delete this.selected[idx];
      scene.attach(e);
      this.selection = []
      this.forEach((e,i)=>this.selected(i) && this.selection.push(e))      
      this.update();
    }
  }

  update() {
    if (this.selectedCount) {
      this.forSelected(e=>scene.attach(e))
      transformGroup.position.set(0, 0, 0);
      this.forSelected(e=>transformGroup.position.add(e.position));
      transformGroup.position.multiplyScalar(1 / this.selectedCount);
      transformGroup.updateMatrixWorld()
      this.forSelected(e=>transformGroup.attach(e))
    }
  }
  select(idx) {
    let e = this.elements[idx];
    this.selected[idx] = e;
    this.selection.push(e);
    this.setMaterial(e, selectionMaterial);
    transformGroup.attach(e);
    this.update();
  }
  set(e) {
    this.forEach(s => s.parent.remove(s));
    this.elements = e.slice(0);
    this.selection = [];
    
    this.forEach((s, i) => {
      scene.attach(s);
      if (this.selected[i]) this.select(i);
    });
    this.update();
  }
}

let elements = new Elements();

let wasDragged = false;
let fc;

let cadScene = new THREE.Group();
scene.add(cadScene);

let transpMat=(color)=>{
  let m = Environment.mkMat(color)
  m.transparent = true;
  m.opacity = 0.7
  return m
}

fc = new FCAD(cadScene,Environment.mkMat('white'),transpMat('red'),transpMat('blue'));


tcontrol.addEventListener("dragging-changed", event => {
  ocontrols.enabled = !event.value;
  wasDragged = event.value;
  if (!wasDragged) {
    console.log("Dragging");
  } else {
    console.log("Drag");
    //setElements(fc.update())
  }
});



elements.set(fc.update());

let updateCSG=()=>{
  
    elements.forSelected((e, i) => {
      scene.attach(e);
      e.updateMatrixWorld();
      e.userData.node._position.copy(e.position)
      e.userData.node._scale.copy(e.scale)
      e.userData.node._rotation.copy(e.rotation)
      //console.log(e.userData.node.type,e.userData.node._position)
    })
    
    elements.set(fc.update());
    elements.forEach(enforceGround);
    elements.forSelected((e, i) => transformGroup.attach(e));
    elements.update()
}


tcontrol.addEventListener("objectChange", event => {
    console.log("OC")
    if(elements.selectedCount ){
      updateCSG()
    }
})



let mouseEvent = event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(elements.elements); // scene.children );

  if (event.type === "mousedown") {
    if (wasDragged) return;
    if (intersects.length) {
      if(!event.shiftKey)elements.clearSelection()
      let o = intersects[0].object;
      elements.forEach((e, i) => e === o && elements.select(i));
    } else if (!wasDragged){
      if(event.buttons === 1)
        elements.clearSelection();
    }
  } else if (event.type === "mouseup") {
    updateCSG()
  }else if(event.type==="mousemove"){
  }
  tcontrol.enabled = tcontrol.visible = elements.selectedCount ? true : false;
};

window.addEventListener(
  "keydown",
  e => {
    if (e.shiftKey) tcontrol.setMode("translate");
    if (e.ctrlKey) tcontrol.setMode("rotate");
    if (e.altKey) tcontrol.setMode("scale");
    if (e.code === 'Equal'){
        elements.forSelected(e=>e.userData.node.operation = 'union')
    elements.set(fc.update());
    }
    if (e.code === 'Minus'){
        elements.forSelected(e=>e.userData.node.operation = 'subtract')
    elements.set(fc.update());
    }
    if (e.code === 'KeyW'){
      scene.traverse((e)=>{
        if(e.isMesh){
          if(e.material.userData.saveWireframe===undefined){
            e.material.userData.saveWireframe = e.material.wireframe
            e.material.wireframe = true;
          }else{            
            e.material.wireframe = e.material.userData.saveWireframe
            delete e.material.userData.saveWireframe;
          }
        }
      })
    }
  },
  false
);
window.addEventListener("keyup", () => tcontrol.setMode("translate"), false);

window.addEventListener("mousemove", mouseEvent, false);
window.addEventListener("mousedown", mouseEvent, false);
window.addEventListener("mouseup", mouseEvent, false);

let resizeFn = event => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  if(environment && environment.composer)
      environment.resize(width,height)
};

resizeFn();
window.addEventListener("resize", resizeFn, false)


renderer.setAnimationLoop(() => {
  ocontrols.update();
  if(environment && environment.composer)
	 environment.composer.render();
  else
    renderer.render(scene, camera);
  
  if(!lastSavedPosition.equals(camera.position)){
    lastSavedPosition.copy(camera.position)
    localStorage.cameraPosition=JSON.stringify(camera.position)
    localStorage.controlsTarget = JSON.stringify(ocontrols.target) 
  }
});
