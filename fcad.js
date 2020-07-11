import * as THREE from "https://threejs.org/build/three.module.js";

import CSG from "./three-csg.js";

import { ConvexBufferGeometry } from "https://threejs.org/examples/jsm/geometries/ConvexGeometry.js";

const backMaterial = new THREE.MeshStandardMaterial({
  color: "red",
  opacity: 0.5,
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false
});
const frontMaterial = new THREE.MeshStandardMaterial({
  color: "blue",
  opacity: 0.5,
  transparent: true,
  side: THREE.FrontSide
});

class FNode {
  constructor(fcad, type, args = []) {
    this.fcad = fcad;
    this.type = type;
    this._size = new THREE.Vector3(1, 1, 1);
    this._scale = new THREE.Vector3(1, 1, 1);
    this._position = new THREE.Vector3(0, 0, 0);
    this._rotation = new THREE.Euler(0, 0, 0, "XYZ");
    this.args = args;
  }
  /*
  remove(child){
    for(let i=0;i<this.children.length;i++)if(this.children[i]===child){
      this.children=this.children.splice(i,1)
      delete child.parent
      break;
    }
  }
  add(child){
    if(child.parent)child.parent.remove(child)
    this.children.push(child)
    child.parent = this;
  }
  */
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
  rotation(x, y, z, order = this.rotation.order) {
    this._rotation.set(x, y, z, order);
    return this;
  }
  get mesh() {
    this.src.updateMatrixWorld();
    let m = CSG.toMesh(this.csg, this.src.matrix, this.src.material);
    m.updateMatrixWorld();
    m.renderOrder = 2;
    let b = new THREE.Mesh(m.geometry, backMaterial);
    m.add(b);
    b.renderOrder = 1;
    return m;
  }
  set mesh(src) {
    this.csg = CSG.fromMesh((this.src = src));
    return this;
  }
  getMesh(src) {
    return this.mesh;
  }
  setMesh(src) {
    this.mesh = src;
  }
}

class FCAD {
  constructor(scene) {
    this.scene = scene;
    this.elements = [];

    let self = this;
    let vec3 = (x, y, z) => new THREE.Vector3(x, y, z);
    let sphere = () => new FNode(this, "sphere");
    let box = () => new FNode(this, "box");
    let cylinder = () => new FNode(this, "cylinder");

    let args = () => Array.prototype.slice.call(arguments);
    function nnode(type, args) {
      return new FNode(self, type, Array.prototype.slice.call(args));
    }
    //new FNode(this, "mesh", args());
    let mesh = function() {
      return nnode("mesh", arguments);
    };
    let hull = function() {
      return nnode("hull", arguments);
    };
    let union = function() {
      return nnode("union", arguments);
    };
    let subtract = function() {
      return nnode("subtract", arguments);
    };
    let intersect = function() {
      return nnode("intersect", arguments);
    };
    let invert = function() {
      return nnode("invert", arguments);
    };

    let mkprim = geom => {
      let m = new THREE.Mesh(geom, frontMaterial);
      return m;
    };
    let prims = {
      sphere: mkprim(new THREE.SphereGeometry(0.25, 16, 16)),
      box: mkprim(new THREE.BoxGeometry(0.5, 0.5, 0.5)),
      cylinder: mkprim(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 16))
    };

    /*
    var mesh = new THREE.Mesh( new THREE.ConvexBufferGeometry(points ));
    */
    let doOp = el => {
      let t = el.type;
      el.csg = new CSG();
      if (t === "union") {
        for (let i = 0; i < el.args.length; i++)el.args[i].src = el.args[i].getMesh();
        for (let i = 0; i < el.args.length; i++)
          el.csg = el.csg.union(el.args[i].csg);
        el._mesh = el.getMesh();
        el._mesh.material = new THREE.MeshStandardMaterial();
      }
    };

    function render() {
      while (scene.children.length) scene.remove(scene.children[0]);
      self.elements.length = 0;
      for (let e = arguments, i = 0; i < e.length; i++) {
        let el = e[i];
        let t = el.type;
        if (prims[t]) {
          el.setMesh(prims[t].clone(true));
          let mesh = (el._mesh = el.getMesh());
          //debugger
          mesh.position.copy(el._position);
          mesh.scale.copy(el._scale);
          mesh.rotation.copy(el._rotation);
          if(!mesh.material)
            debugger
            
          el._rotation = mesh.rotation;
          el._position = mesh.position;
          el._scale = mesh.scale;
          
        } else doOp(el);
        let m = el._mesh;
        m.userData.node = el;
        self.elements.push(m);
        scene.add(m);
      }
      return self;
    }

    this.eval = str => {
      eval(str);
      return this;
    };
    /*
    let f = `
let s = sphere().size(1,1,1).position(.15, 0.25, -.15)
let b = box().size(1,1,1).position(.15, 0.25, .25)
let c = cylinder().size(1,1,1).position(.15, 0.25, -.35)
let u = union(b,s,c)
      render(u,b,s,c)
    `;

    this.eval(f);
*/
    // debugger
    let s = sphere()
      .size(1, 1, 1)
      .position(0.15, 0.25, -0.15);
    let b = box()
      .size(1, 1, 1)
      .position(0.15, 0.25, 0.25);
    let c = cylinder()
      .size(1, 1, 1)
      .position(0.15, 0.25, -0.35);
   //let u = union(s, c);

    this.update = () => {
      return render(b, s, c, union( s, c)).elements;
    };
    this.update();

    /*    render(
      sphere().size(1, 1, 1)
        .position(.15, 0.5, -.15),
      box()
        .size(1, 1, 1)
        .position(.15, .5, .15),
      cylinder()
    );
*/
  }
}
export default FCAD;
