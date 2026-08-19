"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { ContactShadows, Html, RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { HomeTargetId, sections, SectionId } from "@/lib/sections";

export const HOME_INITIAL_ROTATION = -Math.PI / 2;

type SceneProps = {
  activeId: HomeTargetId | null;
  focusId: HomeTargetId | null;
  rotationTarget: React.MutableRefObject<number>;
  rotationCurrent: React.MutableRefObject<number>;
  didDrag: React.MutableRefObject<boolean>;
  onActive: (id: HomeTargetId | null) => void;
  onSelect: (id: HomeTargetId) => void;
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
  { id: "about", y: 1.9, angle: THREE.MathUtils.degToRad(-30), side: 1, arm: 0.42, width: 2.22, height: 2.12, shape: "triangle" },
  { id: "brand", y: 0, angle: THREE.MathUtils.degToRad(62), side: 1, arm: 0.42, width: 3.65, height: 1.58, shape: "wide" },
  { id: "packaging", y: -1.65, angle: THREE.MathUtils.degToRad(147), side: -1, arm: 0.42, width: 1.72, height: 2.17, shape: "vertical" },
  { id: "event", y: -3.25, angle: THREE.MathUtils.degToRad(238), side: 1, arm: 0.42, width: 2.28, height: 2.28, shape: "octagon" },
  // Keep the sign's radial position at the same 314° beat, but mount the
  // opposite end so the arrow tail—not its tip—meets the pole.
  { id: "other", y: -4.77, angle: THREE.MathUtils.degToRad(494), side: 1, arm: 0.42, width: 3.55, height: 1.32, shape: "wide" },
];

const SIGN_SCALE = 0.9;
const TITLE_Y_OFFSET = 0.28;
const SIGN_LIFT: Record<SectionId, number> = {
  about: 0.42,
  brand: 0.58,
  packaging: 0.75,
  event: 0.93,
  other: 1.12,
};
const TRAFFIC_LIGHT_SCALE = 0.88;

const trafficLightConfig = {
  id: "contact" as const,
  y: -4.75,
  angle: THREE.MathUtils.degToRad(105),
  side: -1 as const,
  arm: 0.54,
  width: 0.98,
  height: 2.18,
};

type ContactSignal = {
  id: "phone" | "linkedin" | "email";
  color: string;
  y: number;
  textColor: string;
  lines: Array<{ label: string; copyValue: string }>;
};

const contactSignals: ContactSignal[] = [
  {
    id: "phone",
    color: "#ef2f26",
    y: 0.65,
    textColor: "#ef2f26",
    lines: [
      { label: "+44 0 7486 352980", copyValue: "+44 0 7486 352980" },
      { label: "+86 188 1112 5305", copyValue: "+86 188 1112 5305" },
    ],
  },
  {
    id: "linkedin",
    color: "#f3bd21",
    y: 0,
    textColor: "#b18400",
    lines: [
      { label: "linkedin.com/in/lingjie-kong", copyValue: "https://www.linkedin.com/in/lingjie-kong/" },
    ],
  },
  {
    id: "email",
    color: "#35b95a",
    y: -0.65,
    textColor: "#24964a",
    lines: [
      { label: "hello@lingjiekong.design", copyValue: "hello@lingjiekong.design" },
    ],
  },
];

function getSignY(config: SignConfig) {
  return config.y + SIGN_LIFT[config.id];
}

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
      const targetX = reduceMotion.current ? 0 : pointer.x * 0.03;
      const targetY = reduceMotion.current ? 0 : pointer.y * 0.024;
      pupil.position.x = THREE.MathUtils.damp(pupil.position.x, targetX, 11, delta);
      pupil.position.y = THREE.MathUtils.damp(pupil.position.y, targetY, 11, delta);
    });
  });

  if (!textures) return null;

  const width = 7.3;
  const height = width * (702 / 1238);

  const eye = (ref: React.RefObject<THREE.Group | null>, pupilRef: React.RefObject<THREE.Mesh | null>, x: number) => (
    <group ref={ref} position={[x, -0.075, 0.085]}>
      <mesh>
        <circleGeometry args={[0.112, 28]} />
        <meshStandardMaterial color="#fbfbf8" roughness={0.55} metalness={0.02} side={THREE.FrontSide} />
      </mesh>
      <mesh position={[0, 0, 0.006]}>
        <ringGeometry args={[0.099, 0.112, 28]} />
        <meshBasicMaterial color="#292929" side={THREE.FrontSide} />
      </mesh>
      <mesh ref={pupilRef} position={[0, 0, 0.012]}>
        <circleGeometry args={[0.049, 24]} />
        <meshBasicMaterial color="#101010" side={THREE.FrontSide} />
      </mesh>
    </group>
  );

  return (
    <group
      position={[0.32, 4.85 + TITLE_Y_OFFSET, 0]}
      rotation={[0, -HOME_INITIAL_ROTATION, 0]}
      scale={SIGN_SCALE}
    >
      <mesh position={[0, -0.05, -0.16]}>
        <boxGeometry args={[5.4, 0.07, 0.1]} />
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
      {eye(leftEyeRef, leftPupilRef, 2.72)}
      {eye(rightEyeRef, rightPupilRef, 2.87)}
      <pointLight ref={signalLightRef} position={[2.1, -0.03, 0.52]} color="#ffd331" intensity={0.12} distance={3.2} decay={2} />
    </group>
  );
}

