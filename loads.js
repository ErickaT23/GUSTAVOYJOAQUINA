// ===================== LOADS.JS =====================
// 1) Lista de invitados
const guests = [
  { id: 1, name: "Ana Martinez", passes: 2 },
  { id: 2, name: "Carlos Ramirez", passes: 1 },
  { id: 3, name: "Laura Hernandez", passes: 3 },
  { id: 4, name: "Diego Morales", passes: 2 },
  { id: 5, name: "Sofia Castillo", passes: 4 },
];

window.guests = guests;
window.LocalGuestSeeds = {
  ...(window.LocalGuestSeeds || {}),
  "joaquina-gustavo-2026": guests.reduce((acc, guest) => {
    acc[String(guest.id)] = {
      id: String(guest.id),
      nombre: guest.name,
      pases: Number(guest.passes || 1),
      activo: true,
    };
    return acc;
  }, {}),
};

window.seedEventGuestsToFirebase = async function seedEventGuestsToFirebase() {
  const eventId = window.config?.event?.defaultEventId || "joaquina-gustavo-2026";
  const rsvpDB = window.RSVPDatabase;
  if (!rsvpDB?.seedEventData) {
    console.warn("RSVPDatabase no está disponible. Revisa que database.js esté cargado.");
    return { ok: false, guests: 0 };
  }

  const result = await rsvpDB.seedEventData(eventId, { force: true });
  console.log(`Evento creado en Firebase con ${result.invitadosSeeded || 0} invitados.`);
  return { ok: true, guests: result.invitadosSeeded || 0, eventId };
};

// Helper: leer parámetros ?id=1
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function notifyGuestUpdated() {
  window.dispatchEvent(new CustomEvent("guest:updated", { detail: window.currentGuest || null }));
}

function setCurrentGuest(guest) {
  if (!guest) {
    window.currentGuest = null;
    notifyGuestUpdated();
    return;
  }

  window.currentGuest = {
    id: String(guest.id),
    name: String(guest.name || guest.nombre || "Invitado").trim() || "Invitado",
    passes: Math.max(1, Number(guest.passes || guest.pases) || 1),
  };

  const guestNameEl = document.getElementById("guest-name");
  const passesEl = document.getElementById("passes");

  if (guestNameEl) guestNameEl.textContent = window.currentGuest.name;
  if (passesEl) {
    const p = Number(window.currentGuest.passes || 1);
    passesEl.textContent = `${p} ${p === 1 ? "pase" : "pases"}`;
  }

  notifyGuestUpdated();
}

function waitForRSVPDatabase(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = window.setInterval(() => {
      if (window.RSVPDatabase?.getInvitadoById) {
        window.clearInterval(timer);
        resolve(window.RSVPDatabase);
        return;
      }

      if (Date.now() - start > timeoutMs) {
        window.clearInterval(timer);
        reject(new Error("RSVPDatabase no disponible."));
      }
    }, 50);
  });
}

async function loadRemoteGuest(guestId) {
  try {
    const db = await waitForRSVPDatabase();
    const eventId = window.config?.event?.defaultEventId || "joaquina-gustavo-2026";
    const remoteGuest = await db.getInvitadoById(eventId, guestId);
    if (remoteGuest && remoteGuest.activo !== false) {
      setCurrentGuest(remoteGuest);
    }
  } catch (error) {
    console.warn("No se pudo cargar invitado remoto:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const guestId = getQueryParam("id");

  if (getQueryParam("seedGuests") === "1") {
    window.seedEventGuestsToFirebase();
  }

  // Si no hay id, no marcamos error: solo no hay invitado
  if (!guestId) {
    setCurrentGuest(null);
    return;
  }

  const guest = guests.find((g) => String(g.id) === String(guestId));

  if (guest) {
    setCurrentGuest(guest);
    loadRemoteGuest(guestId);
  } else {
    setCurrentGuest(null);
    loadRemoteGuest(guestId);

    const guestNameEl = document.getElementById("guest-name");
    if (guestNameEl) guestNameEl.textContent = "Invitado no encontrado";
  }

});
