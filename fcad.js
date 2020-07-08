import * as THREE from "https://threejs.org/build/three.module.js";

import CSG from "./three-csg.js";

class FNode extends CSG {
  constructor(fcad, type) {
    super();
    this.fcad = fcad;
    this.type = type;
    this._size = new THREE.Vector3(1, 1, 1);
    this._scale = new THREE.Vector3(1, 1, 1);
    this._position = new THREE.Vector3(0, 0, 0);
    this._rotation = new THREE.Euler(0, 0, 0, "XYZ");
  }
  size(x, y, z) {
    this.size.set(x, y, z);
    return this;
  }
  scale(x, y, z) {
    this.scale.set(x, y, z);
    return this;
  }
  position(x, y, z) {
    this.position.set(x, y, z);
    return this;
  }
  rotation(x, y, z, order=this.rotation.order) {
    this.rotation.set(x, y, z, order);
    return this;
  }
  get mesh() {
    return CSG.fromMesh(this.src);
  }
  set mesh(src) {
    this.src = src;
  }
}

class FCAD {
  constructor(scene) {
    this.scene = scene;
    this.elements = [];
    let vec3 = (x, y, z) => new THREE.Vector3(x, y, z);
    let sphere = () => {
      let fn = new FNode(this, "sphere");
      return fn;
    };
    let box = () => {
      let fn = new FNode(this, "box");
      return fn;
    };
    let cylinder = () => {
      let fn = new FNode(this, "cylinder");
      return fn;
    };
    let hull = a => {
      return this;
    };
    let union = a => {
      return this;
    };
    let subtract = a => {
      return this;
    };
    let intersect = a => {
      return this;
    };
    let invert = a => {
      return this;
    };
    let render = () => {
      while(scene.children.length)scene.remove(scene.children[0])
      this.elements.length = 0;
      for(let e=arguments,i=0;i<e.length;i++){
        let m =e[i].toMesh();
        this.elements.push(m)
        scene.add(m)
      }
      return this;
    };
    
    
    
    this.eval = str => {
      eval(str);
      return this;
    };
    let f = `
      render(sphere().size(1,1,1),box().size(1,1,1).position(.5,.5,.5))
    `;
    this.eval(f);
  }
}
export default FCAD;
