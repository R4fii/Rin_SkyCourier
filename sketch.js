// --- VARIABEL GLOBAL ---
let devMode = false;
let rin;
let aero; 
let platforms = [];
let items = [];
let drones = []; 
let particles = []; 
let goal;
let gravity = 0.6;
let currentLevel = 0;
let bgParams = { c1: [135, 206, 235], c2: [255, 255, 255] }; 
let windForce = 0; 
let bgMusic;
let clouds = [];
let osc, env; // Oscillator & Envelope untuk efek suara

// Sistem Game
let gameState = "MENU"; // MENU, CUTSCENE, PLAY, CREDITS, GAMEOVER
let difficulty = 1; // 0: Easy, 1: Normal, 2: Hard
let activeCutscene = null;
let creditY = 400; 
let volSlider;
let deathCount = 0; // Hitung kematian

function preload() {
  try { bgMusic = loadSound('music.wav'); } catch (e) {}
}

// --- DATABASE CUTSCENE ---
const cutsceneData = [
  { triggerLevel: 0, title: "ACT 1: FIRST DELIVERY", story: "Rin, kurir pemula Verdantia, memulai tugas pertamanya.\n\nInstruktur Aero: 'Kau mau jadi kurir langit? Jatuhlah dulu, baru tau rasanya angin!'", color: [100, 200, 255] },
  { triggerLevel: 5, title: "ACT 2: TURBULENT HEIGHTS", story: "Cuaca memburuk. Angin kencang dan badai menghadang.\n\n'Dalam badai, kecepatan tak cukup. Kau harus menjadi berat seperti jangkar.'", color: [100, 100, 120] },
  { triggerLevel: 10, title: "ACT 3: ZENITH RUN", story: "Menara Zenith. Platform memudar seperti hantu.\n\n'Angin selalu berubah. Tapi hatimu... itulah kompasmu.'", color: [255, 215, 0] }
];

