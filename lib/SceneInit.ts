// lib/SceneInit.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export default class SceneInit {
  public scene: THREE.Scene | undefined;
  public camera: THREE.PerspectiveCamera | undefined;
  public renderer: THREE.WebGLRenderer | undefined;

  private fov: number = 75;
  private nearPlane: number = 1;
  private farPlane: number = 2000;
  private canvasId: string;
  private containerId: string;

  private clock: THREE.Clock | undefined;
  private controls: OrbitControls | undefined;

  private ambientLight: THREE.AmbientLight | undefined;
  private directionalLight: THREE.DirectionalLight | undefined;
  private rimLight: THREE.DirectionalLight | undefined;

  private hemiLight: THREE.HemisphereLight | undefined;

  private pmremGenerator: THREE.PMREMGenerator | undefined;
  private envTexture: THREE.Texture | undefined;

  private animationId: number | null = null;

  public animationMixer: THREE.AnimationMixer | null = null;

  constructor(canvasId: string, containerId: string = 'model-container') {
    this.canvasId = canvasId;
    this.containerId = containerId;
  }

  initialize(): void {
    this.scene = new THREE.Scene();

    const container = document.querySelector('.model-container') as HTMLElement || document.body;
    const rect = container.getBoundingClientRect();

    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      rect.width / rect.height,
      this.nearPlane,
      this.farPlane
    );
    this.camera.position.set(0, 200, 600);

    const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!canvas) throw new Error(`Canvas with id "${this.canvasId}" not found`);

    // Transparent background so container background image shows through
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setClearColor(0x000000, 0); // transparent
    // Subtle brightness/contrast bump with filmic tone mapping
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer!.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false;
    this.controls.enableDamping = false;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(new THREE.Color(0xfff2cc), 1.6);
    this.directionalLight.position.set(60, 120, 80);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.set(1024, 1024);
    this.directionalLight.shadow.bias = -0.0005;
    this.scene.add(this.directionalLight);

    this.rimLight = new THREE.DirectionalLight(new THREE.Color(0xcfe8ff), 1.0);
    this.rimLight.position.set(-80, 60, -120);
    this.scene.add(this.rimLight);

    // Gentle sky/ground fill for more natural skin and subtle contrast
    this.hemiLight = new THREE.HemisphereLight(0x88baff, 0xffe1b0, 0.15);
    this.scene.add(this.hemiLight);

    // Physically-based environment for better highlights/speculars without an external HDR
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const env = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.envTexture = env;
    this.scene.environment = env;

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  animate(): void {
    const loop = () => {
      this.animationId = window.requestAnimationFrame(loop);
      this.render();
      if (this.controls) this.controls.update();
      if (this.animationMixer && this.clock) {
        this.animationMixer.update(this.clock.getDelta());
      }
    };
    loop();
  }

  render(): void {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize(): void {
    const container = document.querySelector('.model-container') || document.body;
    const rect = (container as HTMLElement).getBoundingClientRect();

    if (this.camera) {
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize(rect.width, rect.height);
    }
  }

  setAnimationMixer(mixer: THREE.AnimationMixer): void {
    this.animationMixer = mixer;
  }

  dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));

    if (this.controls) this.controls.dispose();
    if (this.animationMixer) {
      this.animationMixer.stopAllAction();
      this.animationMixer = null;
    }

    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const mat = obj.material as THREE.Material | THREE.Material[] | undefined;
          if (mat) Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat.dispose();
        }
      });
      // Clear environment reference
      this.scene.environment = null;
    }
    if (this.envTexture) {
      this.envTexture.dispose();
      this.envTexture = undefined;
    }
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
      this.pmremGenerator = undefined;
    }
    if (this.renderer) this.renderer.dispose();

    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.controls = undefined;
    this.clock = undefined;
    this.ambientLight = undefined;
    this.directionalLight = undefined;
    this.rimLight = undefined;
    this.hemiLight = undefined;
  }
}