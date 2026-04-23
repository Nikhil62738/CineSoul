const whatsappNumber = "918668262694";

const form = document.getElementById("whatsappForm");
const hoverVideos = document.querySelectorAll("[data-hover-video]");
const reelRail = document.querySelector(".work-grid");
const reelButtons = document.querySelectorAll("[data-scroll-reels]");
const threeBackground = document.getElementById("threeBackground");
let soundUnlocked = false;

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const details = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    service: formData.get("service"),
    date: formData.get("date"),
    location: formData.get("location"),
    message: formData.get("message"),
  };

  const whatsappMessage = [
    "Hello Cinesoul, I want to book a shoot.",
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `Service: ${details.service}`,
    `Shoot Date: ${details.date}`,
    `Location: ${details.location}`,
    `Project Details: ${details.message}`,
  ].join("\n");

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  window.open(whatsappUrl, "_blank");
});

const markSoundUnlocked = () => {
  soundUnlocked = true;
};

document.addEventListener("pointerdown", markSoundUnlocked, { passive: true });
document.addEventListener("keydown", markSoundUnlocked);

const updateAudioState = (video, shouldUnmute) => {
  const card = video.closest(".work-card");
  const toggle = card?.querySelector(".audio-toggle");

  video.muted = !shouldUnmute;
  card?.classList.toggle("has-audio", shouldUnmute);

  if (toggle) {
    toggle.textContent = shouldUnmute ? "Click to mute" : "Click to unmute";
    toggle.setAttribute(
      "aria-label",
      shouldUnmute ? "Mute reel sound" : "Unmute reel sound"
    );
  }
};

const resetReelAudio = (exceptVideo = null) => {
  hoverVideos.forEach((video) => {
    if (video === exceptVideo) {
      return;
    }

    const card = video.closest(".work-card");
    updateAudioState(video, false);
    video.controls = false;
    card?.classList.remove("has-audio");
  });
};

hoverVideos.forEach((video) => {
  const card = video.closest(".work-card");
  const toggle = card?.querySelector(".audio-toggle");

  const playVideo = () => {
    resetReelAudio(video);
    updateAudioState(video, soundUnlocked);
    const playPromise = video.play();
    card?.classList.add("is-playing");

    if (playPromise) {
      playPromise.catch(() => {
        updateAudioState(video, false);
        card?.classList.remove("is-playing");
      });
    }
  };

  const pauseVideo = () => {
    video.pause();
    video.currentTime = 0;
    updateAudioState(video, false);
    card?.classList.remove("is-playing");
  };

  card?.addEventListener("mouseenter", playVideo);
  card?.addEventListener("mouseleave", pauseVideo);
  card?.addEventListener("focusin", playVideo);
  card?.addEventListener("focusout", pauseVideo);
  card?.addEventListener("touchstart", playVideo, { passive: true });

  toggle?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    soundUnlocked = true;
    const shouldUnmute = video.muted;

    if (shouldUnmute) {
      resetReelAudio(video);
      card?.classList.add("is-playing");
    }

    updateAudioState(video, shouldUnmute);

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        updateAudioState(video, false);
      });
    }
  });

  card?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest(".audio-toggle")) {
      return;
    }

    soundUnlocked = true;
    const shouldUnmute = video.muted;

    if (shouldUnmute) {
      resetReelAudio(video);
    }

    updateAudioState(video, shouldUnmute);
    video.play().catch(() => {
      updateAudioState(video, false);
    });
  });
});

reelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!reelRail) {
      return;
    }

    const direction = button.getAttribute("data-scroll-reels") === "left" ? -1 : 1;
    reelRail.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  });
});

if (threeBackground && window.THREE) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 12;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  threeBackground.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.IcosahedronGeometry(0.7, 0);
  const material = new THREE.MeshBasicMaterial({
    color: 0xcda15d,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });

  for (let index = 0; index < 18; index += 1) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 10
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    const scale = 0.5 + Math.random() * 1.6;
    mesh.scale.setScalar(scale);
    group.add(mesh);
  }

  const pointsGeometry = new THREE.BufferGeometry();
  const pointCount = 160;
  const positions = new Float32Array(pointCount * 3);

  for (let index = 0; index < pointCount; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 24;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 12;
  }

  pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xf0d6a6,
    size: 0.06,
    transparent: true,
    opacity: 0.7,
  });

  const starField = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(starField);

  const clock = new THREE.Clock();
  let targetX = 0;
  let targetY = 0;

  const onPointerMove = (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 0.8;
    targetY = (event.clientY / window.innerHeight - 0.5) * 0.8;
  };

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", onResize);

  const animate = () => {
    const elapsed = clock.getElapsedTime();

    group.rotation.y = elapsed * 0.08;
    group.rotation.x = elapsed * 0.04;
    group.position.x += (targetX - group.position.x) * 0.03;
    group.position.y += (-targetY - group.position.y) * 0.03;

    group.children.forEach((mesh, index) => {
      mesh.rotation.x += 0.002 + index * 0.00004;
      mesh.rotation.y += 0.003 + index * 0.00005;
    });

    starField.rotation.y = elapsed * 0.015;
    starField.rotation.x = Math.sin(elapsed * 0.2) * 0.08;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
}
