import React, { useRef, useEffect, useState } from 'react';

export default function EarthGlobe() {
  const globeEl = useRef();
  const [Globe, setGlobe] = useState(null);
  const [THREE, setTHREE] = useState(null);

  useEffect(() => {
    // Dynamically import from esm.sh since local npm install is failing
    Promise.all([
      import('https://esm.sh/react-globe.gl?external=react,react-dom'),
      import('https://esm.sh/three')
    ]).then(([GlobeModule, ThreeModule]) => {
      setGlobe(() => GlobeModule.default);
      setTHREE(ThreeModule);
    }).catch(err => console.error("Failed to load globe modules:", err));
  }, []);

  useEffect(() => {
    const globe = globeEl.current;
    if (globe && THREE) {
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
      globe.controls().enableZoom = false;
      
      // Add clouds sphere
      const CLOUDS_IMG_URL = 'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/clouds/clouds.png';
      const CLOUDS_ALT = 0.004;
      const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

      new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
          new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
        );
        globe.scene().add(clouds);

        (function rotateClouds() {
          clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
          requestAnimationFrame(rotateClouds);
        })();
      });
    }
  }, [Globe, THREE]);

  if (!Globe) {
    return <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Loading Globe...</div>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center cursor-move">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        width={500}
        height={500}
      />
    </div>
  );
}
