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

    // Enhanced settings for room ambient lighting
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2.6; // Increased for better skin tone visibility
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

    // Cool ambient room lighting - enhanced for natural skin tone visibility
    this.ambientLight = new THREE.AmbientLight(0xf0f8ff, 5.5); // Cool white ambient for natural skin tones
    this.scene.add(this.ambientLight);

    // Multiple distant point lights positioned around the entire room for even illumination
    const roomLight1 = new THREE.PointLight(0xf8faff, 3.2, 1000); // Cool white for natural skin tones
    roomLight1.position.set(0, 0, 0); // Center of room
    this.scene.add(roomLight1);

    const roomLight2 = new THREE.PointLight(0xf0f8ff, 2.8, 1000); // Cool white for natural skin tones
    roomLight2.position.set(200, 200, 200); // Top corner
    this.scene.add(roomLight2);

    const roomLight3 = new THREE.PointLight(0xf0f8ff, 2.8, 1000); // Cool white for natural skin tones
    roomLight3.position.set(-200, 200, -200); // Opposite top corner
    this.scene.add(roomLight3);

    // Cool hemisphere light for natural skin tone coverage
    this.hemiLight = new THREE.HemisphereLight(0xe6f3ff, 0xf5f5f5, 4.2); // Cool sky, neutral ground
    this.scene.add(this.hemiLight);

    const roomLight4 = new THREE.PointLight(0xf0f8ff, 2.4, 1000); // Cool white for natural skin tones
    roomLight4.position.set(200, 200, -200);
    this.scene.add(roomLight4);

    const roomLight5 = new THREE.PointLight(0xf0f8ff, 2.4, 1000); // Cool white for natural skin tones
    roomLight5.position.set(-200, 200, 200);
    this.scene.add(roomLight5);

    // Additional room lights for complete coverage
    const roomLight6 = new THREE.PointLight(0xf0f8ff, 2.2, 1000); // Cool white for natural skin tones
    roomLight6.position.set(0, 300, 0);
    this.scene.add(roomLight6);

    const roomLight7 = new THREE.PointLight(0xf0f8ff, 2.0, 1000); // Cool white for natural skin tones
    roomLight7.position.set(300, 0, 0);
    this.scene.add(roomLight7);

    const roomLight8 = new THREE.PointLight(0xf0f8ff, 2.0, 1000); // Cool white for natural skin tones
    roomLight8.position.set(-300, 0, 0);
    this.scene.add(roomLight8);

    const roomLight9 = new THREE.PointLight(0xf0f8ff, 1.8, 1000); // Cool white for natural skin tones
    roomLight9.position.set(0, 0, 300);
    this.scene.add(roomLight9);

    const roomLight10 = new THREE.PointLight(0xf0f8ff, 1.8, 1000); // Cool white for natural skin tones
    roomLight10.position.set(0, 0, -300);
    this.scene.add(roomLight10);

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
