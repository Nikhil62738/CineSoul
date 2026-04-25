let whatsappNumber = "918668262694";

const form = document.getElementById("whatsappForm");
const reelsGrid = document.getElementById("reelsGrid");
const reelButtons = document.querySelectorAll("[data-scroll-reels]");
const threeBackground = document.getElementById("threeBackground");

let soundUnlocked = false;
let activeAudioVideo = null;

// --- DYNAMIC SETTINGS ---
const defaultSettings = {
  whatsapp: "918668262694",
  insta: "@cinesoul_45",
  about: "Cinesoul 45 is a cinematic creator focused on weddings, celebrations, portraits, invitation reels, and artistic edits that feel premium and memorable."
};

const siteSettings = JSON.parse(localStorage.getItem("cinesoul_settings")) || defaultSettings;

function applyDynamicSettings() {
  // Update WhatsApp links
  const whatsappNumber = siteSettings.whatsapp;
  window.whatsappNumber = whatsappNumber; // Global for form use

  // Update Instagram links
  const instaLinks = document.querySelectorAll('a[href*="instagram.com"]');
  instaLinks.forEach(link => {
    link.href = `https://instagram.com/${siteSettings.insta.replace('@', '')}`;
  });

  // Update About text if elements exist
  const aboutText = document.querySelector(".about-copy p");
  if (aboutText) aboutText.textContent = siteSettings.about;
}

// Update WhatsApp number reference in form logic from settings
if (siteSettings.whatsapp) {
  whatsappNumber = siteSettings.whatsapp; 
}

// --- DATA MANAGEMENT ---
const defaultReels = [
  { path: "assets/reels/Drone shoot.mp4", title: "Aerial Perspectives: Capturing the World from Above", category: "Instagram Reel" },
  { path: "assets/reels/haldi-celebration.mp4", title: "Golden Rituals: Haldi Ceremony Highlights", category: "Instagram Reel" },
  { path: "assets/reels/Jayanti.mp4", title: "Cultural Reverence: Jayanti Festivities", category: "Instagram Reel" },
  { path: "assets/reels/Mehendi-celebration.mp4", title: "Art in Motion: Mehendi Traditions", category: "Instagram Reel" },
  { path: "assets/reels/Model shoot.mp4", title: "Elegance in Frame: Professional Portrait Session", category: "Instagram Reel" },
  { path: "assets/reels/New Purchase.mp4", title: "Unboxing Joy: First Impressions", category: "Instagram Reel" },
  { path: "assets/reels/New purchase2.mp4", title: "Celebrating Acquisitions: A Fresh Start", category: "Instagram Reel" },
  { path: "assets/reels/Wedding card.mp4", title: "Design Showcase: Wedding Invitation Concept", category: "Instagram Reel" },
  { path: "assets/reels/Wedding card2.mp4", title: "Creative Variations: Wedding Card Animation", category: "Instagram Reel" },
  { path: "assets/reels/Wedding invite.mp4", title: "Invitation in Motion: Wedding Storytelling", category: "Instagram Reel" }
];

let reels = JSON.parse(localStorage.getItem("cinesoul_reels")) || defaultReels;
let bookedDates = JSON.parse(localStorage.getItem("cinesoul_booked_dates")) || ["2026-04-25", "2026-04-26"];

const dateInput = document.getElementById("date");
let fp = null;

// --- DYNAMIC RENDERING ---

function renderReels() {
  if (!reelsGrid) return;
  
  reelsGrid.innerHTML = reels.map((reel, index) => `
    <article class="work-card" data-index="${index}">
      <video class="work-video" data-hover-video loop playsinline preload="metadata">
        <source src="${reel.path}" type="video/mp4">
      </video>
      <div class="work-overlay"></div>
      <div class="work-content">
        <p>${reel.category}</p>
        <h3>${reel.title}</h3>
      </div>
    </article>
  `).join("");

  // Re-initialize hover video listeners
  initHoverVideos();
}

