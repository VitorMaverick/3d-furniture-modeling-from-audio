"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid, PerspectiveCamera } from "@react-three/drei";
import { Chair } from "./chair";
import { Table } from "./table";
import { RoundTable } from "./round-table";
import { BancoMehinaku } from "./banco-mehinaku";
import { BancoMehinakuPerfurado } from "./banco-mehinaku-perfurado";
import { BancoWauja } from "./banco-wauja";
import { SegmentedChair, SegmentedTable, SegmentedRoundTable, SegmentedBancoMehinaku, SegmentedBancoMehinakuPerfurado, SegmentedBancoWauja } from "./segmented-furniture";
import { RecordingController } from "./recording-controller";
import { ImageCaptureBridge } from "./image-capture-bridge";
import { Suspense } from "react";
import { useFurniture } from "@/lib/furniture-context";

function SceneContent() {
  const { params, sceneRef } = useFurniture();

  return (
    <>
      <color attach="background" args={["#1a1a2e"]} />
      <fog attach="fog" args={["#1a1a2e", 8, 25]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        color="#ffffff" 
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#4ecdc4" />
      <pointLight position={[5, 3, 5]} intensity={0.4} color="#ff6b6b" />
      <spotLight 
        position={[0, 12, 0]} 
        intensity={0.8} 
        angle={0.5} 
        penumbra={1} 
        color="#ffffff" 
        castShadow
      />
      
      {/* Furniture — render original (non-segmented) models when textureMode is 'solid'.
          For other texture modes render the segmented/creative components. */}
      <group ref={sceneRef}>
        {params.textureMode === "solid" ? (
          <>
            {params.activeTab === "table" && <SegmentedTable position={[0, 0, 0]} />}
            {params.activeTab === "chair" && <SegmentedChair position={[0, 0, 0]} />}
            {params.activeTab === "roundTable" && <RoundTable position={[0, 0, 0]} />}
            {/* For benches we keep the segmented base but render it in a 'solid' state so
                the same perforated plates and screw columns are used as the base. */}
            {params.activeTab === "bancoMehinaku" && <SegmentedBancoMehinaku position={[0, 0, 0]} />}
            {params.activeTab === "bancoMehinakuPerfurado" && <SegmentedBancoMehinakuPerfurado position={[0, 0, 0]} />}
            {params.activeTab === "bancoWauja" && <BancoWauja position={[0, 0, 0]} />}
          </>
        ) : (
          <>
            {params.activeTab === "table" && <SegmentedTable position={[0, 0, 0]} />}
            {params.activeTab === "chair" && <SegmentedChair position={[0, 0, 0]} />}
            {params.activeTab === "roundTable" && <SegmentedRoundTable position={[0, 0, 0]} />}
            {params.activeTab === "bancoMehinaku" && <SegmentedBancoMehinaku position={[0, 0, 0]} />}
            {params.activeTab === "bancoMehinakuPerfurado" && <SegmentedBancoMehinakuPerfurado position={[0, 0, 0]} />}
            {params.activeTab === "bancoWauja" && <SegmentedBancoWauja position={[0, 0, 0]} />}
          </>
        )}
      </group>
      
      {/* Contact shadows */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.6}
        scale={15}
        blur={2.5}
        far={10}
      />
      
      {/* Recording support */}
      <RecordingController />
      <ImageCaptureBridge />

      {/* Orbit controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={2}
        maxDistance={15}
        autoRotate={params.autoRotate}
        autoRotateSpeed={params.rotationSpeed * 2}
        target={[0, 0.5, 0]}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.1}
      />
      
      {/* Environment */}
      <Environment preset="studio" />
      
      {/* Reference grid */}
      {params.showGrid && (
        <Grid
          args={[20, 20]}
          position={[0, 0, 0]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#404060"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#606080"
          fadeDistance={15}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />
      )}
    </>
  );
}

export function Scene() {
  return (
    <div className="absolute inset-0 md:pl-80">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <PerspectiveCamera makeDefault position={[3, 2, 4]} fov={50} />
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
