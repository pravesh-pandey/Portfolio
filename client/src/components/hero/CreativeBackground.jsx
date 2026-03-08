import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { Points, PointMaterial, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./creativeBackground.css";

const CoreMesh = () => {
  const mesh = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.sin(t / 2) / 8;
    mesh.current.rotation.y = Math.cos(t / 2) / 8;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.5, 2]} />
      <meshStandardMaterial
        metalness={0.3}
        roughness={0.22}
        color={0xf0d7c0}
        emissive={new THREE.Color(0x5c7f73)}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
};

const ParticleField = () => {
  const ref = useRef();
  const points = useMemo(() => {
    const particleCount = 1800;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = THREE.MathUtils.randFloat(3, 8);
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      positions.set([x, y, z], i * 3);
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 0.12;
    ref.current.rotation.x = t;
    ref.current.rotation.y = t / 2;
  });

  return (
    <group rotation={[0, Math.PI / 10, 0]} ref={ref}>
      <Points positions={points} stride={3}>
        <PointMaterial
          transparent
          color={0x2f6f62}
          size={0.07}
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
        />
      </Points>
    </group>
  );
};

const EnergyRing = () => {
  const ring = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ring.current.rotation.z = t / 4;
  });

  return (
    <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[3.5, 0.04, 22, 220]} />
      <meshBasicMaterial color={0xd27a45} transparent opacity={0.35} />
    </mesh>
  );
};

const GradientBackdrop = () => (
  <mesh>
    <sphereGeometry args={[22, 32, 32]} />
    <meshBasicMaterial side={THREE.BackSide}>
      <canvasTexture attach="map" image={generateGradientTexture()} />
    </meshBasicMaterial>
  </mesh>
);

const generateGradientTexture = () => {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, size / 4, size / 2, size / 2, size / 1.2);
  gradient.addColorStop(0, "#f6f1ea");
  gradient.addColorStop(0.55, "#efe4d5");
  gradient.addColorStop(1, "#e2d6c7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
};

const BackgroundScene = () => (
  <>
    <ambientLight intensity={0.7} color={0xf0dfcf} />
    <pointLight intensity={1.35} position={[5, 4, 4]} color={0x2f6f62} />
    <pointLight intensity={1.1} position={[-4, -3, 4]} color={0xd27a45} />
    <CoreMesh />
    <ParticleField />
    <EnergyRing />
    <GradientBackdrop />
  </>
);

export const CreativeBackground = () => (
  <div className="three-wrapper">
    <Canvas camera={{ position: [0, 0, 10], fov: 55 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <BackgroundScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Suspense>
    </Canvas>
  </div>
);
