"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sections, SectionId } from "@/lib/sections";

type SceneProps = {
  activeId: SectionId | null;
  focusId: SectionId | null;
  rotationTarget: React.MutableRefObject<number>;
  rotationCurrent: React.MutableRefObject<number>;
  didDrag: React.MutableRefObject<boolean>;
  onActive: (id: SectionId | null) => void;
  onSelect: (id: SectionId) => void;
  onExitFocus: () => void;
};

type SignConfig = {
  id: SectionId;
  y: number;
  angle: number;
  side: -1 | 0 | 1;
  arm: number;
  width: number;
  height: number;
  shape: "triangle" | "wide" | "vertical" | "octagon";
};

const configs: SignConfig[] = [
  { id: "about", y: 3.42, angle: 0, side: 1, arm: 0.46, width: 2.55, height: 2.46, shape: "triangle" },
  { id: "brand", y: 1.34, angle: THREE.MathUtils.degToRad(62), side: 1, arm: 0.46, width: 4.2, height: 1.84, shape: "wide" },
  { id: "packaging", y: -0.58, angle: THREE.MathUtils.degToRad(147), side: -1, arm: 0.46, width: 2.0, height: 2.52, shape: "vertical" },
  { id: "event", y: -2.18, angle: THREE.MathUtils.degToRad(238), side: 1, arm: 0.46, width: 2.65, height: 2.65, shape: "octagon" },
  // Keep the sign's radial position at the same 314° beat, but mount the
  // opposite end so the arrow tail—not its tip—meets the pole.
  { id: "other", y: -4.08, angle: THREE.MathUtils.degToRad(494), side: 1, arm: 0.46, width: 4.12, height: 1.54, shape: "wide" },
];

type PortfolioTextures = {
  face: THREE.CanvasTexture;
  backing: THREE.CanvasTexture;
  glow: THREE.CanvasTexture;
};

function makePortfolioTextures(image: HTMLImageElement): PortfolioTextures | null {
  if (typeof document === "undefined" || !image.naturalWidth || !image.naturalHeight) return null;

  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = width;
  faceCanvas.height = height;
  const faceContext = faceCanvas.getContext("2d", { willReadFrequently: true });
  if (!faceContext) return null;

  faceContext.drawImage(image, 0, 0, width, height);
  const imageData = faceContext.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const distanceFromWhite = Math.max(255 - red, 255 - green, 255 - blue);
    const alpha = THREE.MathUtils.clamp((distanceFromWhite - 3) / 18, 0, 1);

    if (alpha <= 0) {
      pixels[index + 3] = 0;
      continue;
    }

    if (alpha < 1) {
      pixels[index] = THREE.MathUtils.clamp((red - 255 * (1 - alpha)) / alpha, 0, 255);
      pixels[index + 1] = THREE.MathUtils.clamp((green - 255 * (1 - alpha)) / alpha, 0, 255);
      pixels[index + 2] = THREE.MathUtils.clamp((blue - 255 * (1 - alpha)) / alpha, 0, 255);
    }
    pixels[index + 3] = Math.round(alpha * 255);
  }
  faceContext.putImageData(imageData, 0, 0);

  const backingCanvas = document.createElement("canvas");
  backingCanvas.width = width;
  backingCanvas.height = height;
  const backingContext = backingCanvas.getContext("2d");
  if (!backingContext) return null;

  const outlineRadius = Math.max(8, Math.round(width * 0.009));
  for (let x = -outlineRadius; x <= outlineRadius; x += 3) {
    for (let y = -outlineRadius; y <= outlineRadius; y += 3) {
      if (x * x + y * y <= outlineRadius * outlineRadius) backingContext.drawImage(faceCanvas, x, y);
    }
  }
  backingContext.globalCompositeOperation = "source-in";
  const metal = backingContext.createLinearGradient(0, 0, width, height);
  metal.addColorStop(0, "#f0f1ef");
  metal.addColorStop(0.28, "#b8bcb9");
  metal.addColorStop(0.52, "#e3e5e2");
  metal.addColorStop(0.78, "#aeb2af");
  metal.addColorStop(1, "#d9dcda");
  backingContext.fillStyle = metal;
  backingContext.fillRect(0, 0, width, height);

  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = width;
  glowCanvas.height = height;
  const glowContext = glowCanvas.getContext("2d");
  if (!glowContext) return null;
  glowContext.filter = `blur(${Math.round(width * 0.018)}px)`;
  glowContext.globalAlpha = 0.92;
  glowContext.drawImage(faceCanvas, 0, 0);

  const makeTexture = (canvas: HTMLCanvasElement) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  };

  return {
    face: makeTexture(faceCanvas),
    backing: makeTexture(backingCanvas),
    glow: makeTexture(glowCanvas),
  };
}

