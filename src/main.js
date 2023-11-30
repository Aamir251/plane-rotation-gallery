
import * as dat from 'dat.gui'
import * as THREE from "three";
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { img1, img2, img3, img4 } from './textures-export';

import gsap from 'gsap';


const canvas = document.querySelector("canvas#slider");
const sizes = {
  width : window.innerWidth,
  height : window.innerHeight
}

const settings = {
  progress : 0.0
}

const gui = new dat.GUI()

const images = [img1, img2, img3, img4 ]
const textureLoader = new THREE.TextureLoader()
const textures = images.map(img => textureLoader.load(img));

/**
 * THREE JS SCENE 
*/

const scene = new THREE.Scene()
/**
 * Camera
*/
const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 1000);
camera.position.z = 700;
camera.fov = 2 * Math.atan((sizes.height / 2)/600) * (180 / Math.PI);

camera.updateProjectionMatrix()
scene.add(camera)


/**
 *  Plane Geometry &  Material
*/

const planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100)

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms : {
    uTexture : { value : new THREE.Vector2(0, 0) },
    uProgress : { value : settings.progress },
    uTexture : { value : textures[0] }
  },
  side : 2
})


const planeMesh = new THREE.Mesh(planeGeometry, material)

planeMesh.scale.set(400, 400, 1)
scene.add(planeMesh)

/**
 *  For scroll events 
*/

let scroll = 0;
let scrollTarget = 0;
let currentScroll = 0;

const scrollEvent = () =>
{
  document.addEventListener('mousewheel', e => {
    scrollTarget = e.wheelDeltaY * 0.8;
  })
}

scrollEvent()

let value = {
  x : 0
}

let timeoutId;
const updateMeshPosition = () => {
  clearTimeout(timeoutId)
  gsap.to(value, {
    x : value.x + Math.PI * 2,
    duration : 1,
    onStart : () => {
      timeoutId = setTimeout(() => {
        planeMesh.material.uniforms.uTexture.value = textures[1]
      }, 400)
    }
  })

  
}


gui.add(settings, 'progress').min(0).max(1).step(0.1)

window.addEventListener('click', updateMeshPosition)

/**
 * Renderer
*/
const renderer = new THREE.WebGLRenderer({
  canvas
})

/** 
 * Orbit Controls
*/
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Tick function
*/

const tick = () =>
{

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scroll += (scrollTarget - scroll) * 0.08
  scroll *= 0.9;
  scrollTarget *= 0.9;
  currentScroll += scroll * 0.005;


  planeMesh.position.x = Math.sin(value.x) * 400;
  planeMesh.position.z = Math.cos(value.x) * 200;
  planeMesh.rotation.y = (value.x)

  // update orbitol controls
  // controls.update()

  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)


}


tick()


/**
 *  Handle Resize 
*/

const handleResize = () =>
{
  // update the sizes variable
  sizes.width = window.innerWidth,
  sizes.height = window.innerHeight;

  // update camera
  camera.aspect = sizes.width / sizes.height
  camera.fov = Math.atan((sizes.height / 2)/600) * (180 / Math.PI) * 2;
  // update the Three JS Projections matrix
  camera.updateProjectionMatrix()
  // update renderer
  // renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  
}

window.addEventListener('resize', handleResize)
handleResize()