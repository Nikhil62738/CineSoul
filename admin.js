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
let activityLog = JSON.parse(localStorage.getItem("cinesoul_activity_log")) || [];
let siteSettings = JSON.parse(localStorage.getItem("cinesoul_settings")) || {
  whatsapp: "918668262694",
  insta: "@cinesoul_45",
  about: "Cinesoul 45 is a cinematic creator focused on weddings, celebrations, portraits, invitation reels, and artistic edits that feel premium and memorable."
};

// --- LOGIN LOGIC ---
const loginOverlay = document.getElementById("loginOverlay");
const adminContent = document.getElementById("adminContent");
const adminPass = document.getElementById("adminPass");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

function checkAuth() {
  if (sessionStorage.getItem("cinesoul_auth") === "true") {
    loginOverlay.style.display = "none";
    adminContent.style.display = "block";
    initDashboard();
  }
}

loginBtn.addEventListener("click", () => {
  if (adminPass.value === "admin123") {
    sessionStorage.setItem("cinesoul_auth", "true");
    loginOverlay.style.display = "none";
    adminContent.style.display = "block";
    initDashboard();
  } else {
    showModal("Login Failed", "Incorrect password. Please try again.", false);
  }
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("cinesoul_auth");
    window.location.reload();
  });
}

// --- MODAL SYSTEM ---
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");
let modalCallback = null;

function showModal(title, message, isConfirm = true, callback = null) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalCancel.style.display = isConfirm ? "block" : "none";
  modalOverlay.classList.add("active");
  modalCallback = callback;
}

modalCancel.addEventListener("click", () => {
  modalOverlay.classList.remove("active");
});

modalConfirm.addEventListener("click", () => {
  modalOverlay.classList.remove("active");
  if (modalCallback) modalCallback();
});

// --- DASHBOARD LOGIC ---
function initDashboard() {
  updateAdminUI();
  updateStats();
  renderActivityLog();
  loadSettings();
}

function logActivity(action) {
  const entry = {
    action,
    time: new Date().toLocaleString(),
    id: Date.now()
  };
  activityLog.unshift(entry);
  if (activityLog.length > 10) activityLog.pop();
  localStorage.setItem("cinesoul_activity_log", JSON.stringify(activityLog));
  renderActivityLog();
}

function renderActivityLog() {
  const logList = document.getElementById("activityLog");
  logList.innerHTML = activityLog.map(log => `
    <li class="activity-item">
      <span>${log.action}</span>
      <small>${log.time}</small>
    </li>
  `).join("");
}

function updateStats() {
  document.getElementById("statReels").textContent = reels.length;
  document.getElementById("statBooked").textContent = bookedDates.length;
  
  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookedDates.filter(d => d >= today).length;
  document.getElementById("statAvailable").textContent = upcoming;
}

function updateAdminUI() {
  const blockedDatesList = document.getElementById("blockedDatesList");
  const adminReelsList = document.getElementById("adminReelsList");

  // Render Blocked Dates
  blockedDatesList.innerHTML = bookedDates.sort().map(date => `
    <li>
      <span>${date}</span>
      <button class="delete-btn" onclick="unblockDate('${date}')">Remove</button>
    </li>
  `).join("");

  // Render Reels Management with Thumbnails and Drag Handle
  adminReelsList.innerHTML = reels.map((reel, index) => `
    <div class="admin-reel-item" draggable="true" data-index="${index}">
      <div class="drag-handle">☰</div>
      <video src="${reel.path}" muted loop onmouseenter="this.play()" onmouseleave="this.pause(); this.currentTime=0;"></video>
      <div class="admin-reel-info">
        <strong>${reel.title}</strong>
        <span>${reel.category}</span>
      </div>
      <button class="delete-btn" onclick="confirmDeleteReel(${index})">Delete</button>
    </div>
  `).join("");

  setupDragAndDrop();
}

// --- FILE UPLOAD (MOCK) ---
const reelVideoFile = document.getElementById("reelVideoFile");
const fileUploadText = document.getElementById("fileUploadText");
const reelVideoPath = document.getElementById("reelVideoPath");

if (reelVideoFile) {
  reelVideoFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      fileUploadText.textContent = file.name;
      // Mock path: assume user manually places it in assets/reels/
      reelVideoPath.value = `assets/reels/${file.name}`;
      fileUploadText.style.color = "var(--gold)";
    } else {
      fileUploadText.textContent = "Select Video File (.mp4)";
      reelVideoPath.value = "";
      fileUploadText.style.color = "var(--gold-soft)";
    }
  });
}

// --- DRAG AND DROP REORDERING ---
function setupDragAndDrop() {
  const items = document.querySelectorAll('.admin-reel-item');
  let draggedItem = null;
  let dragStartIndex = null;

  items.forEach(item => {
    item.addEventListener('dragstart', function(e) {
      draggedItem = this;
      dragStartIndex = parseInt(this.getAttribute('data-index'));
      setTimeout(() => this.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      items.forEach(i => i.classList.remove('drag-over'));
      draggedItem = null;
    });

    item.addEventListener('dragover', function(e) {
      e.preventDefault(); // Necessary to allow dropping
      if (this !== draggedItem) {
        this.classList.add('drag-over');
      }
    });

    item.addEventListener('dragleave', function() {
      this.classList.remove('drag-over');
    });

    item.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      
      if (draggedItem && this !== draggedItem) {
        const dropIndex = parseInt(this.getAttribute('data-index'));
        
        // Reorder the array
        const draggedReel = reels.splice(dragStartIndex, 1)[0];
        reels.splice(dropIndex, 0, draggedReel);
        
        // Save and update
        localStorage.setItem("cinesoul_reels", JSON.stringify(reels));
        logActivity(`Reordered portfolio reels`);
        updateAdminUI();
        updateStats();
      }
    });
  });
}

