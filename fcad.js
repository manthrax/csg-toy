import * as THREE from "https://threejs.org/build/three.module.js";

class FNode{
  constructor(fcad,srcMesh){
    this.src=srcMesh;
    this.fcad = fcad;
    this.size = new THREE.Vector3(1,1,1)
    this.scale = new THREE.Vector3(1,1,1)
    this.position = new THREE.Vector3(0,0,0)
    this.rotation = new THREE.Euler(0,0,0,'XYZ')
  }
  size(x,y,z){
    this.size.set(x,y,z)
    return this;
  }
  scale(x,y,z){
    this.scale.set(x,y,z)
    return this;
  }
  position(x,y,z){
    this.position.set(x,y,z)
    return this;
  }
  rotation(x,y,z){
    this.rotation.set(x,y,z)
    return this;
  }
}

class FCAD {
  constructor(scene) {
    this.scene = scene;
    this.elements=[]
    let vec3=(x,y,z)=>new THREE.Vector3(x,y,z)

    let sphere=()=>{
      let fn = new FNode(this)
      return fn;
    }
    let box=()=>{      
      let fn = new FNode(this)
      return fn;
    }
    let cylinder=()=>{      
      let fn = new FNode(this)
      return fn;
    }
    let hull=(a)=>{
      return this;
    }
    let union=(a)=>{
      return this;
    }
    let subtract=(a)=>{
      return this;
    }
    let intersect=(a)=>{
      return this;
    }
    let invert=(a)=>{
      return this;
    }

    let recompute=()=>{
      debugger
      return this
    }
    
    let feval=(str)=>{
      return this;
    }
    this.eval = feval

    let f=`
    recompute(union(sphere(),box()))
    `
    this.eval(f)
  }

}
export default FCAD;

