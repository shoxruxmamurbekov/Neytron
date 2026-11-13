import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { DoubleSide, type Vector3 } from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { Monitor, Box, Eye, EyeOff } from 'lucide-react';
import type { Room } from '../types';
import { lightPosition, isLight, isWallMounted, routePoints, wallBoxes, wallMountBox, type Vec3 } from './geometry3d';
import { Card } from '../../../components/ui';

type ViewMode = 'perspective' | 'top';

const MAX_POINT_LIGHTS = 10;

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Kamerani tanlangan ko‘rinishga o‘rnatadi. */
function CameraRig({ mode, room }: { mode: ViewMode; room: Room }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as { target: Vector3; update: () => void } | null;

  useEffect(() => {
    const span = Math.max(room.length, room.width);
    const targetY = mode === 'top' ? 0 : room.height * 0.35;
    if (mode === 'top') {
      camera.position.set(0, span * 1.3 + 2, 0.0001);
    } else {
      const d = span * 1.15 + 2;
      camera.position.set(d * 0.75, room.height * 1.4 + d * 0.45, d * 0.85);
    }
    camera.lookAt(0, targetY, 0);
    if (controls) {
      controls.target.set(0, targetY, 0);
      controls.update();
    }
  }, [mode, room.length, room.width, room.height, camera, controls]);

  return null;
}

function LightFixture({ position, spot }: { position: Vec3; spot: boolean }) {
  return (
    <group position={position}>
      {spot ? (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
          <meshStandardMaterial color="#fff7d6" emissive="#ffe08a" emissiveIntensity={1.2} />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[0.1, 16, 12]} />
          <meshStandardMaterial color="#fff7d6" emissive="#ffe08a" emissiveIntensity={1.4} />
        </mesh>
      )}
    </group>
  );
}

function RoomScene({ room, mode, showWalls, showCeiling }: { room: Room; mode: ViewMode; showWalls: boolean; showCeiling: boolean }) {
  const boxes = useMemo(() => wallBoxes(room), [room]);
  const mounts = useMemo(() => room.objects.filter(isWallMounted).map((o) => ({ id: o.id, m: wallMountBox(o, room), kind: o.kind })), [room]);
  const lights = useMemo(() => room.objects.filter(isLight), [room]);
  const L = room.length;
  const W = room.width;

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 8, 5]} intensity={0.45} />
      {lights.slice(0, MAX_POINT_LIGHTS).map((o) => {
        const p = lightPosition(o, room);
        return <pointLight key={`pl-${o.id}`} position={p} intensity={0.25} distance={6} decay={2} color="#fff1c2" />;
      })}

      {/* Pol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[L, W]} />
        <meshStandardMaterial color="#d9c9a8" roughness={0.9} />
      </mesh>

      {/* Shift (ixtiyoriy) */}
      {showCeiling && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, room.height, 0]}>
          <planeGeometry args={[L, W]} />
          <meshStandardMaterial color="#ffffff" side={DoubleSide} transparent opacity={mode === 'top' ? 0.35 : 0.7} />
        </mesh>
      )}

      {/* Devorlar, eshik va derazalar (ixtiyoriy) */}
      {showWalls &&
        boxes.map((b, i) => {
          if (b.role === 'wall') {
            return (
              <mesh key={`w-${i}`} position={b.center}>
                <boxGeometry args={b.size} />
                <meshStandardMaterial color="#e6eaf0" />
              </mesh>
            );
          }
          if (b.role === 'glass') {
            return (
              <mesh key={`g-${i}`} position={b.center}>
                <boxGeometry args={b.size} />
                <meshStandardMaterial color="#9ed3f5" transparent opacity={0.35} />
              </mesh>
            );
          }
          return (
            <mesh key={`d-${i}`} position={b.center}>
              <boxGeometry args={b.size} />
              <meshStandardMaterial color="#8a6d3b" />
            </mesh>
          );
        })}

      {/* Yoritish */}
      {lights.map((o) => (
        <LightFixture key={o.id} position={lightPosition(o, room)} spot={o.kind === 'spotlight'} />
      ))}

      {/* Rozetka, kalit, shchit */}
      {mounts.map(({ id, m, kind }) => (
        <mesh key={`m-${id}`} position={m.center}>
          <boxGeometry args={m.size} />
          <meshStandardMaterial
            color={kind === 'switch' ? '#f5f5f5' : kind === 'distribution_board' ? '#9aa6b8' : kind === 'appliance_outlet' ? '#d93025' : '#1758b0'}
          />
        </mesh>
      ))}

      {/* Kabel yo‘llari (taxminiy joylashuv) */}
      {room.routes.map((r) =>
        r.points.length >= 2 ? (
          <Line key={`r-${r.id}`} points={routePoints(r.points, room)} color="#d97706" lineWidth={2} dashed dashSize={0.12} gapSize={0.07} />
        ) : null,
      )}
    </>
  );
}

function hasWebGL(): boolean {
  return typeof window !== 'undefined' && webglAvailable();
}

/** Xonaning 3D ko‘rinishi. 2D bilan bir xil room obyektidan o‘qiydi. */
export default function Scene3D({ room }: { room: Room }) {
  const [mode, setMode] = useState<ViewMode>('perspective');
  const [showWalls, setShowWalls] = useState(true);
  const [showCeiling, setShowCeiling] = useState(true);
  const [gl] = useState(hasWebGL);
  const span = Math.max(room.length, room.width);

  const chooseMode = (m: ViewMode) => {
    setMode(m);
    if (m === 'top') setShowCeiling(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div role="toolbar" aria-label="3D ko‘rinish boshqaruvi" className="flex flex-wrap items-center gap-2">
        <Seg
          active={mode === 'perspective'}
          onClick={() => chooseMode('perspective')}
          icon={<Box className="size-4" aria-hidden />}
          label="Perspektiv"
        />
        <Seg active={mode === 'top'} onClick={() => chooseMode('top')} icon={<Monitor className="size-4" aria-hidden />} label="Tepadan" />
        <span className="mx-1 hidden h-6 w-px bg-[var(--border)] sm:block" aria-hidden />
        <Seg
          active={showWalls}
          onClick={() => setShowWalls((v) => !v)}
          icon={showWalls ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
          label="Devorlar"
        />
        <Seg
          active={showCeiling}
          onClick={() => setShowCeiling((v) => !v)}
          icon={showCeiling ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
          label="Shift"
        />
      </div>

      {gl ? (
        <div className="relative h-[min(60vh,480px)] min-h-[300px] w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[#eef2f7]">
          <Canvas dpr={[1, 2]} camera={{ fov: 45, near: 0.1, far: 500, position: [span, room.height * 2, span] }}>
            <CameraRig mode={mode} room={room} />
            <RoomScene room={room} mode={mode} showWalls={showWalls} showCeiling={showCeiling} />
            <OrbitControls makeDefault enableDamping minDistance={1} maxDistance={span * 4 + 10} />
          </Canvas>
        </div>
      ) : (
        <Card className="text-sm text-[var(--text-muted)]">
          Bu brauzer 3D grafikani (WebGL) qo‘llamaydi. 2D chizma va materiallar ro‘yxati ishlashda davom etadi.
        </Card>
      )}

      <p className="text-xs text-[var(--text-muted)]">
        Sichqoncha: aylantirish · g‘ildirak: zoom · o‘ng tugma: siljitish. 2D chizmadagi o‘zgarishlar bu yerda avtomatik aks etadi.
      </p>
    </div>
  );
}

function Seg({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${
        active ? 'border-brand-500 bg-brand-500 text-white' : 'border-[var(--border)] hover:bg-[var(--surface-muted)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
