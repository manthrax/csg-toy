import * as THREE from "https://threejs.org/build/three.module.js";

import CSG from "./three-csg.js";

class FNode{
  constructor(fcad, type) {
    this.fcad = fcad;
    this.type = type;
    this._size = new THREE.Vector3(1, 1, 1);
    this._scale = new THREE.Vector3(1, 1, 1);
    this._position = new THREE.Vector3(0, 0, 0);
    this._rotation = new THREE.Euler(0, 0, 0, "XYZ");
  }
  size(x, y, z) {
    this._size.set(x, y, z);
    return this;
  }
  scale(x, y, z) {
    this._scale.set(x, y, z);
    return this;
  }
  position(x, y, z) {
    this._position.set(x, y, z);
    return this;
  }
  rotation(x, y, z, order=this.rotation.order) {
    this._rotation.set(x, y, z, order);
    return this;
  }
  get mesh() {
    return CSG.toMesh(this.csg,this.src.matrix,this.src.material);
  }
  set mesh(src) {
    this.csg = CSG.fromMesh(this.src = src);
    return this;
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
    
    
    let material = new THREE.MeshStandardMaterial({color:'blue'})
    let prims = {
      sphere:new THREE.Mesh(new THREE.SphereGeometry(.25,8,4),material),
      box:new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),material),
      cylinder:new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.5,8),material),
    }
    
    let self = this;
    function render  () {
      
      while(scene.children.length)
        scene.remove(scene.children[0])
      self.elements.length = 0;
      for(let e=arguments,i=0;i<e.length;i++){
        //debugger
        let el = e[i]
        let t = el.type;
        if(prims[t])
          el.mesh = prims[t].clone()
        let m = el.mesh;
        self.elements.push(m)
        scene.add(m)
      }
      return self;
    }
    
    
    
    this.eval = str => {
      eval(str);
      return this;
    };
    let f = `
      //debugger
      render(sphere().size(1,1,1),box().size(1,1,1).position(.5,.5,.5))
    `;
    
    
    //this.eval(f);
  //debugger
    render(
      sphere().size(1,1,1),
      box().size(1,1,1).position(.5,.5,.5),
      cylinder()
    )
  
  }
}
export default FCAD;