// --- DATABASE LEVEL ---
const levelData = [
  // ACT 1
  { bg: [[100, 180, 255], [255, 255, 255]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 200, y: 300, msg: "Latihan Dasar: Lompat dengan SPASI."}, 
    platforms: [[0,350,250,50,0,0,0,0], [300,300,100,20,0,0,0,0], [450,250,100,20,0,0,0,0], [650,200,150,20,0,0,0,0]], 
    goal: {x: 700, y: 160}, 
    items: [] 
    },
  { bg: [[100, 180, 255], [255, 255, 255]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 100, y: 300, msg: "Kuning = JUMP PAD. Loncat otomatis!"}, 
    platforms: [[0,350,200,50,0,0,0,0], [300,250,100,20,0,0,0,0], [600,100,150,20,0,0,0,0]], 
    goal: {x: 700, y: 60}, 
    items: [[330, 230, 0]] },
  { bg: [[100, 180, 255], [255, 255, 255]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 100, y: 300, msg: "Biru = SPEED. Tahan PANAH untuk lari!"}, 
    platforms: [[0,350,200,50,0,0,0,0], [250,350,300,20,0,0,0,0], [700,250,100,20,0,0,0,0]], 
    goal: {x: 720, y: 210}, 
    items: [[170, 310, 1]] 
    },
  { bg: [[100, 180, 255], [255, 255, 255]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 80, y: 300, msg: "Celah lebar! Gunakan kecepatanmu."}, 
    platforms: [[0,350,150,50,0,0,0,0], [200,350,250,20,0,0,0,0], [650,300,150,20,0,0,0,0]], 
    goal: {x: 700, y: 260}, 
    items: [[220, 310, 1]] 
  },
  { bg: [[100, 180, 255], [255, 255, 255]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 150, y: 300, msg: "Hati-hati! Pijakan ini bergerak."}, 
    platforms: [[0,350,280,50,0,0,0,0], [300,300,100,20,2,0,150,0], [550,250,100,20,0,2,100,0], [750,200,50,20,0,0,0,0]], 
    goal: {x: 760, y: 160}, 
    items: [] 
  },
  // ACT 2
  { bg: [[80, 80, 100], [30, 30, 40]], 
    wind: -0.8, 
    startX: 50, 
    startY: 300, 
    npc: {x: 100, y: 300, msg: "Angin kencang! Hati-hati terdorong."}, 
    platforms: [[0,350,200,50,0,0,0,0], [300,300,200,20,0,0,0,0], [600,250,150,20,0,0,0,0]], 
    goal: {x: 700, y: 210}, 
    items: [], 
    drones: [[350, 270, 80, 2]] },
  { bg: [[60, 60, 80], [20, 20, 30]], 
    wind: -2.0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 80, y: 300, msg: "Badai! Ambil IRON BOOTS (Abu)!"}, 
    platforms: [[0,350,150,50,0,0,0,0], [250,350,100,20,0,0,0,0], [450,300,100,20,0,0,0,0], [650,250,100,20,0,0,0,0]], 
    goal: {x: 680, y: 210}, 
    items: [[260, 310, 2]], 
    drones: [[550, 270, 80, 3]] },
  { bg: [[80, 80, 90], [30, 30, 40]], 
    wind: -1.5, 
    startX: 50, 
    startY: 300, 
    npc: {x: 80, y: 300, msg: "AMBIL KEDUANYA AGAR SELAMAT!"}, 
    platforms: [[0,350,200,50,0,0,0,0], [250,300,100,20,3,0,150,0], [600,200,150,20,0,0,0,0]], 
    goal: {x: 700, y: 160}, 
    items: [[100, 310, 2], [380, 250, 1]] 
  },
  { bg: [[70, 70, 80], [30, 30, 40]], 
    wind: 1.5, 
    startX: 50, 
    startY: 300, 
    npc: {x: 80, y: 300, msg: "ANGIN KE KANAN! AMBIL SAYAP!"}, 
    platforms: [[0,350,150,50,0,0,0,0], [300,350,100,20,0,0,0,0], [600,150,150,20,0,0,0,0]], 
    goal: {x: 700, y: 110}, 
    items: [[120, 310, 3]], 
    drones: [[350, 320, 100, 4]] 
  },
  { bg: [[50, 50, 60], [20, 20, 30]], 
    wind: -2.0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 80, y: 300, msg: "BADAI MAKSIMAL! HATI-HATI."}, 
    platforms: [[0,350,200,50,0,0,0,0], [250,300,120,20,0,0,0,0], [500,250,100,20,0,2,100,0], [700,150,100,20,0,0,0,0]], 
    goal: {x: 720, y: 110}, 
    items: [[290, 260, 2]] 
  },
  // ACT 3
  { bg: [[255, 215, 0], [255, 255, 200]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 150, y: 300, msg: "PLATFORM HANTU... TUNGGU PADAT."}, 
    platforms: [[0,350,200,50,0,0,0,0], [250,300,100,20,0,0,0,1], [450,250,100,20,0,0,0,1], [650,200,100,20,0,0,0,0]], 
    goal: {x: 680, y: 160}, 
    items: [] 
  },
  { bg: [[255, 200, 0], [255, 250, 150]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 100, y: 300, msg: "PUTIH = WINGS. DOUBLE JUMP!"}, 
    platforms: [[0,350,200,50,0,0,0,0], [300,200,100,20,0,0,0,0], [600,100,100,20,0,0,0,0]], 
    goal: {x: 620, y: 60}, 
    items: [[220, 310, 3]] 
  },
  { bg: [[255, 200, 0], [255, 250, 150]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 80, y: 300, msg: "PERCAYA PADA SAYAPMU."}, 
    platforms: [[0,350,150,50,0,0,0,0], [250,250,80,20,0,0,0,1], [450,150,80,20,0,0,0,1], [700,100,100,20,0,0,0,0]], 
    goal: {x: 720, y: 60}, 
    items: [[180, 310, 3]] 
  },
  { bg: [[255, 140, 0], [255, 200, 100]], 
    wind: 0, 
    startX: 50, 
    startY: 350, 
    npc: {x: 80, y: 330, msg: "MUSTAHIL? GABUNGKAN SPEED & WINGS!"}, 
    platforms: [[0,380,150,50,0,0,0,0], [350, 300, 100, 20, 0, 3, 100, 1], [650, 150, 100, 20, 2, 0, 100, 1], [750, 100, 50, 20, 0, 0, 0, 0]], 
    goal: {x: 755, y: 60}, 
    items: [[100, 340, 1], [390, 260, 3]] 
  },
  { bg: [[255, 223, 0], [255, 255, 220]], 
    wind: 0, 
    startX: 50, 
    startY: 300, 
    npc: {x: 80, y: 300, msg: "UJIAN TERAKHIR! PUNCAK DI LANGIT!"}, 
    platforms: [[0,350,150,50,0,0,0,0], [200,280,80,20,0,0,0,0], [350,200,80,20,0,0,0,1], [500,120,80,20,0,0,0,1], [350,50,80,20,0,0,0,1], [500,-20,80,20,0,0,0,1], [650,-80,150,20,0,0,0,0]], 
    goal: {x: 700, y: -120}, 
    items: [[200, 240, 3]] 
  }
];

function setup() {
  createCanvas(800, 400);
  osc = new p5.Oscillator('square');
  env = new p5.Envelope();
  env.setADSR(0.01, 0.1, 0.1, 0.1); // Attack, Decay, Sustain, Release
  env.setRange(0.5, 0);
  osc.start(); osc.amp(0); // Mulai diam

  if(bgMusic) {
    bgMusic.setVolume(0.3);
    bgMusic.loop();
  }
  // Pixel Art Settings
  noSmooth(); 
  textFont('Courier New');
  textStyle(BOLD);
  
  volSlider = createSlider(0, 1, 0.3, 0.01);
  volSlider.style('width', '100px');
  repositionSlider();

  rin = new Player();
  
  // Buat 10 Awan secara acak
  for(let i=0; i<10; i++) clouds.push(new Cloud());
  for(let i=0; i<20; i++) particles.push(new Particle());
}

