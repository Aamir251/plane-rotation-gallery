
import * as dat from 'dat.gui'
import * as THREE from "three";
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { img1, img2, img3, img4 } from './textures-export';
import gsap from 'gsap';
import pageableMin from 'pageable';

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
const planeMaterial = new THREE.MeshPhongMaterial({ color : 0xffffff, side : THREE.DoubleSide, shininess: 0, specular: 0x000000 })

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms : {
    uTexture : { value : new THREE.Vector2(0, 0) },
    uProgress : { value : settings.progress },
    uTexture : { value : textures[0] },
    uTime : { value : 0 }
  },
  side : 2
})


const sliderPlaneMesh = new THREE.Mesh(planeGeometry, material)
sliderPlaneMesh.castShadow = true;
sliderPlaneMesh.position.y = 50

sliderPlaneMesh.scale.set(400, 400, 1)
scene.add(sliderPlaneMesh)

/** Plane that receives shadow */
const planeShadowMesh = new THREE.Mesh(planeGeometry, planeMaterial)

planeShadowMesh.scale.set(sizes.width, sizes.height, 1000)
planeShadowMesh.rotation.x = Math.PI * -0.3
planeShadowMesh.position.y = -250

planeShadowMesh.receiveShadow = true
scene.add(planeShadowMesh)


/**
 * Lights
*/

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)


const light2 = new THREE.DirectionalLight(0xffffff, 1);
light2.castShadow = true;
light2.shadow.camera.left = -500;
light2.shadow.camera.right = 500;
light2.shadow.camera.top = 500;
light2.shadow.camera.bottom = -500;
light2.shadow.camera.near = 1;
light2.shadow.camera.far = 1000;
light2.position.set(0, 100, 50);

/** Extra directional lights for brightening up the plane that receives shadow */
const light1 = new THREE.DirectionalLight(0xffffff, 1);
const light3 = new THREE.DirectionalLight(0xffffff, 1);

scene.add(light1)
scene.add(light3)
scene.add(light2)


const helper = new THREE.DirectionalLightHelper(light2)
scene.add(helper)
// const spotLightHelper = new THREE.SpotLightHelper(spotLight)
// scene.add(spotLightHelper)

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

const value = {
  x : 0
}

let timeoutId;
let lastIndex = 0
const updateMeshPosition = (index) => {
  const sign = Math.sign(index - lastIndex)
  console.log(sign);
  clearTimeout(timeoutId)
  gsap.to(value, {
    x : value.x + (Math.PI * 2) * sign,
    duration : 0.6,
    onStart : () => {
      timeoutId = setTimeout(() => {
        sliderPlaneMesh.material.uniforms.uTexture.value = textures[index]
      }, 250)
    },
    // onComplete : () => {
    //   value.x += Math.PI * 2
    // }
  })
  lastIndex = index

}


gui.add(settings, 'progress').min(0).max(1).step(0.1)


/**
 * Renderer
*/
const renderer = new THREE.WebGLRenderer({
  canvas
})
renderer.setClearColor (0xffffff, 0.0);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.BasicShadowMap; // default THREE.PCFShadowMap


/** 
 * Orbit Controls
*/
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Tick function
*/
let time = 0;
const tick = () =>
{
  time += 0.001;
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scroll += (scrollTarget - scroll) * 0.08;
  scroll *= 0.9;
  scrollTarget *= 0.9;
  currentScroll += scroll * 0.005;

  sliderPlaneMesh.position.x = Math.sin(value.x) * 400;
  sliderPlaneMesh.position.z = Math.cos(value.x) * 200;
  sliderPlaneMesh.rotation.y = (value.x)
  sliderPlaneMesh.material.uniforms.uTime.value = time

  // update orbitol controls
  controls.update()

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


  planeShadowMesh.scale.set(sizes.width, sizes.height, 1000)

  // update camera
  camera.aspect = sizes.width / sizes.height
  camera.fov = Math.atan((sizes.height / 2)/600) * (180 / Math.PI) * 2;
  // update the Three JS Projections matrix
  camera.updateProjectionMatrix()
  // update renderer
  // renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  // renderer.shadowMap.enabled = true   
  
}

window.addEventListener('resize', handleResize)
handleResize()

/**
 * FullPage JS
*/

new pageableMin("#container", {
  animation : 600,
  onStart : (el) => {
    updateMeshPosition(Number(el)-1)
  },
  onScroll : (el) => {
    // console.log("update ", el);
  }
});