function PortfolioTitleSign() {
  const sourceTexture = useTexture("/signs/portfolio-title-sketch.png");
  const textures = useMemo(
    () => makePortfolioTextures(sourceTexture.image as HTMLImageElement),
    [sourceTexture],
  );
  const glowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const signalLightRef = useRef<THREE.PointLight>(null);
  const leftEyeRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Group>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const nextBlink = useRef(3.4);
  const blinkStart = useRef(-1);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      textures?.face.dispose();
      textures?.backing.dispose();
      textures?.glow.dispose();
    };
  }, [textures]);

  useFrame(({ clock, pointer }, delta) => {
    const time = clock.elapsedTime;
    const introPulse = Math.exp(-Math.pow((time - 1.15) / 0.38, 2));
    const signalPulse = Math.pow(Math.max(0, Math.sin(time * 0.48 + 0.8)), 34);

    if (glowMaterialRef.current) {
      const targetOpacity = reduceMotion.current ? 0.12 : 0.13 + introPulse * 0.2 + signalPulse * 0.11;
      glowMaterialRef.current.opacity = THREE.MathUtils.damp(glowMaterialRef.current.opacity, targetOpacity, 5, delta);
    }
    if (signalLightRef.current) {
      const targetIntensity = reduceMotion.current ? 0.12 : 0.12 + introPulse * 0.9 + signalPulse * 0.62;
      signalLightRef.current.intensity = THREE.MathUtils.damp(signalLightRef.current.intensity, targetIntensity, 7, delta);
    }

    let blinkScale = 1;
    if (!reduceMotion.current) {
      if (blinkStart.current < 0 && time > nextBlink.current) blinkStart.current = time;
      if (blinkStart.current >= 0) {
        const phase = (time - blinkStart.current) / 0.24;
        if (phase >= 1) {
          blinkStart.current = -1;
          nextBlink.current = time + 3.8 + Math.random() * 3.6;
        } else {
          blinkScale = 0.12 + 0.88 * Math.abs(Math.cos(Math.PI * phase));
        }
      }
    }

    [leftEyeRef.current, rightEyeRef.current].forEach((eye, index) => {
      if (!eye) return;
      eye.scale.y = THREE.MathUtils.damp(eye.scale.y, blinkScale, 28, delta);
      const wobble = reduceMotion.current ? 0 : Math.sin(time * 1.7 + index * 0.8) * 0.045 + pointer.x * 0.035;
      eye.rotation.z = THREE.MathUtils.damp(eye.rotation.z, wobble, 6, delta);
    });

    [leftPupilRef.current, rightPupilRef.current].forEach((pupil) => {
      if (!pupil) return;
      const targetX = reduceMotion.current ? 0 : pointer.x * 0.018;
      const targetY = reduceMotion.current ? 0 : pointer.y * 0.014;
      pupil.position.x = THREE.MathUtils.damp(pupil.position.x, targetX, 11, delta);
      pupil.position.y = THREE.MathUtils.damp(pupil.position.y, targetY, 11, delta);
    });
  });

  if (!textures) return null;

  const width = 4.35;
  const height = width * (702 / 1238);

  const eye = (ref: React.RefObject<THREE.Group | null>, pupilRef: React.RefObject<THREE.Mesh | null>, x: number) => (
    <group ref={ref} position={[x, -0.045, 0.085]}>
      <mesh>
        <circleGeometry args={[0.067, 28]} />
        <meshStandardMaterial color="#fbfbf8" roughness={0.55} metalness={0.02} side={THREE.FrontSide} />
      </mesh>
      <mesh position={[0, 0, 0.006]}>
        <ringGeometry args={[0.059, 0.067, 28]} />
        <meshBasicMaterial color="#292929" side={THREE.FrontSide} />
      </mesh>
      <mesh ref={pupilRef} position={[0, 0, 0.012]}>
        <circleGeometry args={[0.029, 24]} />
        <meshBasicMaterial color="#101010" side={THREE.FrontSide} />
      </mesh>
    </group>
  );

  return (
    <group position={[0, 5.95, 0.2]}>
      <mesh position={[0, -0.05, -0.16]}>
        <boxGeometry args={[3.2, 0.07, 0.1]} />
        <meshStandardMaterial color="#4e5250" metalness={0.76} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0, -0.1]} renderOrder={0}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={glowMaterialRef}
          map={textures.glow}
          transparent
          opacity={0.13}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          side={THREE.FrontSide}
        />
      </mesh>
      <mesh position={[0, 0, -0.035]} renderOrder={1}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={textures.backing} transparent alphaTest={0.015} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.025]} renderOrder={2}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={textures.face} transparent alphaTest={0.015} toneMapped={false} side={THREE.FrontSide} />
      </mesh>
      {eye(leftEyeRef, leftPupilRef, 1.62)}
      {eye(rightEyeRef, rightPupilRef, 1.71)}
      <pointLight ref={signalLightRef} position={[1.25, -0.02, 0.42]} color="#ffd331" intensity={0.12} distance={2.1} decay={2} />
    </group>
  );
}

