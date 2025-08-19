import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

export default class SceneInit {
  public scene: THREE.Scene | undefined;
  public camera: THREE.PerspectiveCamera | undefined;
  public renderer: THREE.WebGLRenderer | undefined;
  public composer: EffectComposer | undefined;
  private renderPass: RenderPass | undefined;
  private outlinePass: OutlinePass | undefined;
  private postProcessingEnabled: boolean = false;

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
  
  // Performance optimization: frame rate limiting
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / 60;
  private lastFrameTime: number = 0;

  constructor(canvasId: string, containerId: string = 'model-container') {
    this.canvasId = canvasId;
    this.containerId = containerId;
  }

  initialize(): void {
    this.scene = new THREE.Scene();

    const container =
      (document.querySelector('.model-container') as HTMLElement) ||
      document.body;
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
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true, // Enable antialiasing for better quality in non-performance mode
      alpha: true,
    });
    
    // Optimize pixel ratio for performance vs quality balance
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2.0); // Increased from 1.5 for better quality
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setClearColor(0x000000, 0); // transparent

    // Enhanced settings for better visual quality
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.4; // Decreased from 1.6 for better balanced brightness
    this.renderer.shadowMap.enabled = false; // Keep shadows disabled for performance
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Enable better texture filtering for improved material quality
    // Note: Anisotropic filtering is handled per-texture, not globally

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer!.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false;
    this.controls.enableDamping = false;

    // Optimized lighting setup - enhanced for anime style (reduced intensity)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Increased from 0.6 for better overall illumination
    this.scene.add(this.ambientLight);

    // Main directional light for toon shading
    this.directionalLight = new THREE.DirectionalLight(
      new THREE.Color(0xfff2cc),
      1.6 // Increased from 1.4 for better main illumination
    );
    this.directionalLight.position.set(60, 120, 80);
    this.directionalLight.castShadow = false; // Disable shadows for performance
    this.scene.add(this.directionalLight);

    // Rim light for edge definition
    this.rimLight = new THREE.DirectionalLight(new THREE.Color(0xcfe8ff), 0.8); // Increased from 0.7 for better edge definition
    this.rimLight.position.set(-80, 60, -120);
    this.scene.add(this.rimLight);

    // Enhanced hemisphere light for toon materials
    this.hemiLight = new THREE.HemisphereLight(0x88baff, 0xffe1b0, 0.5); // Increased from 0.4 for better ambient lighting
    this.scene.add(this.hemiLight);

    // Additional fill light for better anime illumination
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5); // Increased from 0.4 for better fill lighting
    fillLight.position.set(-60, 40, 60);
    this.scene.add(fillLight);

    // Top light for better overall illumination
    const topLight = new THREE.DirectionalLight(0xffffff, 0.4); // Increased from 0.3 for better top illumination
    topLight.position.set(0, 200, 0);
    this.scene.add(topLight);

    // Subtle rim light for anime edge definition
    const animeRimLight = new THREE.DirectionalLight(0xffe1b0, 0.4); // Increased from 0.3 for better edge definition
    animeRimLight.position.set(0, -100, -200);
    this.scene.add(animeRimLight);

    // Simplified environment - disable complex environment mapping for performance
    // this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    // const env = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.01).texture;
    // this.envTexture = env;
    // this.scene.environment = env;

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  animate(): void {
    const loop = (currentTime: number) => {
      this.animationId = window.requestAnimationFrame(loop);
      
      // Frame rate limiting for better performance
      if (currentTime - this.lastFrameTime < this.frameInterval) {
        return;
      }
      
      this.lastFrameTime = currentTime;
      this.render();

      if (this.controls) this.controls.update();
      if (this.animationMixer && this.clock) {
        this.animationMixer.update(this.clock.getDelta());
      }
    };
    loop(0);
  }

  render(): void {
    if (!this.scene || !this.camera || !this.renderer) return;

    if (this.postProcessingEnabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onWindowResize(): void {
    const container =
      document.querySelector('.model-container') || document.body;
    const rect = (container as HTMLElement).getBoundingClientRect();

    if (this.camera) {
      this.camera.aspect = rect.width / rect.height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(rect.width, rect.height);
    }

    if (this.composer) {
      this.composer.setSize(rect.width, rect.height);
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
          const mat =
            obj.material as THREE.Material | THREE.Material[] | undefined;
          if (mat) {
            Array.isArray(mat) ? mat.forEach((m) => m.dispose()) : mat.dispose();
          }
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

    // Dispose postprocessing
    if (this.outlinePass) {
      // OutlinePass doesn't expose dispose, let GC collect. Clear references.
      this.outlinePass = undefined;
    }
    if (this.renderPass) this.renderPass = undefined;
    if (this.composer) {
      // EffectComposer has no dispose, just drop references
      this.composer = undefined;
    }

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

  /**
   * Enable/disable screen-space outline postprocessing.
   * Optionally provide selected objects to outline. If omitted, keeps previous selection.
   */
  enableScreenSpaceOutline(enabled: boolean, selectedObjects?: THREE.Object3D[]): void {
    if (!this.scene || !this.camera || !this.renderer) return;

    // Initialize composer/passes lazily
    if (!this.composer) {
      const container =
        (document.querySelector('.model-container') as HTMLElement) ||
        document.body;
      const rect = container.getBoundingClientRect();
      this.composer = new EffectComposer(this.renderer);
      this.composer.setSize(rect.width, rect.height);
      this.renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(this.renderPass);
    }

    if (!this.outlinePass) {
      const size = this.renderer.getSize(new THREE.Vector2());
      this.outlinePass = new OutlinePass(size, this.scene, this.camera);
      this.outlinePass.edgeStrength = 3.0;
      this.outlinePass.edgeGlow = 0.0;
      this.outlinePass.edgeThickness = 1.0;
      this.outlinePass.visibleEdgeColor.set(0x000000);
      this.outlinePass.hiddenEdgeColor.set(0x000000);
      this.outlinePass.pulsePeriod = 0;
      this.outlinePass.usePatternTexture = false;
      this.composer!.addPass(this.outlinePass);
    }

    if (selectedObjects && this.outlinePass) {
      this.outlinePass.selectedObjects = selectedObjects;
    }

    this.postProcessingEnabled = enabled;
  }

  /** Update the objects that should be outlined by the screen-space pass. */
  setOutlineSelectedObjects(objects: THREE.Object3D[]): void {
    if (this.outlinePass) {
      this.outlinePass.selectedObjects = objects;
    }
  }
}
