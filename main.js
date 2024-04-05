import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

const scene = new THREE.Scene();

//const gridHelper = new THREE.GridHelper(5, 5, 0xaec6cf, 0xaec6cf);
//scene.add(gridHelper);

//grid xyz
//const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});

//floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(7.5, 7.5, 1, 1),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('assets/floor.png'),
    side: THREE.DoubleSide,
    lightMap: new THREE.TextureLoader().load('assets/floor.png')
  })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

//walls similar to floor but with different texture and rotation
const wall1 = new THREE.Mesh(
  new THREE.PlaneGeometry(7.5, 7.5, 1, 1),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('assets/wall.png'),
    side: THREE.DoubleSide,
    lightMap: new THREE.TextureLoader().load('assets/wall.png')
  })
);
wall1.position.z = -3.75;
wall1.position.y= 3.75;

scene.add(wall1);

const wall2 = wall1.clone();
wall2.rotation.y = Math.PI / 2;
wall2.position.x = -3.75;
wall2.position.z = 0;
wall2.position.y= 3.75;
scene.add(wall2);


//objs

const loader = new GLTFLoader();
let char;
let cameraobj;
let tv;
let table;

loader.load('assets/char.glb', function (gltf) {
  char = gltf.scene;
  char.scale.set(0.5, 0.5, 0.5);
  char.position.set(0, 0, -1);
  char.rotation.y = Math.PI;
  scene.add(char);
});

loader.load('assets/camera.glb', function (gltf) {
  cameraobj = gltf.scene;
  cameraobj.scale.set(0.3, 0.3, 0.3);
  cameraobj.position.set(2, 2, 2);
  cameraobj.lookAt(0, 0 ,0);
  scene.add(cameraobj);
});
//light for camera
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight2.position.set(2, 3.7, 2);
scene.add(directionalLight2);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(1, 2, 1);
scene.add(directionalLight);


loader.load('assets/tv.glb', function (gltf) {
  tv = gltf.scene;
  tv.scale.set(0.5, 0.5, 0.5);
  tv.position.set(0, 0.5, 2.3);
  scene.add(tv);
});

//tv screen light 
const tvLight = new THREE.PointLight(0xffcc00, 15, 100);
tvLight.position.set(0, 0.5, 2.3);
scene.add(tvLight);

//tv stand
loader.load('assets/table.glb', function (gltf) {
  table = gltf.scene;
  table.scale.set(0.5, 0.5, 0.5);
  table.position.set(0, 0, 2.3);
  scene.add(table);
});


window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

/* Liner Interpolation
 * lerp(min, max, ratio)
 * eg,
 * lerp(20, 60, .5)) = 40
 * lerp(-20, 60, .5)) = 20
 * lerp(20, 60, .75)) = 50
 * lerp(-20, -10, .1)) = -.19
 */
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start, end) {
  return (scrollPercent - start) / (end - start);
}

const animationScripts = [];

//add an animation first 40 percent of scroll
animationScripts.push({
  start: 0,
  end: 40,
  func: () => {
    camera.position.set(0, 1, 2);
    camera.position.z = lerp(1, 12, scalePercent(0, 40)*0.3);
    //console.log(cube.position.z)
  },
});

//add an animation 
animationScripts.push({
  start: 70,
  end: 101,
  func: () => {
    tvLight.color.set(Math.random() * 0xffffff); // Change the TV light color to a random color on each frame
    tvLight.intensity = Math.random() * 10 + 10;
    //    console.log(Date.now())
    // use date.now because time is always changing
    cameraobj.position.x = char.position.x + Math.sin(Date.now() * 0.001) * 2; 
    cameraobj.position.z = char.position.z + Math.cos(Date.now() * 0.001) * 2;
    cameraobj.lookAt(char.position);
  },
});

//add an animation
animationScripts.push({
  start: 60,
  end: 80,
  func: () => {
    camera.position.x = lerp(0, 5, scalePercent(60, 80)*0.4);
    camera.position.y = lerp(1, 5, scalePercent(60, 80)*0.4);
    camera.lookAt(char.position);
    //console.log(camera.position.x + " " + camera.position.y)
  },
});

function playScrollAnimations() {
  animationScripts.forEach((a) => {
    if (scrollPercent >= a.start && scrollPercent < a.end) {
      a.func();
    }
  });
}

let scrollPercent = 0;

document.body.onscroll = () => {
  //calculate the current scroll progress as a percentage
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
      ((document.documentElement.scrollHeight ||
        document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100;
};

const stats = new Stats();

function animate() {
  requestAnimationFrame(animate);

  playScrollAnimations();

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}


  const controls = new PointerLockControls(camera, document.body);
  document.addEventListener('click', () => {
    controls.lock();
  });
   
  //get camera looking direction
  //console.log(camera.getWorldDirection(new THREE.Vector3()));
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'w') {
      controls.moveForward(0.1);
    }
    if (e.key === 's') {
      controls.moveForward(-0.1);
    }
    if (e.key === 'a') {
      controls.moveRight(-0.1);
    }
    if (e.key === 'd') {
      controls.moveRight(0.1);
    }
  });

window.scrollTo({ top: 0, behavior: 'smooth' });
animate();