function windowResized() { repositionSlider(); }

function repositionSlider() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  volSlider.position(x + 110, y + 375); 
}

function draw() {
  if(bgMusic) bgMusic.setVolume(volSlider.value());

  // --- MENU ---
  if (gameState === "MENU") {
    volSlider.show(); 
    background(100, 200, 255);
    drawGradient([100, 200, 255], [255, 255, 255]);
    for (let c of clouds) { c.update(); c.show(); }
    noStroke(); fill(255, 255, 255, 150);
    ellipse(100, 100, 120, 60); ellipse(600, 300, 200, 80); ellipse(700, 50, 150, 50);

    textAlign(CENTER); 
    fill(0, 50); textSize(60); text("RIN", width/2+4, 104); 
    fill(255); textSize(60); text("RIN", width/2, 100);
    
    fill(0, 50); textSize(40); text("SKY COURIER", width/2+3, 153); 
    fill(255, 215, 0); textSize(40); text("SKY COURIER", width/2, 150);

    fill(0); textSize(16); text("SELECT DIFFICULTY:", width/2, 220);
    
    if(difficulty===0) { fill(0, 200, 0); text("> EASY <", width/2, 250); } else { fill(100); text("EASY", width/2, 250); }
    if(difficulty===1) { fill(0, 0, 255); text("> NORMAL <", width/2, 280); } else { fill(100); text("NORMAL", width/2, 280); }
    if(difficulty===2) { fill(255, 0, 0); text("> HARD (impossible)<", width/2, 310); } else { fill(100); text("HARD", width/2, 310); }

    if (frameCount % 60 < 30) {
      fill(0); textSize(14); text("- PRESS ENTER -", width/2, 360);
    }
    if (key === 'h' || key === 'H') gameState = "ABOUT";
    fill(0); textSize(14);
    text("[H] HOW TO PLAY & ABOUT", width/2, 330);

    fill(0); textSize(12); textAlign(LEFT); text("VOL:", 75, 390); 
    textAlign(CENTER); text("CREATED BY RAFII\n V2.0", width/2, height - 20);
    return; 
  } else { volSlider.hide(); }
  // HALAMAN ABOUT
  if (gameState === "ABOUT") {
      volSlider.hide();
      background(30, 30, 45); // Background gelap elegan
      
      // Judul Header
      fill(255, 215, 0); textAlign(CENTER); textStyle(BOLD);
      textSize(28); text("ABOUT RIN: SKY COURIER", width/2, 50);
      
      // Garis Pembatas
      stroke(255, 100); strokeWeight(2); line(50, 70, 750, 70); noStroke();

      // --- KOLOM KIRI (Info & Story) ---
      textAlign(LEFT); textSize(14); 
      let leftX = 60;
      let startY = 110;
      let gap = 20;

      // Info Creator
      fill(200); textStyle(NORMAL);
      text("CREATOR: Rafii Rahmadiansyah", leftX, startY);
      text("VERSION: 2.0 (Enhanced Edition)", leftX, startY + gap);
      
      // Story
      startY += 60;
      fill(100, 200, 255); textStyle(BOLD); text("STORY:", leftX, startY);
      fill(220); textStyle(NORMAL);
      text("Rin adalah kurir pos di dunia langit.", leftX, startY + gap);
      text("Tugasmu mengantar paket ke menara Zenith.", leftX, startY + gap*2);
      text("Waspada terhadap angin badai & drone!", leftX, startY + gap*3);

      // --- KOLOM KANAN (Controls & Items) ---
      let rightX = 420; // Geser ke kanan
      startY = 110;
      
      // Controls
      fill(100, 255, 100); textStyle(BOLD); text("CONTROLS:", rightX, startY);
      fill(220); textStyle(NORMAL);
      text("[PANAH KIRI/KANAN] : Bergerak", rightX, startY + gap);
      text("[SPASI] : Melompat", rightX, startY + gap*2);
      text("[F] : Fullscreen Mode", rightX, startY + gap*3);
      
      // Items
      startY += 90;
      fill(255, 100, 100); textStyle(BOLD); text("POWER UPS:", rightX, startY);
      fill(220); textStyle(NORMAL);
      text("- BIRU  : Speed Boost (Lari Cepat)", rightX, startY + gap);
      text("- ABU   : Iron Boots (Anti Badai)", rightX, startY + gap*2);
      text("- PUTIH : Wings (Double Jump)", rightX, startY + gap*3);

      // Footer (Tombol Kembali)
      textAlign(CENTER); fill(255, 215, 0); textStyle(BOLD); textSize(16);
      if (frameCount % 60 < 40) { // Efek kedip
          text(">> TEKAN [ESC] UNTUK KEMBALI KE MENU <<", width/2, 380);
      }
      return;
  }
  
  // --- GAME OVER SCREEN ---
  if (gameState === "GAMEOVER") {
    background(50, 0, 0, 200); // Overlay Merah
    fill(255); textAlign(CENTER);
    textSize(40); text("GAME OVER", width/2, height/2 - 20);
    textSize(16); text("Rin terjatuh dari langit...", width/2, height/2 + 20);
    
    textSize(14); fill(200);
    text("[R] Restart Level  |  [Q] Quit to Menu", width/2, height/2 + 60);
    
    // MERCY SYSTEM
    if (deathCount > 5 && difficulty > 0) {
      fill(255, 255, 0);
      text("Terlalu sulit? Tekan [E] untuk turun ke Easy Mode.", width/2, height/2 + 100);
    }
    return;
  }

  // --- LEVEL COMPLETE SCREEN ---
  if (gameState === "LEVEL_COMPLETE") {
    background(50, 150, 50, 200); // Overlay Hijau Transparan
    
    fill(255); textAlign(CENTER);
    
    // Judul
    textSize(40); text("LEVEL COMPLETE!", width/2, height/2 - 40);
    
    // Info Level
    textSize(20); text("Level " + (currentLevel + 1) + " Selesai", width/2, height/2);
    
    // Tombol Lanjut
    if (frameCount % 60 < 40) { // Efek kedip
        fill(255, 215, 0); // Warna Emas
        textSize(18); 
        text(">> TEKAN [ENTER] UNTUK LANJUT <<", width/2, height/2 + 60);
    }
    return;
  }

  // --- CUTSCENE & CREDIT ---
  if (gameState === "CUTSCENE" || gameState === "CREDITS") { drawOverlayScreen(); return; }

  // --- GAMEPLAY ---
  noStroke(); textAlign(LEFT); 
  drawGradient(bgParams.c1, bgParams.c2);
  for (let c of clouds) { c.update(); c.show();}
  // --- EFEK CUACA KHUSUS PER ACT ---
  // ACT 2: BADAI (Level 5-9)
  if (currentLevel >= 5 && currentLevel < 10) {
      // 1. Hujan (Garis-garis tipis jatuh)
      stroke(200, 200, 255, 100);
      for(let i=0; i<10; i++) {
          let rx = random(width);
          let ry = random(height);
          line(rx, ry, rx - 5, ry + 10); // Garis miring ketiup angin
      }
      noStroke();

      // 2. Petir (Flash layar sesekali)
      if (random(1) < 0.005) { // Peluang kecil 0.5% per frame
          background(255, 255, 255, 150); // Layar putih kilat
          // Opsional: Bunyi petir (pakai sfx noise kalau mau)
      }
  }

  // ACT 3: ZENITH (Level 10+)
  if (currentLevel >= 10) {
      // Partikel Debu Emas (Naik ke atas)
      fill(255, 215, 0, 150); // Emas transparan
      for(let i=0; i<5; i++) {
          let rx = random(width);
          let ry = (frameCount * 2 + i * 100) % height; 
          // Kita balik biar naik ke atas (height - ry)
          ellipse(rx, height - ry, random(2, 5)); 
      }
  }
  drawEffects(); 

  // UI
  fill(0, 100); rect(10, 10, 250, 50);
  fill(255); textSize(14); 
  text("LEVEL " + (currentLevel + 1), 20, 30);
  let title = currentLevel < 5 ? "ACT 1: DELIVERY" : currentLevel < 10 ? "ACT 2: STORMS" : "ACT 3: ZENITH";
  text(title, 20, 50);

  // Update
  for (let p of platforms) p.update();
  rin.update();
  for (let d of drones) d.update();
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(); particles[i].show();
    if (particles[i].finished()) particles.splice(i, 1);
  }

  // Render
  push();
  if (rin.y < 100) translate(0, 100 - rin.y);

  for (let p of platforms) p.show();
  if(goal) { goal.show(); if(goal.checkReach(rin)) { gameState = "LEVEL_COMPLETE";} }
  if(aero) { aero.show(); aero.checkTalk(rin); }
  for (let i of items) { i.show(); i.checkCollision(rin); }
  for (let d of drones) { d.show(); d.checkCollision(rin); }
  rin.show(); 
  pop();

  // Cek Game Over
  if (rin.y > height + 300) gameOver();
  //! DEV MODE VISUAL
  if (devMode) {
    push();
    resetMatrix();
    fill (255, 0, 0); noStroke();
    textAlign(RIGHT); textSize(12); textStyle(BOLD);
    let xPos = width - 20;
    let yPos = 30;

    text("★ DEV MODE ACTIVE ★", xPos, yPos);
    text("[0] ON/OFF | Mouse Click: Teleport", xPos, yPos + 15);
    text("[ ] ] Next Level | [ [ ] Prev Lvl", xPos, yPos + 30);

    // Koordinat Player (FOR LEVEL DESIGNING)
    fill(255,255,0);
    text("POS X: "+ Math.floor(rin.x) + " Y: " + Math.floor(rin.y), xPos, yPos + 45);
    pop();
  }
}

