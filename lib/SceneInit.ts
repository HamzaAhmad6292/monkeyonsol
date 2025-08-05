// lib/SceneInit.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default class SceneInit {
  // Core components to initialize Three.js app
  public scene: THREE.Scene | undefined;
  public camera: THREE.PerspectiveCamera | undefined;
  public renderer: THREE.WebGLRenderer | undefined;

  // Camera params
  private fov: number = 75; // Increased FOV for wider view
  private nearPlane: number = 1;
  private farPlane: number = 2000; // Increased far plane
  private canvasId: string;
  private containerId: string;

  // Additional components
  private clock: THREE.Clock | undefined;
  // private stats: Stats | undefined;
  private controls: OrbitControls | undefined;

  // Lighting
  private ambientLight: THREE.AmbientLight | undefined;
  private directionalLight: THREE.DirectionalLight | undefined;
  private rimLight: THREE.DirectionalLight | undefined;

  // Animation frame ID for cleanup
  private animationId: number | null = null;

  // Animation mixer reference
  public animationMixer: THREE.AnimationMixer | null = null;

  constructor(canvasId: string, containerId: string = 'model-container') {
    this.canvasId = canvasId;
    this.containerId = containerId;
  }

  initialize(): void {
    this.scene = new THREE.Scene();

    // Get container dimensions instead of window dimensions
    const container = document.querySelector('.model-container') as HTMLElement || document.body;
    const containerRect = container.getBoundingClientRect();

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      containerRect.width / containerRect.height,
      this.nearPlane,
      this.farPlane
    );
    // Position camera much further back and elevated for better view
    this.camera.position.set(0, 200, 600); // Higher camera position

    // Specify a canvas which is already created in the HTML
    const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas with id "${this.canvasId}" not found`);
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });

    // Use container dimensions instead of window dimensions
    this.renderer.setSize(containerRect.width, containerRect.height);

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Disable zooming and scrolling
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false; // This disables rotation as well
    this.controls.enableDamping = false;

    // Neutral white ambient light - provides base illumination without color shift
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Pure white, moderate intensity
    this.scene.add(this.ambientLight);

    // Main directional light - pure white but positioned strategically
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    this.directionalLight.position.set(0, 100, 100); // Front-top lighting for even coverage
    this.scene.add(this.directionalLight);

    // Fill light from opposite side to reduce harsh shadows
    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.rimLight.position.set(0, 50, -100); // Behind lighting for fill
    this.scene.add(this.rimLight);

    // If window resizes, update based on container size
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  animate(): void {
    const animateLoop = () => {
      this.animationId = window.requestAnimationFrame(animateLoop);
      this.render();

      // if (this.stats) {
      //   this.stats.update();
      // }

      if (this.controls) {
        this.controls.update();
      }

      // Update animation mixer if it exists
      if (this.animationMixer && this.clock) {
        this.animationMixer.update(this.clock.getDelta());
      }

      // Update animation mixer if it exists
      if (this.animationMixer && this.clock) {
        this.animationMixer.update(this.clock.getDelta());
      }
    };
    animateLoop();
  }

  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize(): void {
    // Get container dimensions instead of window dimensions
    const container = document.querySelector('.model-container') || document.body;
    const containerRect = container.getBoundingClientRect();

    if (this.camera) {
      this.camera.aspect = containerRect.width / containerRect.height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(containerRect.width, containerRect.height);
    }
  }

  // Method to set the animation mixer from ThreeScene
  setAnimationMixer(mixer: THREE.AnimationMixer): void {
    this.animationMixer = mixer;
  }

  // ADD THIS METHOD - This was missing and causing the error
  dispose(): void {
    // Stop animation loop
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize.bind(this));

    // Remove stats from DOM
    // if (this.stats && this.stats.dom && this.stats.dom.parentNode) {
    // this.stats.dom.parentNode.removeChild(this.stats.dom);
    // }

    // Dispose of controls
    if (this.controls) {
      this.controls.dispose();
    }

    // Stop animation mixer
    if (this.animationMixer) {
      this.animationMixer.stopAllAction();
      this.animationMixer = null;
    }

    // Dispose of Three.js objects in the scene
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    }

    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Clear all references
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.controls = undefined;
    // this.stats = undefined;
    this.clock = undefined;
    this.ambientLight = undefined;
    this.directionalLight = undefined;
    this.rimLight = undefined;
  }
}