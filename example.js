/**
 * Ophanim Niner Bridge - Example Integration
 * 
 * This example demonstrates how to connect the Three.js Ophanim visualization
 * with the niner.pyjs framework to create a quantum-inspired visualization.
 */

// Import dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Niner, PyodideBridge, QuantumEntity, ModularEntity, Entity } from 'niner-pyjs';

// Initialize the Niner framework
const niner = new Niner();
const pyodideBridge = new PyodideBridge();

// Initialize Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 5);
controls.update();

// Create Ophanim rings
const createRing = (radius, color, segments = 64) => {
  const geometry = new THREE.TorusGeometry(radius, 0.05, 16, segments);
  const material = new THREE.MeshStandardMaterial({ 
    color: color,
    emissive: color,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });
  return new THREE.Mesh(geometry, material);
};

// Create the three rings with different radii
const outerRing = createRing(2.0, 0x4444ff);
const middleRing = createRing(1.5, 0x44ff44);
const innerRing = createRing(1.0, 0xff4444);

// Add rings to the scene
scene.add(outerRing);
scene.add(middleRing);
scene.add(innerRing);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create Niner entities and map to rings
const quantumEntity = new QuantumEntity('outerRing', { coherence: 0.9, uncertainty: 0.2 });
const moduleEntity = new ModularEntity('middleRing', { coherence: 0.7, uncertainty: 0.3 });
const dataEntity = new Entity('innerRing', { coherence: 0.5, uncertainty: 0.5 });

// Connect entities (establish quantum entanglement)
niner.connectEntities([quantumEntity, moduleEntity, dataEntity]);

// Initialize Python computation through PyodideBridge
async function initializePython() {
  await pyodideBridge.loadPyodide();
  
  // Define Python computation for quantum state
  const pythonCode = `
import numpy as np
from scipy.stats import norm

def calculate_quantum_state(time, coherence, uncertainty):
    """Calculate quantum state parameters based on time and properties"""
    # Oscillation frequency depends on coherence
    frequency = 0.5 + coherence * 2
    
    # Amplitude depends on uncertainty (more uncertainty = more movement)
    amplitude = uncertainty * 0.3
    
    # Calculate rotation angles
    x_rotation = amplitude * np.sin(frequency * time * 0.7)
    y_rotation = amplitude * np.sin(frequency * time * 1.3)
    z_rotation = amplitude * np.sin(frequency * time)
    
    # Calculate energy level (affects emission)
    energy = 0.5 + 0.5 * np.sin(time * coherence)
    
    return {
        'x_rotation': float(x_rotation),
        'y_rotation': float(y_rotation),
        'z_rotation': float(z_rotation),
        'energy': float(energy)
    }
  `;
  
  await pyodideBridge.runPython(pythonCode);
  console.log('Python runtime initialized');
}

// Update function for animation
let time = 0;
async function updateEntities() {
  time += 0.01;
  
  // Get quantum state from Python for each entity
  const outerState = await pyodideBridge.runPythonFunction(
    'calculate_quantum_state',
    [time, quantumEntity.properties.coherence, quantumEntity.properties.uncertainty]
  );
  
  const middleState = await pyodideBridge.runPythonFunction(
    'calculate_quantum_state',
    [time, moduleEntity.properties.coherence, moduleEntity.properties.uncertainty]
  );
  
  const innerState = await pyodideBridge.runPythonFunction(
    'calculate_quantum_state',
    [time, dataEntity.properties.coherence, dataEntity.properties.uncertainty]
  );
  
  // Update ring rotations based on quantum states
  outerRing.rotation.x = outerState.x_rotation;
  outerRing.rotation.y = outerState.y_rotation;
  outerRing.rotation.z = outerState.z_rotation;
  outerRing.material.emissiveIntensity = outerState.energy;
  
  middleRing.rotation.x = middleState.x_rotation;
  middleRing.rotation.y = middleState.y_rotation;
  middleRing.rotation.z = middleState.z_rotation;
  middleRing.material.emissiveIntensity = middleState.energy;
  
  innerRing.rotation.x = innerState.x_rotation;
  innerRing.rotation.y = innerState.y_rotation;
  innerRing.rotation.z = innerState.z_rotation;
  innerRing.material.emissiveIntensity = innerState.energy;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Only run this after Python is initialized
  if (pyodideBridge.isInitialized()) {
    updateEntities();
  }
  
  // Additional motion for visual interest
  outerRing.rotation.z += 0.001;
  middleRing.rotation.x += 0.001;
  innerRing.rotation.y += 0.001;
  
  controls.update();
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize and start animation
initializePython().then(() => {
  console.log('Starting animation');
  animate();
}).catch(err => {
  console.error('Failed to initialize Python:', err);
});
