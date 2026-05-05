import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

/** Spiral galaxy of particles — three arms, color-graded core → edge. */
function Galaxy({ count = 8000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const arms = 3;
    const radius = 6;
    const spin = 1.2;
    const randomness = 0.4;
    const randomnessPower = 3;

    const inside = new THREE.Color('#7c5cff');
    const outside = new THREE.Color('#22d3ee');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 1.5) * radius;
      const armAngle = ((i % arms) / arms) * Math.PI * 2;
      const spinAngle = r * spin;

      const rx =
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        r;
      const ry =
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        r *
        0.4;
      const rz =
        Math.pow(Math.random(), randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        randomness *
        r;

      positions[i3] = Math.cos(armAngle + spinAngle) * r + rx;
      positions[i3 + 1] = ry;
      positions[i3 + 2] = Math.sin(armAngle + spinAngle) * r + rz;

      const mixed = inside.clone().lerp(outside, r / radius);
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.04;
  });

  return (
    <points ref={ref} rotation={[Math.PI * 0.18, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        transparent
        opacity={0.95}
      />
    </points>
  );
}

/** Glowing dots flowing along a lemniscate (∞) — the infinity loop. */
function InfinityLoop({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const material = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const phases = useMemo(
    () => Float32Array.from({ length: count }, (_, i) => i / count),
    [count]
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const a = 2.6; // size of the lemniscate
    for (let i = 0; i < count; i++) {
      const phi = phases[i] * Math.PI * 2 + t * 0.35;
      const denom = 1 + Math.sin(phi) * Math.sin(phi);
      const x = (a * Math.cos(phi)) / denom;
      const z = (a * Math.sin(phi) * Math.cos(phi)) / denom;
      positions[i * 3] = x;
      positions[i * 3 + 1] = Math.sin(phi * 2 + t * 0.5) * 0.12;
      positions[i * 3 + 2] = z;
    }
    const attr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    attr.array = positions;
    attr.needsUpdate = true;
    if (material.current) {
      material.current.opacity = 0.75 + Math.sin(t * 1.5) * 0.15;
    }
    ref.current.rotation.y = t * 0.06;
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.15 + 0.2;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={material}
        size={0.085}
        color="#ffffff"
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent
      />
    </points>
  );
}

/** Slowly drifting nebula clouds — soft additive sprites for depth. */
function Nebula() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (a.current) {
      a.current.rotation.z = t * 0.02;
      a.current.position.x = Math.sin(t * 0.1) * 0.4 - 2;
    }
    if (b.current) {
      b.current.rotation.z = -t * 0.015;
      b.current.position.x = Math.cos(t * 0.08) * 0.4 + 2;
    }
  });
  return (
    <>
      <mesh ref={a} position={[-2, 0.5, -3]}>
        <planeGeometry args={[6, 6]} />
        <meshBasicMaterial
          color="#7c5cff"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={b} position={[2, -0.5, -4]}>
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function CameraDrift() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    state.camera.position.x = Math.sin(t * 0.08) * 0.35;
    state.camera.position.y = 0.6 + Math.cos(t * 0.06) * 0.15;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 7], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={['#04040a']} />
        <fog attach="fog" args={['#04040a', 8, 18]} />
        <Nebula />
        <Galaxy />
        <InfinityLoop />
        <Stars radius={80} depth={50} count={4000} factor={4} fade speed={0.6} />
        <CameraDrift />
      </Suspense>
    </Canvas>
  );
}