function initFlatpickr() {
  if (dateInput && typeof flatpickr !== "undefined") {
    fp = flatpickr(dateInput, {
      dateFormat: "Y-m-d",
      minDate: "today",
      disable: bookedDates,
      onOpen: function() {
        // Aggressively refresh bookedDates from localStorage when calendar opens
        const freshDates = JSON.parse(localStorage.getItem("cinesoul_booked_dates"));
        if (freshDates) {
          bookedDates = freshDates;
          fp.set("disable", bookedDates);
        }
      },
      onChange: function(selectedDates, dateStr, instance) {
        if (bookedDates.includes(dateStr)) {
          alert("This date is already booked. Please select another date.");
          instance.clear();
        }
      },
      onDayCreate: function(dObj, dStr, fpInstance, dayElem) {
        const dateStr = fpInstance.formatDate(dayElem.dateObj, "Y-m-d");
        if (bookedDates.includes(dateStr)) {
          dayElem.classList.add("booked-date");
          dayElem.title = "Already booked";
        }
      }
    });
  }
}

// Initial calls
renderReels();
initFlatpickr();
applyDynamicSettings();

// --- REAL-TIME SYNC ---
// This listens for changes made in other tabs (like the Admin Dashboard)
window.addEventListener('storage', (e) => {
  if (e.key === "cinesoul_booked_dates") {
    bookedDates = JSON.parse(e.newValue);
    if (fp) {
      fp.set("disable", bookedDates);
      fp.redraw();
    }
  }
  if (e.key === "cinesoul_reels") {
    reels = JSON.parse(e.newValue);
    renderReels();
  }
  if (e.key === "cinesoul_settings") {
    const newSettings = JSON.parse(e.newValue);
    Object.assign(siteSettings, newSettings);
    applyDynamicSettings();
  }
});

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

  if (bookedDates.includes(details.date)) {
    alert("Date already book plz select another date");
    return;
  }

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
  video.muted = !shouldUnmute;
  card?.classList.toggle("has-audio", shouldUnmute);

  if (shouldUnmute) {
    activeAudioVideo = video;
  } else if (activeAudioVideo === video) {
    activeAudioVideo = null;
  }
};

const resetReelAudio = (exceptVideo = null, videos) => {
  videos.forEach((video) => {
    if (video === exceptVideo) {
      return;
    }

    const card = video.closest(".work-card");
    updateAudioState(video, false);
    video.controls = false;
    card?.classList.remove("has-audio");
  });
};

function initHoverVideos() {
  const videos = document.querySelectorAll("[data-hover-video]");
  
  videos.forEach((video) => {
    const card = video.closest(".work-card");

    const playVideo = () => {
      resetReelAudio(video, videos);
      updateAudioState(video, true); 
      
      const playPromise = video.play();
      card?.classList.add("is-playing");

      if (playPromise) {
        playPromise.catch(() => {
          updateAudioState(video, false);
          video.play().catch(() => {
            card?.classList.remove("is-playing");
          });
        });
      }
    };

    const pauseVideo = () => {
      video.pause();
      video.currentTime = 0;

      if (activeAudioVideo !== video) {
        updateAudioState(video, false);
      }

      card?.classList.remove("is-playing");
    };

    card?.addEventListener("mouseenter", playVideo);
    card?.addEventListener("mouseleave", pauseVideo);
    card?.addEventListener("focusin", playVideo);
    card?.addEventListener("focusout", pauseVideo);
    card?.addEventListener("touchstart", playVideo, { passive: true });

    card?.addEventListener("click", (event) => {
      soundUnlocked = true;
      updateAudioState(video, true);
      video.play().catch(() => {
        updateAudioState(video, false);
      });
    });

    video.addEventListener("ended", () => {
      updateAudioState(video, false);
      card?.classList.remove("is-playing");
    });
  });
}

reelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!reelsGrid) {
      return;
    }

    const direction = button.getAttribute("data-scroll-reels") === "left" ? -1 : 1;
    reelsGrid.scrollBy({
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