function keyPressed() {
  if(getAudioContext().state !== 'running') { userStartAudio(); }
  if (key === 'f' || key === 'F') { let fs = fullscreen(); fullscreen(!fs); }
  //! DEV MODE FEATURES
  if (key === '0') {
    devMode = !devMode; // Toggle Hidup/Mati
    console.log("Dev Mode:", devMode);
  }
  if (devMode && (gameState === "PLAY" || gameState === "LEVEL_COMPLETE")) {
    // TOMBOL "]" (NEXT)
    if (key === ']') {
      nextLevel();
      gameState = "PLAY";
    }
    // TOMBOL "[" (PREVIOUS)
    if (key === '[') {
      if (currentLevel > 0) {
        currentLevel--;
        startLevel(currentLevel);
        deathCount = 0;
      }
    }
  }
  if (gameState === "MENU") {
    if (key === '1') difficulty = 0; if (key === '2') difficulty = 1; if (key === '3') difficulty = 2;
    if (keyCode === ENTER) { currentLevel = 0; checkCutscene(); }
    return;
  }
  if (gameState === "ABOUT") {
    if (keyCode === ESCAPE) gameState = "MENU";
    return;
  }
  if (gameState === "GAMEOVER") {
    if (key === 'r' || key === 'R') { gameState = "PLAY"; startLevel(currentLevel); }
    if (key === 'q' || key === 'Q') { gameState = "MENU"; if(bgMusic) bgMusic.stop(); currentLevel = 0; }
    if ((key === 'e' || key === 'E') && deathCount > 5) { 
        difficulty = 0; deathCount = 0; gameState = "PLAY"; startLevel(currentLevel); 
    }
    return;
  }
  if (gameState === "CUTSCENE" || gameState === "CREDITS") {
    if (key === ' ') { 
        if(gameState==="CREDITS") gameState="MENU"; 
        else { gameState = "PLAY"; startLevel(currentLevel); }
    }
    return;
  }
  if (gameState === "LEVEL_COMPLETE") {
    if (keyCode === ENTER) {
        nextLevel();
    }
    return;
  }
  if (key === ' ') rin.jump();
}
//! FITUR KHUSUS DEV
function mousePressed() {
  if (devMode && gameState === "PLAY") {
    let cameraY = 0;
    if (rin.y < 100) cameraY = 100 - rin.y;

    rin.x = mouseX;
    rin.y = mouseY - cameraY;
    rin.vx = 0;
    rin.vy = 0;
  }
}