function makeShape(kind: SignConfig["shape"], width: number, height: number) {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;
  if (kind === "triangle") {
    shape.moveTo(0, h);
    shape.lineTo(w, -h);
    shape.lineTo(-w, -h);
    shape.closePath();
  } else if (kind === "octagon") {
    const c = Math.min(width, height) * 0.24;
    shape.moveTo(-w + c, h);
    shape.lineTo(w - c, h);
    shape.lineTo(w, h - c);
    shape.lineTo(w, -h + c);
    shape.lineTo(w - c, -h);
    shape.lineTo(-w + c, -h);
    shape.lineTo(-w, -h + c);
    shape.lineTo(-w, h - c);
    shape.closePath();
  } else {
    const radius = Math.min(width, height) * 0.1;
    shape.moveTo(-w + radius, -h);
    shape.lineTo(w - radius, -h);
    shape.quadraticCurveTo(w, -h, w, -h + radius);
    shape.lineTo(w, h - radius);
    shape.quadraticCurveTo(w, h, w - radius, h);
    shape.lineTo(-w + radius, h);
    shape.quadraticCurveTo(-w, h, -w, h - radius);
    shape.lineTo(-w, -h + radius);
    shape.quadraticCurveTo(-w, -h, -w + radius, -h);
  }
  return shape;
}

function Sign({ config, active, focused, onActive, onSelect, didDrag }: {
  config: SignConfig;
  active: boolean;
  focused: boolean;
  onActive: SceneProps["onActive"];
  onSelect: SceneProps["onSelect"];
  didDrag: SceneProps["didDrag"];
}) {
  const section = sections.find((item) => item.id === config.id)!;
  const texture = useTexture(section.image);
  const signRef = useRef<THREE.Group>(null);
  const shape = useMemo(() => makeShape(config.shape, config.width, config.height), [config]);
  const geometry = useMemo(
    () => new THREE.ExtrudeGeometry(shape, { depth: 0.075, bevelEnabled: true, bevelSize: 0.022, bevelThickness: 0.018, bevelSegments: 2 }),
    [shape],
  );

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  useFrame((_, delta) => {
    if (!signRef.current) return;
    const targetScale = focused ? 1.08 : active ? 1.045 : 1;
    const baseZ = config.side === 0 ? config.arm : 0;
    const targetZ = baseZ + (focused ? 0.22 : active ? 0.1 : 0);
    const damping = 1 - Math.exp(-delta * 8);
    signRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), damping);
    signRef.current.position.z = THREE.MathUtils.lerp(signRef.current.position.z, targetZ, damping);
  });

  const activate = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = "pointer";
    onActive(config.id);
  };

  return (
    <group rotation={[0, config.angle, 0]} position={[0, config.y, 0]}>
      {config.side === 0 ? (
        <mesh position={[0, 0, config.arm / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, config.arm, 12]} />
          <meshStandardMaterial color="#171717" roughness={0.58} metalness={0.35} />
        </mesh>
      ) : (
        <mesh position={[config.side * config.arm / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, config.arm, 12]} />
          <meshStandardMaterial color="#171717" roughness={0.58} metalness={0.35} />
        </mesh>
      )}
      <group
        ref={signRef}
        position={config.side === 0
          ? [0, 0, config.arm]
          : [config.side * (config.arm + config.width / 2), 0, 0]}
      >
        <mesh
          geometry={geometry}
          position={[0, 0, -0.0375]}
          onPointerEnter={activate}
          onPointerMove={activate}
          onPointerLeave={(event) => {
            event.stopPropagation();
            document.body.style.cursor = "default";
            onActive(null);
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (!didDrag.current) onSelect(config.id);
          }}
        >
          <meshStandardMaterial color="#cfd0cd" roughness={0.34} metalness={0.58} />
        </mesh>
        <mesh position={[0, 0, 0.09]} raycast={() => null} renderOrder={2}>
          <planeGeometry args={[config.width, config.height]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.02} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function CameraRig({
  activeId,
  focusId,
  rotationCurrent,
  rootOffsetX,
}: Pick<SceneProps, "activeId" | "focusId" | "rotationCurrent"> & {
  rootOffsetX: React.MutableRefObject<number>;
}) {
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera }, delta) => {
    const activeY = configs.find((item) => item.id === activeId)?.y ?? 0;
    const focusConfig = configs.find((item) => item.id === focusId);
    const targetPosition = new THREE.Vector3(0, activeId ? 2.45 + activeY * 0.035 : 2.45, activeId ? 15.4 : 18.6);
    const targetLook = new THREE.Vector3(0, 0, 0);

    if (focusConfig) {
      const totalAngle = rotationCurrent.current + focusConfig.angle;
      const sideDistance = focusConfig.side * (focusConfig.arm + focusConfig.width / 2);
      const center = focusConfig.side === 0
        ? new THREE.Vector3(
            rootOffsetX.current + Math.sin(totalAngle) * focusConfig.arm,
            focusConfig.y,
            Math.cos(totalAngle) * focusConfig.arm,
          )
        : new THREE.Vector3(
            rootOffsetX.current + Math.cos(totalAngle) * sideDistance,
            focusConfig.y,
            -Math.sin(totalAngle) * sideDistance,
          );
      const normal = new THREE.Vector3(Math.sin(totalAngle), 0, Math.cos(totalAngle));
      const distance = Math.max(focusConfig.width, focusConfig.height) * 1.15 + 4.8;
      targetPosition.copy(center).addScaledVector(normal, distance);
      targetLook.copy(center);
    }

    const damping = 1 - Math.exp(-delta * (focusConfig ? 3.7 : 4.8));
    camera.position.lerp(targetPosition, damping);
    lookTarget.current.lerp(targetLook, damping);
    camera.lookAt(lookTarget.current);
  });
  return null;
}

