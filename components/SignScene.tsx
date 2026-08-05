"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sections, SectionId } from "@/lib/sections";

type SceneProps = {
  activeId: SectionId | null;
  focusId: SectionId | null;
  rotationTarget: React.MutableRefObject<number>;
  didDrag: React.MutableRefObject<boolean>;
  onActive: (id: SectionId | null) => void;
  onSelect: (id: SectionId) => void;
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
  { id: "about", y: 3.48, angle: 0, side: 0, arm: 0.5, width: 2.55, height: 2.46, shape: "triangle" },
  { id: "brand", y: 1.08, angle: -0.1, side: 1, arm: 0.46, width: 4.2, height: 1.84, shape: "wide" },
  { id: "packaging", y: -0.86, angle: 0.14, side: -1, arm: 0.46, width: 2.0, height: 2.52, shape: "vertical" },
  { id: "event", y: -2.3, angle: -0.16, side: 1, arm: 0.46, width: 2.65, height: 2.65, shape: "octagon" },
  { id: "other", y: -4.15, angle: 0.12, side: -1, arm: 0.46, width: 4.12, height: 1.54, shape: "wide" },
];

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
    () => new THREE.ExtrudeGeometry(shape, { depth: 0.13, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.035, bevelSegments: 3 }),
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
    const targetZ = baseZ + (focused ? 0.34 : active ? 0.16 : 0);
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
          position={[0, 0, -0.065]}
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
          <meshStandardMaterial color="#e7e7e4" roughness={0.33} metalness={0.08} />
        </mesh>
        <mesh position={[0, 0, 0.155]} raycast={() => null} renderOrder={2}>
          <planeGeometry args={[config.width, config.height]} />
          <meshBasicMaterial map={texture} transparent alphaTest={0.02} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function CameraRig({ activeId, focusId }: Pick<SceneProps, "activeId" | "focusId">) {
  useFrame(({ camera }, delta) => {
    const focusY = configs.find((item) => item.id === focusId)?.y ?? 0;
    const activeY = configs.find((item) => item.id === activeId)?.y ?? 0;
    const targetZ = focusId ? 9.4 : activeId ? 14.35 : 15.2;
    const targetY = focusId ? focusY + 0.68 : activeId ? 1.42 + activeY * 0.035 : 1.42;
    const damping = 1 - Math.exp(-delta * (focusId ? 3.2 : 5));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, damping);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, damping);
    camera.lookAt(0, focusId ? focusY : 0, 0);
  });
  return null;
}

function PoleScene(props: SceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const [settledFocus, setSettledFocus] = useState<SectionId | null>(null);

  useEffect(() => setSettledFocus(props.focusId), [props.focusId]);

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const focusConfig = configs.find((item) => item.id === settledFocus);
    const target = focusConfig ? -focusConfig.angle : props.rotationTarget.current;
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, target, focusConfig ? 4 : 7, delta);
  });

  return (
    <>
      <color attach="background" args={["#f7f7f4"]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 7, 6]} intensity={2.8} color="#ffffff" />
      <directionalLight position={[-5, 1, 3]} intensity={0.8} color="#e6eef4" />
      <group ref={rootRef}>
        <mesh>
          <cylinderGeometry args={[0.145, 0.175, 11.2, 24]} />
          <meshStandardMaterial color="#111111" roughness={0.42} metalness={0.58} />
        </mesh>
        {[-4.85, -3.45, -2.05, -0.65, 0.75, 2.15, 3.55, 4.95].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[0.155, 0.018, 8, 28]} />
            <meshStandardMaterial color="#727272" metalness={0.72} roughness={0.28} />
          </mesh>
        ))}
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
      </group>
      <ContactShadows position={[0, -5.58, 0]} opacity={0.22} scale={14} blur={2.8} far={7} />
      <Environment preset="studio" environmentIntensity={0.4} />
      <CameraRig activeId={props.activeId} focusId={props.focusId} />
    </>
  );
}

export function SignScene(props: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 1.42, 15.2], fov: 42, near: 0.1, far: 60 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <PoleScene {...props} />
    </Canvas>
  );
}
