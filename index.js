import {
    PerspectiveCamera,
    WebGLRenderer,
    TextureLoader,
    Scene,
    Color,
    DoubleSide,
    Vector3,
    Spherical,
    MeshBasicMaterial,
    SphereGeometry,
    Mesh,
    Math as _Math,
    ImageLoader
} from 'three'
import {OrbitControls} from './lib/OrbitControls.js'
import {Transition} from './transition.js'

const origin = new Vector3();

const steps = [].slice.call(document.querySelectorAll('.steps .step-state'));

let width = window.innerWidth;
let height = window.innerHeight;

let mouseX = 0,
    mouseY = 0;

let transition;

const radius = 100;

const state = {};

const container = document.getElementById('container');

const camera = new PerspectiveCamera(30, width / height, 1, 10000);
camera.position.set(0, 0, 1600);

const controls = new OrbitControls(camera);
controls.dampingFactor = 0.12;
controls.rotateSpeed = 0.2;
controls.minDistance = 1000;
controls.maxDistance = 2000;

const scene = new Scene();
scene.background = new Color(0x273142);

const renderer = new WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const texture = new TextureLoader().load('/public/world.jpg');

const earthMaterial = new MeshBasicMaterial({
    side: DoubleSide, map: texture,
    // color: 0, wireframe: true
});
const earthGeometry = new SphereGeometry(radius, 32, 32, -Math.PI / 2, Math.PI * 2 - 0.0001, 0.008, Math.PI - 0.016);

state.sphere = earthGeometry.vertices.map(v => v.clone());

const spherical = new Spherical();
state.cylinder = [];
state.plane = [];

earthGeometry.vertices.map(v => {

    spherical.setFromVector3(v);

    const lon = Math.PI / 2 - spherical.theta;
    const lat = _Math.clamp(Math.PI / 2 - spherical.phi, -1.483, 1.483);

    state.cylinder.push(new Vector3(radius * Math.cos(lon), radius * Math.log(Math.tan(Math.PI / 4 + lat / 2)), radius * Math.sin(lon)))

    state.plane.push(new Vector3(-radius * lon + Math.PI / 2 * radius, radius * Math.log(Math.tan(Math.PI / 4 + lat / 2)), 0))
})

const earth = new Mesh(earthGeometry, earthMaterial);

scene.add(earth);

steps.map((dom, i) => {
    const names = ['sphere', 'cylinder', 'plane'];
    dom.addEventListener('click', () => {
        steps.map(e => e.className = e.className.replace(/ active/, ''));
        dom.className += ' active';
        to(state[names[i]], 1000, i === 2);
    }, false)
})

document.addEventListener('mousemove', onDocumentMouseMove, false);
window.addEventListener('resize', onWindowResize, false);

function to(target, time, resetCamera) {
    if (transition) {
        transition.stop();
    }

    const to = target;
    const from = earthGeometry.vertices.map(v => v.clone());

    transition = new Transition(earthGeometry, from, target, time, camera, camera.position.clone(), new Vector3(0, 0, 1600));
    transition.start();
}

function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - width / 2) / 2;
    mouseY = (event.clientY - height / 2) / 2;
}

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    if (transition) {
        transition.update();
    }
    render();
}

function render() {
    // camera.position.x += ( mouseX * 2 - camera.position.x ) * .05;
    // camera.position.y += ( - mouseY * 2 - camera.position.y ) * .05;
    camera.lookAt(new Vector3())
    renderer.render(scene, camera);
}

animate();