function PoleScene(props: SceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const rootOffsetX = useRef(0);

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, props.rotationTarget.current, props.focusId ? 7 : 5.4, delta);
    rootRef.current.position.x = THREE.MathUtils.damp(rootRef.current.position.x, props.focusId ? -1.05 : 0, 4.2, delta);
    props.rotationCurrent.current = rootRef.current.rotation.y;
    rootOffsetX.current = rootRef.current.position.x;
  });

  return (
    <>
      <color attach="background" args={["#f7f7f4"]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 7, 6]} intensity={2.8} color="#ffffff" />
      <directionalLight position={[-5, 1, 3]} intensity={0.8} color="#e6eef4" />
      <group ref={rootRef}>
        <mesh position={[0, 0.275, 0]}>
          <cylinderGeometry args={[0.145, 0.175, 13.35, 24]} />
          <meshStandardMaterial color="#111111" roughness={0.42} metalness={0.58} />
        </mesh>
        {[...configs.map((config) => config.y), 5.05, 6.78, -5.35, -6.18].map((y) => (
          <group key={y} position={[0, y, 0]}>
            <mesh>
              <cylinderGeometry args={[0.205, 0.205, 0.12, 24]} />
              <meshStandardMaterial color="#858987" metalness={0.82} roughness={0.22} />
            </mesh>
            {[-0.06, 0.06].map((edge) => (
              <mesh key={edge} position={[0, edge, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.198, 0.012, 8, 30]} />
                <meshStandardMaterial color="#b7bab7" metalness={0.9} roughness={0.16} />
              </mesh>
            ))}
          </group>
        ))}
        <group position={[0, -5.35, 0]}>
          <mesh position={[0.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.56, 12]} />
            <meshStandardMaterial color="#171717" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh position={[0.58, 0, 0]}>
            <sphereGeometry args={[0.075, 14, 10]} />
            <meshStandardMaterial color="#858987" metalness={0.82} roughness={0.22} />
          </mesh>
        </group>
        {configs.map((config) => (
          <Sign
            key={config.id}
            config={config}
            active={props.activeId === config.id}
            focused={props.focusId === config.id}
            onActive={props.onActive}
            onSelect={props.onSelect}
            didDrag={props.didDrag}
          />
        ))}
        <PortfolioTitleSign />
      </group>
      <ContactShadows position={[0, -6.38, 0]} opacity={0.22} scale={15} blur={2.8} far={7} />
      <Environment preset="studio" environmentIntensity={0.4} />
      <CameraRig
        activeId={props.activeId}
        focusId={props.focusId}
        rotationCurrent={props.rotationCurrent}
        rootOffsetX={rootOffsetX}
      />
    </>
  );
}

export function SignScene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 2.45, 18.6], fov: 42, near: 0.1, far: 60 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => props.onExitFocus()}
    >
      <PoleScene {...props} />
    </Canvas>
  );
}
