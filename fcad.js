import * as THREE from "https://threejs.org/build/three.module.js";

class FCAD {
  class FNode{
    constructor(fcad){
      this.fcad = fcad;
    }
  }
  constructor(scene) {
    this.scene = scene;
    this.elements=[]
    let vec3=(x,y,z)=>new THREE.Vector3(x,y,z)
    let eval=(str){
      return this;
    }
    let hull=()=>{
      return this;      
    }
    let subtract=()=>{
      return this;
    }
  }
  update(){
    
    return this
  }
}
export default FCAD;