// --- BOOKING MGMT ---
window.unblockDate = function(date) {
  showModal("Confirm Unblock", `Do you want to unblock ${date}?`, true, () => {
    bookedDates = bookedDates.filter(d => d !== date);
    localStorage.setItem("cinesoul_booked_dates", JSON.stringify(bookedDates));
    logActivity(`Unblocked date: ${date}`);
    updateAdminUI();
    updateStats();
  });
};

document.getElementById("addBlockDate").addEventListener("click", () => {
  const date = document.getElementById("blockDateInput").value;
  if (date && !bookedDates.includes(date)) {
    bookedDates.push(date);
    localStorage.setItem("cinesoul_booked_dates", JSON.stringify(bookedDates));
    logActivity(`Blocked date: ${date}`);
    updateAdminUI();
    updateStats();
  }
});

document.getElementById("addBulkBlock").addEventListener("click", () => {
  const start = new Date(document.getElementById("blockStart").value);
  const end = new Date(document.getElementById("blockEnd").value);
  
  if (isNaN(start) || isNaN(end) || start > end) {
    showModal("Error", "Invalid date range selected.", false);
    return;
  }

  showModal("Confirm Bulk Block", "Block all dates in this range?", true, () => {
    let current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      if (!bookedDates.includes(dateStr)) bookedDates.push(dateStr);
      current.setDate(current.getDate() + 1);
    }
    localStorage.setItem("cinesoul_booked_dates", JSON.stringify(bookedDates));
    logActivity(`Bulk blocked range: ${start.toISOString().split("T")[0]} to ${end.toISOString().split("T")[0]}`);
    updateAdminUI();
    updateStats();
  });
});

// --- REEL MGMT ---
window.confirmDeleteReel = function(index) {
  const reel = reels[index];
  showModal("Delete Reel", `Remove "${reel.title}" from portfolio?`, true, () => {
    reels.splice(index, 1);
    localStorage.setItem("cinesoul_reels", JSON.stringify(reels));
    logActivity(`Deleted reel: ${reel.title}`);
    updateAdminUI();
    updateStats();
  });
};

document.getElementById("addReelForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("reelTitle").value;
  const path = document.getElementById("reelVideoPath").value;
  
  if (!path) {
    showModal("Error", "Please select a video file first.", false);
    return;
  }

  const newReel = {
    path: path,
    title: title,
    category: document.getElementById("reelCategory").value
  };
  
  reels.push(newReel);
  localStorage.setItem("cinesoul_reels", JSON.stringify(reels));
  logActivity(`Added new reel: ${title}`);
  
  document.getElementById("addReelForm").reset();
  document.getElementById("reelVideoPath").value = ""; // Clear hidden input
  
  // Reset custom file upload UI
  const fileUploadText = document.getElementById("fileUploadText");
  if (fileUploadText) {
    fileUploadText.textContent = "Select Video File (.mp4)";
    fileUploadText.style.color = "var(--gold-soft)";
  }
  
  updateAdminUI();
  updateStats();
});

// --- SETTINGS ---
function loadSettings() {
  document.getElementById("settingWhatsApp").value = siteSettings.whatsapp;
  document.getElementById("settingInsta").value = siteSettings.insta;
  document.getElementById("settingAbout").value = siteSettings.about;
}

document.getElementById("settingsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  siteSettings.whatsapp = document.getElementById("settingWhatsApp").value;
  siteSettings.insta = document.getElementById("settingInsta").value;
  siteSettings.about = document.getElementById("settingAbout").value;
  localStorage.setItem("cinesoul_settings", JSON.stringify(siteSettings));
  logActivity("Updated site profile settings");
  showModal("Success", "Settings saved successfully!", false);
});

// --- THREE.JS BACKGROUND ---
const threeBackground = document.getElementById("threeBackground");
if (threeBackground && window.THREE) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  threeBackground.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(2, 0);
  const material = new THREE.MeshBasicMaterial({ color: 0xcda15d, wireframe: true, transparent: true, opacity: 0.05 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 200;
  const posArray = new Float32Array(starsCount * 3);
  for(let i=0; i<starsCount*3; i++) posArray[i] = (Math.random()-0.5)*20;
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const starsMaterial = new THREE.PointsMaterial({ size: 0.02, color: 0xcda15d, transparent: true, opacity: 0.3 });
  const starField = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(starField);

  camera.position.z = 8;

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += 0.002;
    mesh.rotation.y += 0.002;
    starField.rotation.y += 0.0005;
    renderer.render(scene, camera);
  }
  animate();
}

checkAuth();
