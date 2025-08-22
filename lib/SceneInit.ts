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

  // 3-Point Lighting System
  private keyLight: THREE.DirectionalLight | undefined;        // Main light (primary illumination)
  private fillLight: THREE.DirectionalLight | undefined;       // Fill light (softens shadows)
  private backLight: THREE.DirectionalLight | undefined;       // Back/rim light (separation from background)

  // Additional lighting for better coverage
  private ambientLight: THREE.AmbientLight | undefined;        // General ambient illumination
  private hemiLight: THREE.HemisphereLight | undefined;        // Natural sky/ground lighting

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
    // Maximum quality settings
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      precision: 'highp',
      powerPreference: 'high-performance',
      stencil: true,
      depth: true,
      logarithmicDepthBuffer: true, // Better depth precision
      preserveDrawingBuffer: true   // Needed for post-processing
    });

    // Increase pixel ratio for maximum quality
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 4.0); // Increased to 4.0
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(rect.width, rect.height);

    // Enhanced quality settings
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2;        // Increased exposure
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap; // Higher quality shadows
    this.renderer.shadowMap.autoUpdate = true;

    // Shadow map size increase
    if (this.keyLight) {
      this.keyLight.shadow.mapSize.width = 4096;    // Increased from 2048
      this.keyLight.shadow.mapSize.height = 4096;   // Increased from 2048
      this.keyLight.shadow.radius = 3;              // Softer shadows
      this.keyLight.shadow.bias = -0.00001;         // Reduced shadow acne
      this.keyLight.shadow.normalBias = 0.0001;     // Better contact shadows
    }

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer!.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = false;
    this.controls.enableDamping = false;

    this.setupThreePointLighting();

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  private setupThreePointLighting(): void {
    if (!this.scene) return;

    // 1. KEY LIGHT (Primary Light)
    // Positioned in front-right of subject, elevated at 45 degrees
    // This is the main light that defines the primary shadows and highlights
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.0);  // Much brighter!
    this.keyLight.position.set(300, 400, 500);  // Front-right, elevated, closer to camera
    this.keyLight.target.position.set(0, -200, -350);  // Target the model position

    // Enable shadows for key light
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 1500;
    this.keyLight.shadow.camera.left = -500;
    this.keyLight.shadow.camera.right = 500;
    this.keyLight.shadow.camera.top = 500;
    this.keyLight.shadow.camera.bottom = -500;
    this.keyLight.shadow.bias = -0.0001;

    this.scene.add(this.keyLight);
    this.scene.add(this.keyLight.target);

    // 2. FILL LIGHT (Secondary Light)
    // Positioned in front-left of subject, lower than key light
    // Softens harsh shadows created by key light
    this.fillLight = new THREE.DirectionalLight(0xe6f3ff, 3.5);  // Much brighter!
    this.fillLight.position.set(-250, 250, 400);  // Front-left, lower elevation
    this.fillLight.target.position.set(0, -200, -350);  // Target the model position

    // Fill light typically doesn't cast shadows to avoid double shadows
    this.fillLight.castShadow = false;

    this.scene.add(this.fillLight);
    this.scene.add(this.fillLight.target);

    // 3. BACK LIGHT / RIM LIGHT (Hair Light)
    // Positioned behind and above the subject to create edge lighting
    // Separates subject from background and adds depth
    this.backLight = new THREE.DirectionalLight(0xf0f8ff, 2.5);  // Brighter for rim effect
    this.backLight.position.set(0, 300, -600);  // Directly behind, elevated
    this.backLight.target.position.set(0, -200, -350);  // Target the model position

    // Back light can cast subtle shadows for rim effect
    this.backLight.castShadow = false; // Usually disabled to avoid conflicting shadows

    this.scene.add(this.backLight);
    this.scene.add(this.backLight.target);

    // AMBIENT LIGHT (Base Illumination)
    // Provides overall base lighting to prevent completely black shadows
    // Much brighter to ensure visibility
    this.ambientLight = new THREE.AmbientLight(0xf5f5f5, 2.0);  // Much brighter!
    this.scene.add(this.ambientLight);

    // HEMISPHERE LIGHT (Environmental Lighting)
    // Simulates natural sky/ground lighting for more realistic results
    this.hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 4.0);  // Much brighter!
    this.scene.add(this.hemiLight);

    // ADDITIONAL FRONT LIGHTS for better visibility
    // Add extra front-facing lights to ensure the model is well-lit
    // const frontLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    // frontLight1.position.set(0, 200, 800);  // Directly in front, elevated
    // frontLight1.target.position.set(0, -200, -350);
    // this.scene.add(frontLight1);
    // this.scene.add(frontLight1.target);

    const frontLight2 = new THREE.DirectionalLight(0xf8f8ff, 0.5);
    frontLight2.position.set(200, 100, 600);  // Front-right, lower
    frontLight2.target.position.set(0, -200, -350);
    this.scene.add(frontLight2);
    this.scene.add(frontLight2.target);

    const frontLight3 = new THREE.DirectionalLight(0xf8f8ff, 2.5);
    frontLight3.position.set(-200, 100, 600);  // Front-left, lower
    frontLight3.target.position.set(0, -200, -350);
    this.scene.add(frontLight3);
    this.scene.add(frontLight3.target);

    // Optional: Add light helpers for debugging (remove in production)
    // if (process.env.NODE_ENV === 'development') {
    //   const keyLightHelper = new THREE.DirectionalLightHelper(this.keyLight, 25);
    //   const fillLightHelper = new THREE.DirectionalLightHelper(this.fillLight, 25);
    //   const backLightHelper = new THREE.DirectionalLightHelper(this.backLight, 25);

    //   this.scene.add(keyLightHelper);
    //   this.scene.add(fillLightHelper);
    //   this.scene.add(backLightHelper);
    // }
  }

  // Method to adjust lighting dynamically
  public adjustLighting(options: {
    keyIntensity?: number;
    fillIntensity?: number;
    backIntensity?: number;
    ambientIntensity?: number;
    keyColor?: number;
    fillColor?: number;
    backColor?: number;
  }): void {
    if (options.keyIntensity !== undefined && this.keyLight) {
      this.keyLight.intensity = options.keyIntensity;
    }
    if (options.fillIntensity !== undefined && this.fillLight) {
      this.fillLight.intensity = options.fillIntensity;
    }
    if (options.backIntensity !== undefined && this.backLight) {
      this.backLight.intensity = options.backIntensity;
    }
    if (options.ambientIntensity !== undefined && this.ambientLight) {
      this.ambientLight.intensity = options.ambientIntensity;
    }
    if (options.keyColor !== undefined && this.keyLight) {
      this.keyLight.color.setHex(options.keyColor);
    }
    if (options.fillColor !== undefined && this.fillLight) {
      this.fillLight.color.setHex(options.fillColor);
    }
    if (options.backColor !== undefined && this.backLight) {
      this.backLight.color.setHex(options.backColor);
    }
  }

  // Method to reposition lights for different angles
  public repositionLights(targetPosition: THREE.Vector3 = new THREE.Vector3(0, -200, -350)): void {
    if (this.keyLight) {
      // Key light: Front-right, elevated, closer to camera
      const keyPos = new THREE.Vector3(300, 400, 500);
      keyPos.add(targetPosition.clone().sub(new THREE.Vector3(0, -200, -350)));
      this.keyLight.position.copy(keyPos);
      this.keyLight.target.position.copy(targetPosition);
    }

    if (this.fillLight) {
      // Fill light: Front-left, lower elevation
      const fillPos = new THREE.Vector3(-250, 250, 400);
      fillPos.add(targetPosition.clone().sub(new THREE.Vector3(0, -200, -350)));
      this.fillLight.position.copy(fillPos);
      this.fillLight.target.position.copy(targetPosition);
    }

    if (this.backLight) {
      // Back light: Directly behind and above subject
      const backPos = new THREE.Vector3(0, 300, -600);
      backPos.add(targetPosition.clone().sub(new THREE.Vector3(0, -200, -350)));
      this.backLight.position.copy(backPos);
      this.backLight.target.position.copy(targetPosition);
    }
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
      this.outlinePass = undefined;
    }
    if (this.renderPass) this.renderPass = undefined;
    if (this.composer) {
      this.composer = undefined;
    }

    // Clean up lighting references
    this.keyLight = undefined;
    this.fillLight = undefined;
    this.backLight = undefined;
    this.ambientLight = undefined;
    this.hemiLight = undefined;

    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.controls = undefined;
    this.clock = undefined;
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