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
    return Prims[this.type](this);
  }
}

class Prims {
  static bindNodeToMesh(e,m){
    m.position.copy(e._position)
    m.scale.copy(e._scale)
    m.rotation.copy(e._rotation)
    m.userData.node = e;
    return m
  }
  static mesh(e, geometry, material = frontMaterial) {
    let m = new THREE.Mesh(geometry, material);
    Prims.bindNodeToMesh(e,m)
    return m
  }
  static empty(e,material) {
    return this.mesh(e, new THREE.Geometry(),material);
  }
  static sphere(e,material) {
    return this.mesh(e, new THREE.SphereGeometry(.5, 16, 16),material);
  }
  static box(e,material) {
    return this.mesh(e, new THREE.BoxGeometry(1,1,1),material);
  }
  static cylinder(e,material) {
    return this.mesh(e, new THREE.CylinderGeometry(0.5, 0.5, 1, 16),material);
  }
  static union(e) {
    if(e.args.length){
      //debugger
      let p = Prims.empty(e,csgMaterial)
      var bspA = CSG.fromMesh( p );
      e.args.forEach((b,i)=>{if(!i)return
        let bspB = CSG.fromMesh( b.getMesh() );
        bspA = bspA.union(bspB)
      })
      return Prims.bindNodeToMesh(e,CSG.toMesh( bspA, p.matrix,csgMaterial));
    }
    return Prims.sphere(e,csgMaterial);
  }
  static subtract(e) {
    return Prims.sphere(e,csgMaterial);
  }
  static intersect(e) {
    return Prims.sphere(e,csgMaterial);
  }
  static invert(e) {
    return Prims.sphere(e,csgMaterial);
  }
}

let empty = new THREE.Object3D()
class FCAD {
  toJSON()
  {
    let id=0;
    this.nodes.forEach(n=>n.id=id++)
    let out=[]
    this.nodes.forEach(n=>{
      if(n.args){
        let ids=[]
        n.args.forEach((a,i)=>ids.push(a.id))
        n.iargs=ids;
      }
    })
    this.nodes.forEach(n=>{
      let o={}
      o.type=n.type
      n.name && (o.name = n.name);
      n.args && n.args.length && (o.args=n.iargs);
      (!n._position.equals(empty.position)) && (o.position=n._position);
      (!n._scale.equals(empty.scale)) && (o.scale=n._scale);
      (!n._rotation.equals(empty.rotation)) && (o.rotation=n._rotation);
      out.push(o)
    })
    return out;
  }
  fromJSON(js){
    js.forEach((e,i)=>this.nodes.push(new FNode(this,e.type)))
    for(let i=0;i<js.length;i++)
    js.forEach((e,i)=>e.args && e.args.forEach((a,ai)=>e.args[ai]=this.nodes[a]))
  }
  
  
  constructor(scene) {
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
let mkDefault=()=>{
    let self = this;
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
    }

    let a = box()
      .size(1, 1, 1)
      .position(1,.5,1);

    let b = cylinder()
      .size(1, 1, 1)
      .position(2,.5,2);

    let c = sphere()
      .size(1, 1, 1)
      .position(3,.5,2);

    let u = union(a, b)
    
    function render() {
      self.elements = [];
      for (let a = arguments, i = 0; i < a.length; i++) {
        let n = a[i];
        self.elements.push(n.getMesh());
      }
      return self;
    }

    this.update = () => {
      return render(a, b, c, u ).elements;
    };
}

this.update=()=>{
      return this;}

    this.update();
    console.log(this.toJSON())
  }
}
export default FCAD;

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

const csgMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  opacity: 0.9,
  transparent: false,
  side: THREE.FrontSide
});
/*

[
  {name:'a',type:'sphere'}
]

     
    //var mesh = new THREE.Mesh( new THREE.ConvexBufferGeometry(points ));
    
    
    let doOp = el => {
      let t = el.type;
      el.csg = new CSG();
      if (t === "union") {
        //debugger
        if(el.args.length){el.src = el.args[0].getMesh(); el.csg = CSG.fromMesh(el.src);}
        for (let i = 1; i < el.args.length; i++)
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
          let p = prims[t].clone(true)
          p.position.copy(el._position);
          p.scale.copy(el._scale);
          p.rotation.copy(el._rotation);
          el.setMesh(p);
          el._mesh = el.getMesh();
        } else doOp(el);
        self.elements.push(el._mesh);
        scene.add(el._mesh);
      }
      return self;
    }

    this.eval = str => {
      eval(str);
      return this;
    };

getMesh() {
    this.src.updateMatrixWorld();
    let m = CSG.toMesh(this.csg, this.src.matrix, this.src.material);
    m.updateMatrixWorld();
    m.renderOrder = 2;
    let b = new THREE.Mesh(m.geometry, backMaterial);
    m.add(b);
    b.renderOrder = 1;
    m.userData.node = this;
    return this.mesh = m;
  }
  setSrc(src) {
    this.src = src;
    this.csg = CSG.fromMesh(this.src);
    return this.src;
  }
*/
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
/*
    let s = sphere()
      .size(1.5, 1.5, 1.5)
      .position(0.15, 0.25, -0.15);
    let b = box()
      .size(1, 1, 1)
      .position(0.15, 0.25, 0.25);
    let c = cylinder()
      .size(1, 1, 1)
      .position(0.15, 0.25, -0.35);
   //let u = union(s, c);
*/

/*    render(
      sphere().size(1, 1, 1)
        .position(.15, 0.5, -.15),
      box()
        .size(1, 1, 1)
        .position(.15, .5, .15),
      cylinder()
    );
*/
