import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Initialisation de la scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1e1e2f); // Fond sombre sympa

// Caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 3, 5);

// Rendu
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lumière
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Lumière blanche plus forte
scene.add(ambientLight);

// Chargement d'un modèle 3D (format GLTF / GLB)
const loader = new GLTFLoader();
let model;
loader.load('https://modelviewer.dev/shared-assets/models/Astronaut.glb', (gltf) => {
    model = gltf.scene;
    model.scale.set(1, 1, 1); // Échelle du modèle
    scene.add(model);

    // Création d'un point sur le casque
    const pointGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const points = [
        {
            model: new THREE.Mesh(pointGeometry, pointMaterial),
            position: [0, 1.8, 0.4],
            message: "Casque de l\'astronaute"
        },
        {
            model: new THREE.Mesh(pointGeometry, pointMaterial),
            position: [0, 1, 0.3],
            message: "B*** de l'astronaute"
        }
    ]

    for (let point of points) {
        point.model.position.set(...point.position);
        scene.add(point.model);
    }

    // Texte HTML
    const text = document.createElement('div');
    text.style.position = 'absolute';
    text.style.color = 'white';
    text.style.background = 'rgba(0, 0, 0, 0.6)';
    text.style.padding = '5px';
    text.style.borderRadius = '5px';
    text.innerHTML = '';
    text.style.display = 'none';
    document.body.appendChild(text);

    // Détection de survol
    window.addEventListener('mousemove', (event) => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        for (let point of points) {
            const intersects = raycaster.intersectObject(point.model);
            if (intersects.length > 0) {
                text.innerHTML = point.message;
                text.style.display = 'block';
                text.style.left = `${event.clientX}px`;
                text.style.top = `${event.clientY}px`;
                break;
            } else {
                text.style.display = 'none';
            }
        }
    });
}, undefined, (error) => {
    console.error('Erreur de chargement du modèle', error);
});

// Orbit Controls pour permettre de tourner autour de l'objet
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Inertie fluide
controls.dampingFactor = 0.1;
controls.minDistance = 3;
controls.maxDistance = 10;

// Resize automatique
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();