/**
 * 3D Cyber Scene - Three.js particle grid background
 * Creates a floating wireframe grid + particle field with mouse parallax.
 */
(function () {
  let scene, camera, renderer, particlesMesh, gridMesh;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let frameId;

  function init() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.0008);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 0, 500);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a, 1);

    createParticles();
    createGrid();

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    animate();
  }

  function createParticles() {
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = (Math.random() - 0.5) * 2000;

      const brightness = 0.2 + Math.random() * 0.8;
      colors[i3]     = 0;
      colors[i3 + 1] = brightness;
      colors[i3 + 2] = brightness * 0.25;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
  }

  function createGrid() {
    const gridGroup = new THREE.Group();
    const gridSize = 1200;
    const divisions = 30;
    const step = gridSize / divisions;
    const halfSize = gridSize / 2;

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff41,
      transparent: true,
      opacity: 0.06,
    });

    for (let i = 0; i <= divisions; i++) {
      const pos = -halfSize + i * step;

      // X lines
      const geoX = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-halfSize, 0, pos),
        new THREE.Vector3(halfSize, 0, pos),
      ]);
      gridGroup.add(new THREE.Line(geoX, lineMaterial));

      // Z lines
      const geoZ = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pos, 0, -halfSize),
        new THREE.Vector3(pos, 0, halfSize),
      ]);
      gridGroup.add(new THREE.Line(geoZ, lineMaterial));
    }

    gridGroup.position.y = -300;
    gridGroup.rotation.x = -Math.PI * 0.15;
    gridMesh = gridGroup;
    scene.add(gridMesh);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function animate() {
    frameId = requestAnimationFrame(animate);

    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    if (particlesMesh) {
      particlesMesh.rotation.y += 0.0003;
      particlesMesh.rotation.x += 0.0001;
      particlesMesh.rotation.y += mouse.x * 0.0005;
      particlesMesh.rotation.x += mouse.y * 0.0005;
    }

    if (gridMesh) {
      gridMesh.rotation.z = mouse.x * 0.02;
      gridMesh.position.y = -300 + mouse.y * 20;
    }

    camera.position.x += (mouse.x * 30 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 20 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // Start when portfolio is revealed
  window.addEventListener('portfolio-enter', init);
})();