function gameOver() {
    gameState = "GAMEOVER";
    deathCount++;
}

function nextLevel() {
  currentLevel++;
  deathCount = 0;
  if (currentLevel >= levelData.length) { gameState = "CREDITS"; creditY = 400; }
  else checkCutscene();
}
function resetLevel() { startLevel(currentLevel); }
function checkCutscene() {
  let scene = cutsceneData.find(c => c.triggerLevel === currentLevel);
  if (scene) { gameState = "CUTSCENE"; activeCutscene = scene; } else { gameState = "PLAY"; startLevel(currentLevel); }
}

function startLevel(idx) {
  if (idx >= levelData.length) return;
  let data = levelData[idx];
  let diffMult = difficulty === 0 ? 0.7 : difficulty === 2 ? 1.8 : 1; 
  let windMult = difficulty === 0 ? 0.5 : difficulty === 2 ? 1.5 : 1; 
  let platShrink = difficulty === 0 ? -20 : difficulty === 2 ? 20 : 0; 

  items = []; if (data.items) for (let i of data.items) items.push(new Item(i[0], i[1], i[2]));
  drones = []; if (data.drones) for (let d of data.drones) drones.push(new Drone(d[0], d[1], d[2], d[3] * diffMult));
  goal = new Goal(data.goal.x, data.goal.y);
  bgParams = { c1: data.bg[0], c2: data.bg[1] };
  windForce = (data.wind || 0) * windMult;
  rin.reset(data.startX, data.startY);
  platforms = [];
  for (let p of data.platforms) {
      let w = Math.max(20, p[2] - platShrink);
      platforms.push(new Platform(p[0], p[1], w, p[3], p[4], p[5], p[6], p[7]));
  }
  aero = new NPC(data.npc.x, data.npc.y, data.npc.msg);
  particles = []; 
}

