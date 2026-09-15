import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// deliberately vanilla three.js (no @react-three/fiber) - keeps the bundle
// and the code small, self-contained, and easy to unmount cleanly. renders
// a rotating wireframe icosahedron core with a drifting particle field,
// tinted to match the neon-green grid theme.
export function Scene3D({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 400;
    const height = mount.clientHeight || 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.7, 1),
      new THREE.MeshBasicMaterial({ color: 0x39ff88, wireframe: true, transparent: true, opacity: 0.85 })
    );
    scene.add(core);

    const innerGlow = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.3, 0),
      new THREE.MeshBasicMaterial({ color: 0x39ff88, wireframe: true, transparent: true, opacity: 0.25 })
    );
    scene.add(innerGlow);

    // particle field
    const particleCount = 260;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0x39ff88, size: 0.03, transparent: true, opacity: 0.55 })
    );
    scene.add(particles);

    let frameId: number;
    let alive = true;
    function animate() {
      if (!alive) return;
      core.rotation.x += 0.0022;
      core.rotation.y += 0.0032;
      innerGlow.rotation.x -= 0.0016;
      innerGlow.rotation.y -= 0.0022;
      particles.rotation.y += 0.0006;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      if (!mount) return;
      const w = mount.clientWidth || 400;
      const h = mount.clientHeight || 340;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      alive = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      core.geometry.dispose(); innerGlow.geometry.dispose(); particleGeo.dispose();
      (core.material as THREE.Material).dispose();
      (innerGlow.material as THREE.Material).dispose();
      (particles.material as THREE.Material).dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}
