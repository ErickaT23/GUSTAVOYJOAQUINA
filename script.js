// ===================== SCRIPT.JS (MODELO EDITORIAL) =====================
// ⚠️ IMPORTANTE: NO usar "$" porque rsvp.js ya lo usa.
// Usamos "$$" para evitar conflicto.
const $$ = (s) => document.querySelector(s);

document.addEventListener("DOMContentLoaded", () => {
  // 1) Pintar invitado en portada (desde loads.js)
  paintGuestCard();
  window.addEventListener("guest:updated", paintGuestCard);

  // 2) Botón abrir invitación
  initMusicPlayer();
  initWeddingPhotosQr();
  initGiftModal();

  const btnOpenInvite = $$("#btnOpenInvite");
  if (btnOpenInvite) {
    btnOpenInvite.addEventListener("click", openInvitation);
  }

  const btnOpenEnvelope = $$("#btnOpenEnvelope");
  if (btnOpenEnvelope) {
    btnOpenEnvelope.addEventListener("click", openInvitation);
  }

  // 3) Animaciones al hacer scroll
  initScrollReveal();

  initGoldReveal();

  // 4) Contador para la fecha confirmada
  initFlipCountdown("2026-12-12T10:00:00-06:00");

  // 5) Foto separador rotativa (si existe el elemento)
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    initRotatingSep([
      "images/H2.webp",
      "images/V4.webp",
    ]);
  }
});

function initGiftModal() {
  const backdrop = document.getElementById("giftModalBackdrop");
  const openButton = document.getElementById("btnOpenGiftModal");
  const closeButton = document.getElementById("btnCloseGiftModal");
  if (!backdrop || !openButton || !closeButton) return;

  const close = () => {
    backdrop.classList.remove("is-open");
    window.setTimeout(() => {
      backdrop.style.display = "none";
      backdrop.setAttribute("aria-hidden", "true");
      openButton.focus();
    }, 260);
  };

  openButton.addEventListener("click", () => {
    backdrop.style.display = "flex";
    backdrop.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => backdrop.classList.add("is-open"));
    closeButton.focus();
  });
  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) close();
  });
  backdrop.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function initWeddingPhotosQr() {
  const container = document.getElementById("weddingPhotosQr");
  const link = document.getElementById("weddingPhotosLink");
  if (!container || !link || link.getAttribute("aria-disabled") === "true" || typeof window.QRCode === "undefined") return;

  container.replaceChildren();
  new window.QRCode(container, {
    text: link.href,
    width: 180,
    height: 180,
    colorDark: "#2b518f",
    colorLight: "#ffffff",
    correctLevel: window.QRCode.CorrectLevel.M,
  });
}

/* ===================== INVITADO EN PORTADA ===================== */
function paintGuestCard() {
  const nameEl = $$("#guestCardName");
  const seatsEl = $$("#guestCardSeats");
  const seatsTxtEl = $$("#guestCardSeatsTxt");

  // Si no existen (por si aún no pegaste el HTML), no rompe
  if (!nameEl || !seatsEl) return;

  const g = window.currentGuest;

  if (g && g.name) {
    nameEl.textContent = g.name;
    const p = Number(g.passes || 1);
    seatsEl.textContent = String(p);
    if (seatsTxtEl) seatsTxtEl.textContent = p === 1 ? "lugar" : "lugares";
  } else {
    // Si entraste sin ?id=
    nameEl.textContent = "Nombre del invitado";
    seatsEl.textContent = "x";
    if (seatsTxtEl) seatsTxtEl.textContent = "lugares";
  }
}

/* ===================== ABRIR INVITACIÓN ===================== */
function openInvitation() {
  const cover = $$("#cover");
  const main = $$("#invitation");

  if (!cover || !main) return;

  playWeddingMusic();

  // Ocultar portada con animación
  cover.classList.add("is-hidden");

  setTimeout(async () => {
    cover.style.display = "none";

    // Mostrar invitación
    main.classList.add("is-open");
    main.setAttribute("aria-hidden", "false");

    // Scroll suave al hero
    setTimeout(() => {
      $$("#hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

  }, 600);
}

/* ===================== MÚSICA ===================== */
function initMusicPlayer() {
  const audio = $$("#weddingMusic");
  const bubble = $$("#musicBubble");
  if (!audio || !bubble) return;

  audio.loop = true;

  bubble.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        setMusicBubbleState(true);
      } catch {
        setMusicBubbleState(false);
      }
      return;
    }

    audio.pause();
    setMusicBubbleState(false);
  });
}

async function playWeddingMusic() {
  const audio = $$("#weddingMusic");
  const bubble = $$("#musicBubble");
  if (!audio || !bubble) return;

  bubble.hidden = false;

  try {
    await audio.play();
    setMusicBubbleState(true);
  } catch {
    setMusicBubbleState(false);
  }
}