// --- VISUAL HELPERS ---
function drawGradient(c1, c2) {
  for (let y = 0; y <= height; y+=4) { 
    let inter = map(y, 0, height, 0, 1);
    fill(lerpColor(color(c1), color(c2), inter));
    rect(0, y, width, 4);
  }
}
function drawEffects() {
  if (windForce !== 0) {
    fill(255, 100);
    for(let i=0; i<5; i++) {
       let rx = (frameCount * 10 + i * 100) % width; 
       let ry = (i * 100) % height;
       rect(rx, ry, 50, 2); 
    }
  }
}
function drawOverlayScreen() {
    // 1. LAYAR CREDIT (ANIMASI NAIK)
    if (gameState === "CREDITS") {
       background(0); 
       fill(255); 
       noStroke(); 
       textAlign(CENTER);
       
       let y = creditY; // Ambil posisi Y yang sedang berjalan
       
       // Judul Besar
       textSize(30); 
       textStyle(BOLD); 
       fill(255, 215, 0); 
       text("MISSION COMPLETE", width/2, y); y += 60;
       
       // Cerita Penutup
       textSize(16); textStyle(NORMAL); fill(255);
       text("Rin berhasil mencapai puncak Menara Zenith.", width/2, y); y += 30;
       text("'Selamat datang, kurir sejati Verdantia.'", width/2, y); y += 80;
       
       // Judul Game
       textSize(20); textStyle(BOLD); 
       text("RIN: SKY COURIER", width/2, y); y += 40;
       
       // Nama Kamu
       textSize(14); textStyle(NORMAL); fill(200); 
       text("Game Design & Programming", width/2, y); y += 20;
       fill(255); text("RAFII RAHMADIANSYAH", width/2, y); y += 60;
       
       // Special Thanks
       fill(200); text("Special Thanks", width/2, y); y += 20;
       fill(255); text("Teman-teman (Tester)", width/2, y); y += 80;
       
       fill(255, 255, 0); 
       text("TERIMA KASIH SUDAH BERMAIN!", width/2, y);
       
       // LOGIKA GERAK (NAIK KE ATAS)
       creditY -= 1; // Kecepatan naik (makin besar makin cepat)
       
       // Instruksi Reset (Muncul statis di bawah jika teks sudah naik)
       if (creditY < 100) { 
           fill(255); textSize(12); 
           text("[ TEKAN SPASI UNTUK KEMBALI KE MENU ]", width/2, height - 30);
       }
       return;
    }
    if (activeCutscene) {
       let c = activeCutscene.color;
       background(c[0] * 0.3, c[1] * 0.3, c[2] * 0.3);
       fill(0, 150); rect(50, 50, 700, 300, 20);
       fill(255); textAlign(CENTER); textSize(24); textStyle(BOLD);
       text(activeCutscene.title, width/2, 100);
       textSize(16); textStyle(NORMAL);
       text(activeCutscene.story, 100, 150, 600, 200);
       if (frameCount % 60 < 30) { textSize(12); text("- TEKAN SPASI -", width/2, 320); }
    }
}

function playSfx(type) {
  if (getAudioContext().state !== 'running') return;

  osc.start();
  if (type === 'jump') {
    osc.setType('square');
    osc.freq(600, 0.1);
    env.play(osc, 0, 0.1);
  }
  else if (type === 'step'){
    osc.setType('sawtooth');
    osc.freq(150);
    env.setADSR(0.005, 0.05, 0, 0);
    env.play(osc, 0, 0.05);
  }
  else if (type === 'powerup') {
    osc.setType('sine');
    osc.freq(800);
    osc.freq(1200, 0.2);
    env.setADSR(0.01, 0.2, 0, 0.2);
    env.play(osc, 0, 0.1);
  }
}

