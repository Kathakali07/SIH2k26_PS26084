import React, { useRef, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

export default function EarthGlobe() {
  const globeEl = useRef(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let reqId;
    let clouds;
    let globe;

    const initGlobe = () => {
      try {
        globe = globeEl.current;
        if (!globe) return;

        // Ensure methods are available
        if (!globe.controls || !globe.scene || !globe.getGlobeRadius) {
          console.warn("Globe methods not ready yet");
          reqId = requestAnimationFrame(initGlobe);
          return;
        }

        // Controls
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.5;
        globe.controls().enableZoom = false;

        // Add clouds
        const CLOUDS_IMG_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/clouds/clouds.png';
        const CLOUDS_ALT = 0.008;
        const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

        new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
          try {
            clouds = new THREE.Mesh(
              new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
              new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
            );
            globe.scene().add(clouds);

            function rotateClouds() {
              if (clouds) {
                clouds.rotation.y += (CLOUDS_ROTATION_SPEED * Math.PI) / 180;
              }
              reqId = requestAnimationFrame(rotateClouds);
            }
            rotateClouds();
          } catch (e) {
            console.error("Error creating clouds", e);
          }
        }, undefined, (err) => {
          console.error("Error loading cloud texture", err);
        });

      } catch (err) {
        console.error("Error initializing globe", err);
        setHasError(true);
      }
    };

    // Delay initialization slightly to ensure component is mounted and ThreeJS context is ready
    const timeoutId = setTimeout(initGlobe, 100);

    return () => {
      clearTimeout(timeoutId);
      if (reqId) cancelAnimationFrame(reqId);
      if (clouds && globe && globe.scene && typeof globe.scene === 'function' && globe.scene()) {
        globe.scene().remove(clouds);
      }
    };
  }, []);

  if (hasError) return <div className="w-[550px] h-[550px] bg-red-900/20 rounded-full flex items-center justify-center">Error loading globe</div>;

  return (
    <div className="w-full max-w-[550px] aspect-square flex items-center justify-center cursor-move drop-shadow-[0_0_120px_rgba(37,99,235,0.3)] mx-auto relative z-50">
      <Globe
        ref={globeEl}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        width={550}
        height={550}
        showAtmosphere={true}
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.2}
      />
    </div>
  );
}
