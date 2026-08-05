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
  { id: "about", y: 3.62, angle: -0.04, side: 0, arm: 0.5, width: 2.55, height: 2.46, shape: "triangle" },
  { id: "brand", y: 1.34, angle: -0.22, side: 1, arm: 0.46, width: 4.2, height: 1.84, shape: "wide" },
  { id: "packaging", y: -0.58, angle: 0.34, side: -1, arm: 0.46, width: 2.0, height: 2.52, shape: "vertical" },
  { id: "event", y: -2.18, angle: -0.42, side: 1, arm: 0.46, width: 2.65, height: 2.65, shape: "octagon" },
  { id: "other", y: -4.08, angle: 0.25, side: -1, arm: 0.46, width: 4.12, height: 1.54, shape: "wide" },
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
    const targetPosition = new THREE.Vector3(0, activeId ? 1.42 + activeY * 0.035 : 1.42, activeId ? 14.35 : 15.2);
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
        <mesh>
          <cylinderGeometry args={[0.145, 0.175, 11.2, 24]} />
          <meshStandardMaterial color="#111111" roughness={0.42} metalness={0.58} />
        </mesh>
        {[...configs.map((config) => config.y), 5.05, -5.05].map((y) => (
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
      camera={{ position: [0, 1.42, 15.2], fov: 42, near: 0.1, far: 60 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => props.onExitFocus()}
    >
      <PoleScene {...props} />
    </Canvas>
  );
}