// --- CLASSES (RETRO STYLE) ---
class Player {
  constructor() { this.w = 30; this.h = 50; this.reset(0,0); }
  reset(x, y) {
    this.x = x; this.y = y; this.vx = 0; this.vy = 0;
    this.baseSpeed = 5; this.currentSpeed = 5;
    this.onGround = false; this.powerType = 0; this.powerTimer = 0; this.jumpCount = 0;
  }
  activatePower(type) { this.powerType = type; this.powerTimer = 300; }
  update() {
    if (this.powerTimer > 0) this.powerTimer--; else this.powerType = 0;
    this.currentSpeed = (this.powerType === 1) ? 9 : 5; 
    let heavy = (this.powerType === 2);
    let effWind = heavy ? 0 : windForce;
    this.x += effWind;
    if (keyIsDown(LEFT_ARROW)) { this.vx = -this.currentSpeed; }
    else if (keyIsDown(RIGHT_ARROW)) { this.vx = this.currentSpeed; }
    else this.vx = 0;
    this.x += this.vx; this.y += this.vy; this.vy += gravity * (heavy ? 1.5 : 1); 
    if (this.vy > 12) this.vy = 12;
    if (this.onGround && Math.abs(this.vx) > 0 && frameCount % 5 === 0) particles.push(new Particle(this.x, this.y+50, 0));
    this.onGround = false;
    for (let p of platforms) {
      if (p.solid && this.y + this.h >= p.y && this.y + this.h <= p.y + 30 && this.x + this.w > p.x && this.x < p.x + p.w) {
        if (this.vy > 0) {
          this.y = p.y - this.h; this.vy = 0; this.onGround = true; this.jumpCount = 0;
          this.x += p.sx; this.y += p.sy;
          if(this.vy > 5) for(let i=0;i<5;i++) particles.push(new Particle(this.x+15, this.y+50, 0));
        }
      }
    }
    if (this.x < 0) this.x = 0; if (this.x > width) this.x = width;
  }
  jump() {
    if (this.onGround) { this.vy = -12; this.onGround = false; this.jumpCount = 1; }
    else if (this.powerType === 3 && this.jumpCount < 2) { 
        this.vy = -12; this.jumpCount++; 
        for(let i=0;i<5;i++) particles.push(new Particle(this.x+15, this.y+50, 2)); 
    }
    playSfx('jump');
  }
  show() {
    if (this.powerTimer > 0) {
      noStroke();
      if (this.powerType === 1) fill(0, 255, 255, 100); 
      if (this.powerType === 2) fill(100, 100, 100, 100); 
      if (this.powerType === 3) fill(255, 255, 200, 100); 
      ellipse(this.x + this.w/2, this.y + this.h/2, 60, 60);
    }
    let facing = (this.vx >= 0) ? 1 : -1; // Untuk mengecek hadap kanan atau kiri
    push ();
    translate(this.x + this.w/2, this.y + this.h/2);
    scale(facing, 1); // Balik gambar jika menghadap ke kiri(?)
    // 1. Syal
    fill (255, 200, 0); // Warna syal
    let scarfWag = sin(frameCount * 0.5) * 5;
    rect(-15, -10, -20, 8); // Bagian belakang syal
    rect(-35, -8 + scarfWag, 20, 8); // Ujung syal akan melambai

    // 2. Badan
    fill (50, 50, 150); //Berbaju biru
    rect (-10, -10, 20, 30);

    // 3. Kepala
    fill (255, 220, 200);
    rect (-10, -25, 20, 20);

    //4. Mata
    fill (0);
    if(this.vx !== 0) {
      rect(2, -20, 4, 4); // Mata lihat depan
    } else {
      rect(2, -20, 4, 2); // Mata kedip/santai
    }

    // 5. Kaki (Animasi berjalan)
    fill(20);
    if (this.onGround && Math.abs(this.vx) > 0) {
      if (frameCount % 10 < 5) {
        rect(-10, 20, 8, 10); // Kaki kiri
      } else {
        rect(2, 20, 8, 10); // Kaki Kanan
      }
      // SFX Langkah Kaki
      if (frameCount % 15 === 0) playSfx('step');
    } else {
      rect (-10, 20, 8, 10);
      rect (2, 15, 8, 10); // Saat lompat
    }
    pop();
    // fill(255, 80, 80); rect(this.x, this.y, this.w, this.h);
    // fill(255); 
    // if(this.vx < 0) { rect(this.x+4, this.y+10, 8, 8); } 
    // else { rect(this.x+18, this.y+10, 8, 8); } 
    // fill(255); rect(this.x-5, this.y+20, 10, 10);
  }
}

class Platform {
  constructor(x, y, w, h, sx, sy, range, type) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.startX = x; this.startY = y;
    this.sx = sx || 0; this.sy = sy || 0; this.range = range || 0;
    this.type = type || 0; this.solid = true;
  }
  update() {
    if (this.range > 0) {
      this.x += this.sx; this.y += this.sy;
      if (dist(this.x, this.y, this.startX, this.startY) > this.range) { this.sx *= -1; this.sy *= -1; }
    }
    if (this.type === 1) { 
      let timer = frameCount % 180; 
      if (timer < 120) this.solid = true; else this.solid = false;
    } else this.solid = true;
  }
  show() {
    if (this.type === 1) { 
      if (this.solid) fill(255, 200); else fill(255, 30); 
    } else { 
      fill(100, 200, 100); 
      if (this.range > 0) fill(100, 150, 255); 
    }
    rect(this.x, this.y, this.w, this.h);
    if(this.solid) {
        fill(255, 50); rect(this.x, this.y, this.w, 4); 
        fill(0, 50); rect(this.x, this.y+this.h-4, this.w, 4); 
    }
  }
}

class Item {
  constructor(x, y, type) { this.x = x; this.y = y; this.type = type; this.w = 30; this.h = 30; this.active = true; }
  show() {
    if (!this.active && this.type !== 0) return;
    let dy = this.y + sin(frameCount*0.1)*5;
    if (this.type === 0) { 
      fill(255, 215, 0); rect(this.x, this.y + 20, 40, 10); 
    } else {
      push(); translate(this.x+15, dy+15); rotate(QUARTER_PI);
      if (this.type === 1) fill(0, 191, 255); 
      if (this.type === 2) fill(100); 
      if (this.type === 3) fill(255); 
      rect(-10, -10, 20, 20);
      pop();
    }
  }
  checkCollision(p) {
    if (!this.active && this.type !== 0) return;
    if(p.x < this.x + this.w && p.x + p.w > this.x && p.y < this.y + this.h && p.y + p.h > this.y) {
        if (this.type === 0) { 
          if (p.vy >= 0) { 
            p.vy = -20; 
            p.onGround = false; 
            p.y -= 2; playSfx('jump'); 
          } 
        }
        else { 
        p.activatePower(this.type); 
        this.active = false; 
        playSfx('powerup'); 
      }
    }
  }
}