function setMusicBubbleState(isPlaying) {
  const bubble = $$("#musicBubble");
  if (!bubble) return;

  bubble.classList.toggle("is-playing", isPlaying);
  bubble.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
  bubble.setAttribute("aria-pressed", String(isPlaying));
  bubble.innerHTML = `<i class="fa-solid ${isPlaying ? "fa-pause" : "fa-play"}" aria-hidden="true"></i>`;
}

/* ===================== REVEAL AL SCROLL ===================== */
function initScrollReveal() {
  const els = document.querySelectorAll(".fade-in-element");
  if (!els || els.length === 0) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => obs.observe(el));
}

/* ================= Animar True Love ================= */
function initGoldReveal() {
  const el = document.querySelector(".reveal-gold");
  if (!el) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.5 }
  );

  obs.observe(el);
}

/* ===================== CONTADOR ===================== */
function initCountdown(targetISO) {
  const dEl = $$("#cdDays");
  const hEl = $$("#cdHours");
  const mEl = $$("#cdMins");
  const sEl = $$("#cdSecs");
  if (!dEl || !hEl || !mEl || !sEl) return;

  const target = new Date(targetISO).getTime();
  const pad2 = (n) => String(n).padStart(2, "0");

  const tick = () => {
    const now = Date.now();
    let diff = target - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    dEl.textContent = pad2(days);
    hEl.textContent = pad2(hours);
    mEl.textContent = pad2(mins);
    sEl.textContent = pad2(secs);
  };

  tick();
  setInterval(tick, 1000);
}

/* ===================== SEPARADOR ROTATIVO ===================== */
function initRotatingSep(images){

  const imgEl = document.getElementById("rotatingSepImg");
  const nextImgEl = document.getElementById("rotatingSepImgNext");
  if(!imgEl || !nextImgEl || !images || images.length === 0) return;

  let currentIndex = 0;
  let activeImg = imgEl;
  let hiddenImg = nextImgEl;

  function changeImage(){
    const nextIndex = (currentIndex + 1) % images.length;
    const nextImage = new Image();

    nextImage.onload = () => {
      hiddenImg.src = nextImage.src;
      hiddenImg.style.opacity = 1;
      activeImg.style.opacity = 0;
      currentIndex = nextIndex;

      const previousActive = activeImg;
      activeImg = hiddenImg;
      hiddenImg = previousActive;
    };

    nextImage.src = images[nextIndex];

  }

  setInterval(changeImage, 5000);
}

//contador
function initFlipCountdown(targetISO){
  const target = new Date(targetISO).getTime();
  const pad2 = (n) => String(n).padStart(2, "0");

  const setFlip = (flipEl, newValue) => {
    if (!flipEl) return;

    const top = flipEl.querySelector(".top .digit");
    const bottom = flipEl.querySelector(".bottom .digit");
    const topFlip = flipEl.querySelector(".top-flip .digit");
    const bottomFlip = flipEl.querySelector(".bottom-flip .digit");

    const current = top?.textContent ?? "00";
    if (current === newValue) return;

    topFlip.textContent = current;
    bottomFlip.textContent = newValue;

    bottom.textContent = newValue;

    flipEl.classList.add("is-flipping");

    setTimeout(() => { top.textContent = newValue; }, 650);
    setTimeout(() => { flipEl.classList.remove("is-flipping"); }, 1300);
  };

  const flipDays = document.getElementById("flipDays");
  const flipHours = document.getElementById("flipHours");
  const flipMins = document.getElementById("flipMins");
  const flipSecs = document.getElementById("flipSecs");

  const initVal = (el, v) => {
    if (!el) return;
    el.querySelector(".top .digit").textContent = v;
    el.querySelector(".bottom .digit").textContent = v;
    el.querySelector(".top-flip .digit").textContent = v;
    el.querySelector(".bottom-flip .digit").textContent = v;
  };

  initVal(flipDays, "00");
  initVal(flipHours, "00");
  initVal(flipMins, "00");
  initVal(flipSecs, "00");

  const tick = () => {
    const now = Date.now();
    let diff = target - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    setFlip(flipDays, pad2(days));
    setFlip(flipHours, pad2(hours));
    setFlip(flipMins, pad2(mins));
    setFlip(flipSecs, pad2(secs));
  };

  tick();
  setInterval(tick, 1000);
}

//animaciones
// ================= ANIMACIONES POR SECCIÓN (AUTO) =================
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  if (!("IntersectionObserver" in window)) {
    sections.forEach((s) => s.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });

  sections.forEach((s) => io.observe(s));
});
