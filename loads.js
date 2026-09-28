// ===================== LOADS.JS =====================
// 1) Lista de invitados
const guests = [
  { id: 1, name: "Claudia Barrios", passes: 1 },
  { id: 2, name: "Rodolfo Chacón", passes: 1 },
  { id: 3, name: "Ismael Barrios", passes: 1 },
  { id: 4, name: "Jorge Chacón", passes: 1 },
  { id: 5, name: "José Chacón", passes: 1 },
  { id: 6, name: "Florinda Laroj", passes: 1 },
  { id: 7, name: "Diego Laroj", passes: 1 },
  { id: 8, name: "Cristopher Laroj", passes: 1 },
  { id: 9, name: "Rocxana Barrios", passes: 1 },
  { id: 10, name: "Lorena Alonso", passes: 1 },
  { id: 11, name: "Maritza Aleman", passes: 1 },
  { id: 12, name: "Cesar Castellanos", passes: 1 },
  { id: 13, name: "Alejandra Castellanos", passes: 1 },
  { id: 14, name: "Sonia Aleman", passes: 1 },
  { id: 15, name: "Arnoldo Aleman", passes: 1 },
  { id: 16, name: "Enrique Aleman", passes: 1 },
  { id: 17, name: "Victor Castellanos", passes: 1 },
  { id: 18, name: "Estuardo Alemán", passes: 1 },
  { id: 19, name: "Pablo de La Roca", passes: 1 },
  { id: 20, name: "Fernando Oroxom y Regina Cruz", passes: 2 },
  { id: 21, name: "Enrique Colindres y Andrea Borrayo", passes: 2 },
  { id: 22, name: "César Cetino y Andrea Aldana", passes: 2 },
  { id: 23, name: "Hector Calderón", passes: 1 },
  { id: 24, name: "Julio Guerrero", passes: 1 },
  { id: 25, name: "Ingrid Donis", passes: 1 },
  { id: 26, name: "Idania Paredes y Erick Villa", passes: 2 },
  { id: 27, name: "Elizabeth Fuentes y Carlos Flores", passes: 2 },
  { id: 28, name: "Andrés Rodas", passes: 1 },
  { id: 29, name: "Otto Castillo", passes: 1 },
  { id: 30, name: "Andrea Espinoza", passes: 1 },
  { id: 31, name: "Patricia Ruiz", passes: 1 },
  { id: 32, name: "Rodolfo Mazariegos", passes: 1 },
  { id: 33, name: "Rodrigo Mazariegos y Laura Rodríguez", passes: 2 },
  { id: 34, name: "Alicia Sánchez", passes: 1 },
  { id: 35, name: "Nery Hurtarte y Julia de Hurtarte", passes: 2 },
  { id: 36, name: "Dalila Luis", passes: 1 },
  { id: 37, name: "Roberto Samayoa y Magdalena Chacón", passes: 2 },
  { id: 38, name: "Marlon Virula y Tania Valencia", passes: 2 },
  { id: 39, name: "Cilia Castellanos", passes: 1 },
  { id: 40, name: "Manuel Ramírez", passes: 1 },
  { id: 41, name: "José Javier Reyes", passes: 1 },
  { id: 42, name: "Jacqueline Ovando", passes: 1 },
  { id: 43, name: "Isabel Ramón", passes: 1 },
  { id: 44, name: "Maritza Ovalle", passes: 1 },
  { id: 45, name: "Belén Rodríguez", passes: 1 },
  { id: 46, name: "Carlos Rodríguez", passes: 1 },
  { id: 47, name: "Luis Pedro Say", passes: 1 },
  { id: 48, name: "Abel Bojórquez", passes: 2 },
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