class Particle {
    constructor(x, y, type) { 
        this.x = x; this.y = y; this.type = type || 0;
        this.vx = random(-1, 1); this.vy = random(-1, -0.5);
        this.size = random(4,8); this.alpha = 255;
    }
    update() {
        this.x += this.vx; this.y += this.vy; this.alpha -= 10;
        if(this.type===1) { this.y -= 1; this.alpha += 5; if(this.y < 0) this.y = height; } 
    }
    show() {
        if(this.type===1) fill(255, 215, 0, 150);
        else fill(255, this.alpha);
        rect(this.x, this.y, this.size, this.size);
    }
    finished() { return this.alpha < 0 && this.type !== 1; }
}

class Drone {
  constructor(x, y, range, speed) { this.x = x; this.y = y; this.w = 30; this.h = 30; this.startX = x; this.range = range; this.speed = speed; this.active = true; }
  update() { this.x += this.speed; if (dist(this.x, this.y, this.startX, this.y) > this.range) { this.speed *= -1; } }
  show() {
    if (!this.active) return;
    fill(200, 50, 50); rect(this.x, this.y, this.w, this.h); 
    fill(255, 255, 0); 
    rect(this.x + 10, this.y + 10, 10, 10);
  }
  checkCollision(p) {
    if (!this.active) return;
    if (p.x + p.w > this.x && p.x < this.x + this.w && p.y + p.h > this.y && p.y < this.y + this.h) { gameOver(); }
  }
}

class Goal {
  constructor(x, y) { this.x = x; this.y = y; this.w = 40; this.h = 40; }
  show() { fill(200, 50, 200); rect(this.x, this.y, this.w, this.h); fill(255); textSize(10); text("BOX", this.x+10, this.y+25); }
  checkReach(p) { return (p.x < this.x+this.w && p.x+p.w > this.x && p.y < this.y+this.h && p.y+p.h > this.y); }
}

class NPC {
  constructor(x, y, msg) { this.x = x; this.y = y; this.msg = msg; }
  
  show() { 
    // Logika Gambar Aero (Instruktur Senior)
    push();
    translate(this.x, this.y);
    
    // 1. Badan (Seragam Hijau Tua - Senior)
    fill(34, 139, 34); 
    rect(0, 0, 30, 45);

    // 2. Kepala
    fill(200, 150, 120); // Kulit
    rect(2, -15, 26, 15);

    // 3. Rambut/Topi (Abu-abu)
    fill(80); 
    rect(0, -20, 30, 8);

    // 4. Kacamata Goggles (Ciri khas pilot angin)
    fill(50, 50, 50); 
    rect(2, -10, 26, 6);
    fill(0, 255, 255); // Kaca biru
    rect(5, -8, 8, 2); rect(17, -8, 8, 2);

    // 5. Tangan bersedekap
    fill(20, 100, 20);
    rect(-5, 10, 5, 20); // Tangan kiri
    rect(30, 10, 5, 20); // Tangan kanan
    
    pop();
    // (Hitbox visual debug opsional dihapus biar bersih)
  }
  checkTalk(p) {
    if (dist(this.x, this.y, p.x, p.y) < 100) {
        // Kotak Dialog
        fill(255); stroke(0); strokeWeight(2);
        rect(this.x - 80, this.y - 100, 180, 70, 10);
        noStroke();
        
        // Segitiga penunjuk
        fill(255);
        triangle(this.x, this.y - 32, this.x - 10, this.y - 15, this.x + 10, this.y - 32);

        // Teks
        fill(0); textSize(11); textStyle(NORMAL); textAlign(CENTER);
        text(this.msg, this.x - 70, this.y - 90, 160, 60);
    }
  }
}

class Cloud {
  constructor() {
    this.x = random(width);
    this.y = random(50, 250);
    this.size = random(30, 60);
    this.speed = random(0.2, 0.8);
  }
  update() {
    this.x -= this.speed;
    if (this.x < -100){
      this.x = width + 50;
      this.y = random(50, 250);
    }
  }
  show() {
    noStroke();
    // WARNA AWAN BERUBAH SESUAI ACT
    if (currentLevel >= 5 && currentLevel < 10) {
        fill(80, 80, 90, 200); // Abu-abu gelap (Mendung)
    } else if (currentLevel >= 10) {
        fill(255, 220, 150, 150); // Keemasan pudar (Zenith)
    } else {
        fill(255, 255, 255, 180); // Putih (Normal)
    }
    // Gambar Awan
    ellipse(this.x, this.y, this.size, this.size * 0.6);
    ellipse(this.x - 15, this.y + 5, this.size * 0.7, this.size * 0.5);
    ellipse(this.x + 15, this.y + 5, this.size * 0.7, this.size * 0.5);
  }
}