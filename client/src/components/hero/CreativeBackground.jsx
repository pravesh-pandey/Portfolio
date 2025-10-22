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
        metalness={0.4}
        roughness={0.18}
        color={0x7c4dff}
        emissive={new THREE.Color(0x161c3f)}
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
          color={0x36e0f8}
          size={0.08}
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
      <meshBasicMaterial color={0x3650ff} transparent opacity={0.45} />
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
  gradient.addColorStop(0, "#121931");
  gradient.addColorStop(0.55, "#060913");
  gradient.addColorStop(1, "#03050c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
};

const BackgroundScene = () => (
  <>
    <ambientLight intensity={0.8} color={0x6570cc} />
    <pointLight intensity={1.6} position={[5, 4, 4]} color={0x7c4dff} />
    <pointLight intensity={1.3} position={[-4, -3, 4]} color={0x36e0f8} />
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
