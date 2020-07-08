import * as THREE from "https://threejs.org/build/three.module.js";

class FNode{
  constructor(fcad,params){
    this.fcad = fcad;
  }
  size(){
    return this;
  }
  scale(){
    return this;
  }
  position(){
    return this;
  }
  rotation(){
    return this;
  }
}

class FCAD {
  constructor(scene) {
    this.scene = scene;
    this.elements=[]
    let vec3=(x,y,z)=>new THREE.Vector3(x,y,z)

    let sphere=()=>{
      let fn = new FNode()
      
      return fn;
    }
    let box=()=>{      
    }
    let cylinder=()=>{      
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