function makeShape(kind: SignConfig["shape"], width: number, height: number) {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;

  const roundedPolygon = (points: Array<{ x: number; y: number }>, radius: number) => {
    const insetPoints = points.map((point, index) => {
      const previous = points[(index + points.length - 1) % points.length];
      const next = points[(index + 1) % points.length];
      const previousLength = Math.hypot(previous.x - point.x, previous.y - point.y);
      const nextLength = Math.hypot(next.x - point.x, next.y - point.y);
      const inset = Math.min(radius, previousLength * 0.32, nextLength * 0.32);
      return {
        before: {
          x: point.x + ((previous.x - point.x) / previousLength) * inset,
          y: point.y + ((previous.y - point.y) / previousLength) * inset,
        },
        after: {
          x: point.x + ((next.x - point.x) / nextLength) * inset,
          y: point.y + ((next.y - point.y) / nextLength) * inset,
        },
        point,
      };
    });

    shape.moveTo(insetPoints[0].before.x, insetPoints[0].before.y);
    insetPoints.forEach((item, index) => {
      shape.quadraticCurveTo(item.point.x, item.point.y, item.after.x, item.after.y);
      const next = insetPoints[(index + 1) % insetPoints.length];
      shape.lineTo(next.before.x, next.before.y);
    });
    shape.closePath();
  };

  if (kind === "triangle") {
    roundedPolygon([
      { x: 0, y: h },
      { x: w, y: -h },
      { x: -w, y: -h },
    ], Math.min(width, height) * 0.055);
  } else if (kind === "octagon") {
    // For a square bounding box, this cut length makes the four horizontal /
    // vertical edges and four diagonal edges the same length: a true regular
    // octagon rather than a shallow chamfered rectangle.
    const c = Math.min(width, height) / (2 + Math.SQRT2);
    roundedPolygon([
      { x: -w + c, y: h },
      { x: w - c, y: h },
      { x: w, y: h - c },
      { x: w, y: -h + c },
      { x: w - c, y: -h },
      { x: -w + c, y: -h },
      { x: -w, y: -h + c },
      { x: -w, y: h - c },
    // Use one shared radius at every vertex so the outer corners echo the
    // artwork's softened octagon without becoming overly round.
    ], Math.min(width, height) * 0.045);
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
  // Keep every plate on the same bounding-box rhythm. The triangular plate's
  // sloped edge sits farther from the pole at mid-height, so only its arm needs
  // to extend; moving the plate itself would make it intersect the pole.
  const connectorLength = config.shape === "triangle" ? config.arm + config.width / 4 : config.arm;
  // The PNGs include a small transparent margin around their visible plate.
  // Build the metal from the visible silhouette (rather than the full canvas)
  // and add only a narrow, even offset around it.
  const isOffsetFrame = config.id === "about" || config.id === "event";
  const frameGap = isOffsetFrame ? 0.045 : 0;
  const frameContentScale = isOffsetFrame ? 0.935 : 1;
  const shape = useMemo(
    () => makeShape(
      config.shape,
      config.width * frameContentScale + frameGap * 2,
      config.height * frameContentScale + frameGap * 2,
    ),
    [config, frameContentScale, frameGap],
  );
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
    <group rotation={[0, config.angle, 0]} position={[0, getSignY(config), 0]} scale={SIGN_SCALE}>
      {config.side === 0 ? (
        <mesh position={[0, 0, config.arm / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, config.arm, 12]} />
          <meshStandardMaterial color="#171717" roughness={0.58} metalness={0.35} />
        </mesh>
      ) : (
        <mesh position={[config.side * connectorLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, connectorLength, 12]} />
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

function ContactTrafficLight({ focused, onSelect, didDrag }: {
  focused: boolean;
  onSelect: SceneProps["onSelect"];
  didDrag: SceneProps["didDrag"];
}) {
  const housingRef = useRef<THREE.Group>(null);
  const [hoveredSignal, setHoveredSignal] = useState<number | null>(null);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const signalHoverExitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signalTextures = useTexture([
    "/traffic-light/red-idle.png",
    "/traffic-light/red-active.png",
    "/traffic-light/yellow-idle.png",
    "/traffic-light/yellow-active.png",
    "/traffic-light/green-idle.png",
    "/traffic-light/green-active.png",
  ]);
  const sideDistance = trafficLightConfig.side * (trafficLightConfig.arm + trafficLightConfig.width / 2);

  useEffect(() => {
    signalTextures.forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.needsUpdate = true;
    });
  }, [signalTextures]);

  useEffect(() => () => {
    if (signalHoverExitTimer.current) clearTimeout(signalHoverExitTimer.current);
    if (copiedResetTimer.current) clearTimeout(copiedResetTimer.current);
  }, []);

  const keepSignalVisible = (signalIndex: number) => {
    if (signalHoverExitTimer.current) clearTimeout(signalHoverExitTimer.current);
    setHoveredSignal(signalIndex);
  };

  const hideSignalSoon = (signalIndex: number) => {
    if (signalHoverExitTimer.current) clearTimeout(signalHoverExitTimer.current);
    signalHoverExitTimer.current = setTimeout(() => {
      setHoveredSignal((current) => current === signalIndex ? null : current);
      setCopiedContact(null);
    }, 180);
  };

  const copyContact = async (copyValue: string) => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopiedContact(copyValue);
      if (copiedResetTimer.current) clearTimeout(copiedResetTimer.current);
      copiedResetTimer.current = setTimeout(() => setCopiedContact(null), 1400);
    } catch {
      setCopiedContact(null);
    }
  };

  useFrame((_, delta) => {
    if (!housingRef.current) return;
    const targetScale = focused ? 1.06 : 1;
    const targetZ = focused ? 0.18 : 0;
    const damping = 1 - Math.exp(-delta * 8);
    housingRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), damping);
    housingRef.current.position.z = THREE.MathUtils.lerp(housingRef.current.position.z, targetZ, damping);
  });

  const selectContact = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!didDrag.current) onSelect("contact");
  };

  return (
    <group
      rotation={[0, trafficLightConfig.angle, 0]}
      position={[0, trafficLightConfig.y, 0]}
      scale={TRAFFIC_LIGHT_SCALE}
    >
      <mesh
        position={[trafficLightConfig.side * trafficLightConfig.arm / 2, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.052, 0.052, trafficLightConfig.arm, 16]} />
        <meshStandardMaterial color="#1a1b1a" roughness={0.45} metalness={0.62} />
      </mesh>
      <mesh position={[trafficLightConfig.side * trafficLightConfig.arm, 0, 0]}>
        <sphereGeometry args={[0.085, 18, 12]} />
        <meshStandardMaterial color="#aeb2af" roughness={0.2} metalness={0.88} />
      </mesh>

      <group
        ref={housingRef}
        position={[sideDistance, 0, 0]}
        onPointerEnter={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "default";
        }}
        onClick={selectContact}
      >
        <RoundedBox args={[1.08, 2.3, 0.56]} radius={0.1} smoothness={4} position={[0, 0, -0.05]}>
          <meshStandardMaterial color="#c8cbc8" roughness={0.26} metalness={0.76} />
        </RoundedBox>
        <RoundedBox args={[0.96, 2.18, 0.52]} radius={0.075} smoothness={4} position={[0, 0, 0.03]}>
          <meshStandardMaterial color="#202220" roughness={0.37} metalness={0.68} />
        </RoundedBox>

        <RoundedBox args={[0.13, 0.72, 0.36]} radius={0.035} smoothness={3} position={[0.52, 0, -0.08]}>
          <meshStandardMaterial color="#9da19e" roughness={0.25} metalness={0.84} />
        </RoundedBox>

        {contactSignals.map((signal, signalIndex) => {
          const revealContact = focused && hoveredSignal === signalIndex;
          const idleTexture = signalTextures[signalIndex * 2];
          const activeTexture = signalTextures[signalIndex * 2 + 1];

          return (
            <group key={signal.y} position={[0, signal.y, 0]}>
              <RoundedBox args={[0.86, 0.66, 0.12]} radius={0.07} smoothness={4} position={[0, 0, 0.29]}>
                <meshStandardMaterial color="#292b29" roughness={0.4} metalness={0.62} />
              </RoundedBox>

              {[
                [-0.34, 0.25],
                [0.34, 0.25],
                [-0.34, -0.25],
                [0.34, -0.25],
              ].map(([x, y]) => (
                <mesh key={`${signal.y}-${x}-${y}`} position={[x, y, 0.37]}>
                  <sphereGeometry args={[0.025, 12, 8]} />
                  <meshStandardMaterial color="#9fa39f" roughness={0.24} metalness={0.88} />
                </mesh>
              ))}

              <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.34, 0.37, 0.18, 32]} />
                <meshStandardMaterial color="#111311" roughness={0.42} metalness={0.68} />
              </mesh>
              <mesh
                position={[0, 0, 0.43]}
                onPointerEnter={() => {
                  if (focused) keepSignalVisible(signalIndex);
                }}
                onPointerMove={() => {
                  if (focused) keepSignalVisible(signalIndex);
                }}
                onPointerLeave={() => {
                  hideSignalSoon(signalIndex);
                }}
              >
                <circleGeometry args={[0.275, 40]} />
                <meshBasicMaterial
                  map={revealContact ? activeTexture : idleTexture}
                  transparent
                  alphaTest={0.015}
                  toneMapped={false}
                />
              </mesh>

              {revealContact && (
                <Html position={[-0.31, 0, 0.49]} zIndexRange={[30, 0]} style={{ pointerEvents: "auto" }}>
                  <div
                    className={`traffic-contact-anchor is-${signal.id}`}
                    style={{ "--traffic-contact-color": signal.textColor } as React.CSSProperties}
                    onMouseEnter={() => keepSignalVisible(signalIndex)}
                    onMouseLeave={() => hideSignalSoon(signalIndex)}
                  >
                    <div className="traffic-contact-list">
                      {signal.lines.map((line) => (
                        <button
                          key={line.copyValue}
                          type="button"
                          className="traffic-contact-line"
                          onClick={() => copyContact(line.copyValue)}
                          aria-label={`Copy ${signal.id} ${line.label}`}
                        >
                          <span>{line.label}</span>
                          <span
                            className={`traffic-contact-status${copiedContact === line.copyValue ? " is-visible" : ""}`}
                            aria-hidden="true"
                          >
                            Copied
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </Html>
              )}

              <mesh position={[0, 0.045, 0.465]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry
                  args={[0.33, 0.295, 0.32, 40, 1, true, Math.PI * 0.42, Math.PI * 1.16]}
                />
                <meshStandardMaterial color="#171917" roughness={0.39} metalness={0.66} side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

function getSceneConfig(id: HomeTargetId | null) {
  if (!id) return undefined;
  if (id === "contact") return trafficLightConfig;
  return configs.find((item) => item.id === id);
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
    const activeConfig = getSceneConfig(activeId);
    const activeY = activeConfig
      ? activeId === "contact"
        ? activeConfig.y
        : getSignY(activeConfig as SignConfig)
      : 0;
    const focusConfig = getSceneConfig(focusId);
    const targetPosition = new THREE.Vector3(0, activeId ? 2.45 + activeY * 0.035 : 2.45, activeId ? 15.4 : 18.6);
    const targetLook = new THREE.Vector3(0, 0, 0);

    if (focusConfig) {
      const focusScale = focusId === "contact" ? TRAFFIC_LIGHT_SCALE : SIGN_SCALE;
      const focusY = focusId === "contact"
        ? focusConfig.y
        : getSignY(focusConfig as SignConfig);
      const totalAngle = rotationCurrent.current + focusConfig.angle;
      const sideDistance = focusConfig.side * (focusConfig.arm + focusConfig.width / 2) * focusScale;
      const center = focusConfig.side === 0
        ? new THREE.Vector3(
            rootOffsetX.current + Math.sin(totalAngle) * focusConfig.arm * focusScale,
            focusY,
            Math.cos(totalAngle) * focusConfig.arm * focusScale,
          )
        : new THREE.Vector3(
            rootOffsetX.current + Math.cos(totalAngle) * sideDistance,
            focusY,
            -Math.sin(totalAngle) * sideDistance,
          );
      const normal = new THREE.Vector3(Math.sin(totalAngle), 0, Math.cos(totalAngle));
      const distance = Math.max(focusConfig.width, focusConfig.height) * focusScale * 1.15 + 4.8;
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
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 7, 6]} intensity={2.8} color="#ffffff" />
      <directionalLight position={[-5, 1, 3]} intensity={0.8} color="#e6eef4" />
      <group ref={rootRef} rotation={[0, props.rotationTarget.current, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.145, 0.175, 21.5, 24]} />
          <meshStandardMaterial color="#111111" roughness={0.42} metalness={0.58} />
        </mesh>
        {[
          ...configs.map(getSignY),
          5.05 + TITLE_Y_OFFSET,
          6.78,
          trafficLightConfig.y,
        ].map((y) => (
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
        <ContactTrafficLight
          focused={props.focusId === "contact"}
          onSelect={props.onSelect}
          didDrag={props.didDrag}
        />
        <PortfolioTitleSign />
      </group>
      <ContactShadows position={[0, -10.2, 0]} opacity={0.22} scale={15} blur={2.8} far={7} resolution={256} />
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
      dpr={[1, 1.4]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => props.onExitFocus()}
    >
      <PoleScene {...props} />
    </Canvas>
  );
}
