"use client";

import React, { Suspense, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import {Loader} from "@react-three/drei";
// If your Avatar file exports `export function Avatar(...)` use: import { Avatar } from "@/components/Avatar";
// If it exports default: use: import Avatar from "@/components/Avatar";
import { Avatar } from "@/components/Avatar";
import { ChatProvider } from "@/hooks/useChat";
import { Leva } from "leva";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { handleSessionTransfer } from "@/utils/sessionTransfer";


function FloatingField() {
  const group = useRef(null);
  const geometries = [
    { geom: new THREE.TetrahedronGeometry(0.35), color: "#8b5cf6" },
    { geom: new THREE.BoxGeometry(0.5, 0.5, 0.5), color: "#06b6d4" },
    { geom: new THREE.OctahedronGeometry(0.36), color: "#f97316" },
    { geom: new THREE.IcosahedronGeometry(0.32), color: "#10b981" },
  ];

  const items = Array.from({ length: 20 }).map((_, i) => {
    const geo = geometries[i % geometries.length];
    return {
      key: i,
      geom: geo.geom,
      color: geo.color,
      position: [
        (Math.random() - 0.5) * 10,
        Math.random() * 3 - 0.5,
        (Math.random() - 0.5) * 6,
      ],
      rotationSpeed: Math.random() * 0.01 + 0.002,
      floatSpeed: Math.random() * 0.5 + 0.2,
      scale: 0.6 + Math.random() * 0.9,
    };
  });

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.children.forEach((c, idx) => {
      c.rotation.x = Math.sin(t * (0.2 + idx * 0.01)) * 0.2;
      c.rotation.y += 0.002 + (idx % 3) * 0.0005;
      c.position.y += Math.sin(t * (0.3 + idx * 0.02)) * 0.001;
    });
  });

  return (
    <group ref={group}>
      {items.map((it) => (
        <Float key={it.key} floatIntensity={0.9} speed={it.floatSpeed}>
          <mesh position={it.position} scale={it.scale}>
            <primitive object={it.geom} />
            <meshStandardMaterial
              color={it.color}
              roughness={0.4}
              metalness={0.15}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Particles() {
  const mesh = useRef(null);
  const count = 400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 8 - 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  useFrame((st) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = st.clock.elapsedTime * 0.02;
  });
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

export default function Home() {
  // Session-aware landing: read incoming params and allow continuing to class
  const search = useSearchParams();
  const router = useRouter();
  const { loading, user, error, refresh } = useSession();
  const courseId = useMemo(() => search?.get("courseId") || "", [search]);
  const returnUrl = useMemo(() => search?.get("return") || "/", [search]);

  const goToClass = () => {
    if (!courseId) return;
    router.push(`/class/${encodeURIComponent(courseId)}?return=${encodeURIComponent(returnUrl)}`);
  };

  // Handle session transfer and persist incoming courseId
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Handle session transfer from ProfAICoach
        const transferResult = await handleSessionTransfer();
        
        if (transferResult.success) {
          console.log('Session transfer completed:', transferResult);
          
          // Only refresh session if we have new transfer data or if session is not already loaded
          if (transferResult.method === 'stored-session' || transferResult.method === 'already-processed') {
            console.log('Using stored session data, no refresh needed');
            // Session data is already available, no need to refresh
          } else if (transferResult.userInfo) {
            console.log('Refreshing session with transferred user info:', transferResult.userInfo);
            setTimeout(() => {
              refresh();
            }, 100);
          } else {
            console.log('No user info in transfer result, refreshing anyway');
            setTimeout(() => {
              refresh();
            }, 100);
          }
        } else if (transferResult.error) {
          console.error('Session transfer failed:', transferResult.error);
          // Only show error if we don't have a stored session and there's a courseId
          const hasStoredSession = sessionStorage.getItem('transferredUserInfo');
          if (courseId && !hasStoredSession) {
            setTimeout(() => {
              alert(`Session transfer failed: ${transferResult.error}. You may need to authenticate again.`);
            }, 1000);
          } else if (hasStoredSession) {
            console.log('Session transfer failed but stored session available, continuing...');
            setTimeout(() => {
              refresh();
            }, 100);
          }
        }
        
        // Persist URLs for navigation
        if (courseId) sessionStorage.setItem("activeCourseId", String(courseId));
        if (returnUrl) sessionStorage.setItem("returnUrl", String(returnUrl));
      } catch (error) {
        console.error('Error initializing session:', error);
        if (courseId) {
          setTimeout(() => {
            alert('Failed to initialize session. Please try refreshing the page.');
          }, 1000);
        }
      }
    };
    
    initializeSession();
  }, [courseId, returnUrl, refresh]);

  return (
    <div className="relative min-h-screen w-full text-white">
      {/* Background Canvas */}
      <Loader/>

      <Canvas
        camera={{ position: [0, 2, 7], fov: 30 }}
        style={{ position: "fixed", inset: 0, zIndex: 0 }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.8} position={[5, 10, 4]} />
        <Suspense fallback={null}>
            <Particles/>
            {/* <FloatingField /> */}
          <Environment preset="sunset" background={false} />
          <group
            position={[-2.3, -3.8, 1.2]}
            scale={[3, 3, 3]}
            rotation={[0, 0.3, -0.1]}
            >
            <ChatProvider>
              <Leva hidden />
              <Avatar />
            </ChatProvider>
          </group>
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          autoRotate={false}
          enableDamping={false}
        />
      </Canvas>
          {/* </Loader> */}

      {/* Logo - top left */}
      <div className="fixed top-4 left-6 sm:top-6 sm:left-10 md:left-24 lg:left-[16vw] z-50">
        <img
          src="/prof-ai-logo_1755775207766.avif"   // 👈 replace with your logo path
          alt="Logo"
          className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto"
        />
      </div>


      {/* Main content on right side */}
      <div className="relative min-h-screen flex items-center justify-center md:justify-end">
        <div className="w-full max-w-full sm:max-w-md md:max-w-2xl p-4 sm:p-6 mr-0 md:mr-8 lg:mr-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          How would you like to learn today?
          </h1>
          <p className="text-white/80 text-sm sm:text-base mb-6">
          Choose your learning path & design your personalized teaching companion.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            <AnimatedTab
              title="Mentor"
              desc="Live guidance & Q&A"
              href="/mentor"
              colorFrom="from-indigo-500"
              colorTo="to-pink-500"
              live
            />
            <AnimatedTab
              title="Learn"
              desc="Guided lessons & paths"
              href="/learn"
              colorFrom="from-green-400"
              colorTo="to-cyan-500"
              live
              onClick={() => {
            try { sessionStorage.setItem("showLeva", "1"); } catch (e) {}
              }}
            />
            <AnimatedTab
              title="Practice"
              desc="Exam & interview practice"
              href="/exam"
              colorFrom="from-yellow-400"
              colorTo="to-orange-500"
              live={true}
            />
            {/* <AnimatedTab
              title="Practice"
              desc="Exam & interview practice"
              href="/practice"
              colorFrom="from-yellow-400"
              colorTo="to-orange-500"
              live={false}
            />
            <AnimatedTab
              title="Practice"
              desc="Exam & interview practice"
              href="/practice"
              colorFrom="from-yellow-400"
              colorTo="to-orange-500"
              live={false}
            /> */}
          </div>
        </div>
      </div>

      {/* Floating Live Now box */}
      <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-10 md:left-24 lg:left-[16vw] z-50 w-64 max-w-[80vw]">
        <div className="w-full bg-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="flex items-center gap-3">
            <LiveDot />
            <div>
              <div className="text-sm font-medium">Live Now</div>
              <div className="text-xs text-white/70">Mentor is available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Session panel (appears when courseId param exists) */}
      {courseId ? (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-10 md:right-24 lg:right-[16vw] z-50 w-[22rem] max-w-[90vw]">
          <div className="w-full bg-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm border border-white/30 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">Incoming Class</div>
                <div className="text-xs text-white/80 mt-1">Course ID: <span className="font-mono">{courseId}</span></div>
                <div className="text-xs mt-1">
                  {loading ? (
                    <span className="text-white/70">Checking session…</span>
                  ) : error ? (
                    <span className="text-red-300">{error}</span>
                  ) : (
                    <span className="text-green-300">Authenticated as {user?.username || user?.email || "User"}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={refresh}
                  className="text-xs px-3 py-1 rounded-md border border-white/30 bg-white/10 hover:bg-white/20 transition"
                >
                  Refresh
                </button>
                <button
                  onClick={goToClass}
                  disabled={!user || !!error}
                  className="text-xs px-3 py-1 rounded-md border border-white/30 bg-emerald-500/90 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-500 transition"
                >
                  Continue to Class
                </button>
                <a
                  href={returnUrl}
                  className="text-[11px] underline text-white/80 hover:text-white/100"
                >
                  Back
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}




function AnimatedTab({ title, desc, href, colorFrom, colorTo, live = false }) {
  const cardVariants = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -6 },
    tap: { scale: 0.98, y: 0 },
  };

  return (
    <Link href={href} className="group">
      <motion.div
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        variants={cardVariants}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`relative overflow-hidden rounded-xl shadow-2xl p-5 h-full bg-gradient-to-r ${colorFrom} ${colorTo} text-white flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{title}</h3>
            {live ? <LiveDot /> : <div className="text-xs uppercase font-medium opacity-80">Offline</div>}
          </div>
          <p className="mt-2 text-sm opacity-90">{desc}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide opacity-90">Open</div>
          <motion.div whileHover={{ x: 6 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="flex items-center gap-2">
            <svg className="w-5 h-5 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

function LiveDot() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <span className="absolute inline-flex w-6 h-6 rounded-full bg-green-400 opacity-30 animate-ping"></span>
      <span className="relative inline-flex w-3 h-3 rounded-full bg-green-400 shadow"></span>
    </div>
  );
}
