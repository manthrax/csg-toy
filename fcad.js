import * as THREE from "https://threejs.org/build/three.module.js";
import CSG from "./three-csg.js";
import { ConvexBufferGeometry } from "https://threejs.org/examples/jsm/geometries/ConvexGeometry.js";

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
  getMesh() {
    let p = Prims[this.type](this)
    p.updateMatrixWorld();
    return p
  }
}

class Prims {
  static bindNodeToMesh(e, m) {
    m.position.copy(e._position);
    m.scale.copy(e._scale);
    m.rotation.copy(e._rotation);
    m.castShadow = m.receiveShadow = true;
    m.userData.node = e;
    return m;
  }
  static mesh(e, geometry, material = frontMaterial) {

    let m = new THREE.Mesh(geometry, material);
    Prims.bindNodeToMesh(e, m);
    return m;
  }
  static empty(e, material) {
    return this.mesh(e, new THREE.Geometry(), material);
  }
  static sphere(e, material) {
    return this.mesh(e, new THREE.SphereGeometry(0.5, 16, 16), material);
  }
  static box(e, material) {
    return this.mesh(e, new THREE.BoxGeometry(1, 1, 1), material);
  }
  static cylinder(e, material) {
    return this.mesh(e, new THREE.CylinderGeometry(0.5, 0.5, 1, 16), material);
  }
  static operation(o,e){
    if (e.args.length) {
      //debugger
      let p = e.args[0].getMesh();//Prims.empty(e, csgMaterial);
      var bspA = CSG.fromMesh(p);
      e.args.forEach((b, i) => {
        if (!i) return;
        let bspB = CSG.fromMesh(b.getMesh());
        let op = o;
        b.operation && (op = b.operation)
        bspA = bspA[op](bspB);
      });
      //console.log(bspA)
      return Prims.bindNodeToMesh(e, CSG.toMesh(bspA, p.matrix, csgMaterial));
    }

    return Prims[e.type](e)
    //return Prims.sphere(e, csgMaterial);
  }
  static union(e) {
    return Prims.operation('union',e)
  }
  static subtract(e) {
    return Prims.operation('subtract',e)
  }
  static intersect(e) {
    return Prims.operation('intersect',e)
  }
  static invert(e) {
    return Prims.operation('invert',e)
  }
}



let backMaterial = new THREE.MeshStandardMaterial({
  color: "red",
  opacity: 0.5,
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false
});
let frontMaterial = new THREE.MeshStandardMaterial({
  color: "blue",
  opacity: 0.5,
  transparent: true,
  side: THREE.FrontSide
});

let csgMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  opacity: 0.9,
  transparent: false,
  side: THREE.FrontSide
});


let empty = new THREE.Object3D();
class FCAD {
  toJSON() {
    let id = 0;
    this.nodes.forEach(n => (n.id = id++));
    let out = [];
    this.nodes.forEach(n => {
      if (n.args) {
        let ids = [];
        n.args.forEach((a, i) => ids.push(a.id));
        n.iargs = ids;
      }
    });
    this.nodes.forEach(n => {
      let o = {};
      o.type = n.type;
      n.name && (o.name = n.name);
      n.args && n.args.length && (o.args = n.iargs);
      !n._position.equals(empty.position) && (o.position = n._position);
      !n._scale.equals(empty.scale) && (o.scale = n._scale);
      !n._rotation.equals(empty.rotation) && (o.rotation = n._rotation);
      n.operation &&  (o.operation = n.operation)
      out.push(o);
    });
    return out;
  }
  fromJSON(js) {
    js.forEach((e, i) => this.nodes.push(new FNode(this, e.type)));
    js.forEach((e, i) => {
      let n = this.nodes[i]
      e.args && e.args.forEach((a, ai) => (e.args[ai] = this.nodes[a]));
      e.args && (n.args=e.args)
      //debugger
      e.position && n._position.copy(e.position);
      e.scale && n._scale.copy(e.scale);
      e.rotation && n._rotation.copy(e.rotation);
      e.operation && (n.operation = e.operation);
    });
  }

  constructor(scene,csgMat = csgMaterial,frontMat = frontMaterial,backMat = backMaterial) {
    frontMaterial = frontMat
    backMaterial = backMat
    csgMaterial = csgMat;
    this.scene = scene;
    this.nodes = [];
    this.elements = [];

    let addNode = node => {
      this.nodes.push(node);
      return node;
    };
    function nnode(type, args) {
      return addNode(new FNode(self, type, Array.prototype.slice.call(args)));
    }

    let self = this;
    function render() {
      self.elements = [];
      for (let a = arguments, i = 0; i < a.length; i++) {
        let n = a[i];
        self.elements.push(n.getMesh());
      }
      return self;
    }
    this.update = () => {
      render(...this.nodes);
      localStorage.csgscene = JSON.stringify(this.toJSON());
      //debugger
      return this.elements;
    };

    let mkDefault = () => {
      let vec3 = (x, y, z) => new THREE.Vector3(x, y, z);
      let sphere = () => addNode(new FNode(this, "sphere"));
      let box = () => addNode(new FNode(this, "box"));
      let cylinder = () => addNode(new FNode(this, "cylinder"));

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

      let a = box()
        .size(1, 1, 1)
        .position(1, 0.5, 1);

      let b = box()
        .size(1, 1, 1)
        .position(2, 0.5, 2);

      let c = sphere()
        .size(1, 1, 1)
        .position(3, 0.5, 2);

      let d = cylinder()
        .size(1, 1, 1)
        .position(5, 0.5, 2);

      let u = union(a, b, c, d);

      //this.update = () => {
      //  return render(a, b, c, u).elements;
      //};
    };
    
    try {
      if(localStorage.needsReset)
        throw ""
      this.fromJSON(JSON.parse(localStorage.csgscene));
    } catch {
      delete localStorage.needsReset
      let def = `[{"type":"box","position":{"x":2.25,"y":1.2000000000000002,"z":1.8}},{"type":"box","position":{"x":2,"y":0.5,"z":1.7000000000000002}},{"type":"sphere","position":{"x":2.25,"y":1.75,"z":1.75}},{"type":"cylinder","position":{"x":2.6,"y":0.5,"z":1.1}},{"type":"union","args":[0,1,2,3],"position":{"x":-0.55,"y":1.2000000000000002,"z":-0.8}}]`
      this.fromJSON(JSON.parse(def));
      //mkDefault();
    }
    this.update();
    localStorage.csgscene = JSON.stringify(this.toJSON());
  }
}
export default FCAD;
