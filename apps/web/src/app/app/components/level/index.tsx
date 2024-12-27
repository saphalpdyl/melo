import React from "react";
import { Canvas } from "@react-three/fiber";
import { MapControls, OrbitControls, OrthographicCamera, Stats, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

import Players from "@/web/app/app/components/three-components/players";

export default function Level() {
  
  return (
    <Canvas 
        className=""
        shadows
        gl={{ 
          toneMapping: 3, // ACESFilmicToneMapping
          outputColorSpace: 'srgb',
          antialias: false,
        }}
        >
        <Stats />
        <color attach="background" args={['#3B8B5D']} />
        <OrthographicCamera
          makeDefault
          zoom={80}
          position={[10, 14, 10]}
          near={-1000}
          far={1000}
        />
        
        <directionalLight 
          castShadow 
          position={[10, 60, 0]} 
          intensity={1}
          shadow-intensity={2.6}
          shadow-mapSize={[8192, 8192]}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
          shadow-bias={-0.0001}
        />
        
        {/* Hemisphere light for ambient illumination */}
        <hemisphereLight 
          intensity={3}
          groundColor="#000"
          position={[100, 100, 100]}
        />
        
        {/* Subtle fill light */}
        <ambientLight intensity={0.4} />
        
        <Suspense fallback={null}>
          {/* <Housing />
          <Environment />
          <Ground /> */}
        </Suspense>
        
        <gridHelper />
        <MapControls 
          enableRotate={false}
          minZoom={30}
          // maxZoom={100}
          zoomSpeed={3}
        />
        {/* <OrbitControls /> */}

        {/* Players */}
        <Players />
      </Canvas>
  );
}