import * as THREE from "https://threejs.org/build/three.module.js";

import CSG from "./three-csg.js";

import { ConvexBufferGeometry } from 'https://threejs.org/examples/jsm/geometries/ConvexGeometry.js';

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
  rotation(x, y, z, order = this.rotation.order) {
    this._rotation.set(x, y, z, order);
    return this;
  }
  get mesh() {
    let m = CSG.toMesh(this.csg, this.src.matrix, this.src.material);
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
}

class FCAD {
  constructor(scene) {
    this.scene = scene;
    this.elements = [];
    let vec3 = (x, y, z) => new THREE.Vector3(x, y, z);
    let sphere = () => new FNode(this, "sphere");
    let box = () => new FNode(this, "box");
    let cylinder = () => new FNode(this, "cylinder");
    let args=()=> Array.prototype.slice.call(arguments)
    let mesh = src => new FNode(this, "mesh", args());
    let hull = a => new FNode(this, "hull",  args());
    let union = a => new FNode(this, "union",  args());
    let subtract = a => new FNode(this, "subtract",  args());
    let intersect = a => new FNode(this, "intersect",  args());
    let invert = a => new FNode(this, "invert",  args());

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
    
    let self = this;
    function render() {
      while (scene.children.length) scene.remove(scene.children[0]);
      self.elements.length = 0;
      for (let e = arguments, i = 0; i < e.length; i++) {
        let el = e[i];
        let t = el.type;
        if (prims[t]) {
          el.mesh = prims[t].clone(true);
          let mesh = el._mesh = el.mesh
          mesh.position.copy(el._position);
          el._position = mesh.position
          mesh.scale.copy(el._scale);
          el._scale = mesh.scale
          mesh.rotation.copy(el._rotation);
          el._rotation = mesh.rotation
        }
        let m = el._mesh;
        self.elements.push(m);
        scene.add(m);
      }
      return self;
    }

    this.eval = str => {
      eval(str);
      return this;
    };
    let f = `
let s = sphere().size(1,1,1).position(.15, 0.5, -.15)
let b = box().size(1,1,1).position(.15, 0.5, .15)
let c = cylinder().size(1,1,1).position(.15, 0.5, .15)
      render(union(b,s,c))
    `;

    this.eval(f);
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
