const $ = (s) => document.querySelector(s);

function getGuest() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "guest";
  const data = window.currentGuest || null;
  return {
    id: String(data?.id || id),
    name: data?.name || "Invitado",
    passes: Math.max(1, Number(data?.passes || 1)),
  };
}

function keyFor(id) {
  return `rsvp_state_${id}`;
}

function setupResultModal() {
  const backdrop = document.getElementById("rsvpResultBackdrop");
  const textEl = document.getElementById("rsvpResultText");
  const btnClose = document.getElementById("btnCloseRsvpResult");
  const btnOk = document.getElementById("btnOkRsvpResult");
  let lastFocusedElement = null;

  const close = () => {
    if (!backdrop) return;
    backdrop.classList.remove("is-open");
    setTimeout(() => {
      backdrop.style.display = "none";
      backdrop.setAttribute("aria-hidden", "true");
      lastFocusedElement?.focus();
    }, 260);
  };

  if (btnClose) btnClose.addEventListener("click", close);
  if (btnOk) btnOk.addEventListener("click", close);
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    backdrop.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  return (text) => {
    if (!backdrop || !textEl) return;
    lastFocusedElement = document.activeElement;
    textEl.textContent = text;
    backdrop.style.display = "flex";
    backdrop.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => backdrop.classList.add("is-open"));
    btnOk?.focus();
  };
}

document.addEventListener("DOMContentLoaded", () => {
  let guest = getGuest();
  const eventId = window.config?.event?.defaultEventId || "joaquina-gustavo-2026";
  const inputName = $("#rsvpNombre");
  const selectGuests = $("#rsvpGuests");
  const guestsWrap = $("#rsvpGuestsWrap");
  const btnYes = $("#btnRsvpSi");
  const btnNo = $("#btnRsvpNo");
  const btnConfirm = $("#btnConfirmarRsvp");
  const msg = $("#msgRsvp");
  const intro = $("#rsvpSection .rsvp-strong");
  const actions = $("#rsvpInline .rsvp-actions");
  const inlineBlock = $("#rsvpInline");
  const showResult = setupResultModal();

  if (!inputName || !selectGuests || !guestsWrap || !btnYes || !btnNo || !btnConfirm || !msg || !intro) return;

  const renderGuestFields = () => {
    inputName.value = guest.name;
    selectGuests.innerHTML = "";
    for (let i = 1; i <= guest.passes; i += 1) {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = String(i);
      selectGuests.appendChild(option);
    }
  };

  renderGuestFields();

  window.addEventListener("guest:updated", () => {
    guest = getGuest();
    renderGuestFields();
  });

  let answer = null;

  const setActive = (type) => {
    btnYes.classList.toggle("is-active", type === "yes");
    btnNo.classList.toggle("is-active", type === "no");
    btnYes.setAttribute("aria-pressed", String(type === "yes"));
    btnNo.setAttribute("aria-pressed", String(type === "no"));
  };

  const paintConfirmed = (state) => {
    answer = state.answer;
    setActive(answer);
    guestsWrap.style.display = answer === "yes" ? "block" : "none";
    if (answer === "yes") {
      selectGuests.value = String(state.guests || 1);
    }
    btnYes.disabled = true;
    btnNo.disabled = true;
    btnConfirm.disabled = true;
    if (actions) actions.style.display = "none";
    btnConfirm.style.display = "none";
    guestsWrap.style.display = "none";
    if (inlineBlock) inlineBlock.style.display = "none";
    intro.textContent = "Gracias por completar el formulario de asistencia.";
    msg.style.display = "block";
    msg.className = "rsvp-msg ok";
    msg.textContent =
      answer === "yes"
        ? "Gracias por confirmar tu asistencia. Te vemos pronto."
        : "Lamentamos que no puedas acompañarnos. Te extrañaremos.";
  };

  const savedRaw = localStorage.getItem(keyFor(guest.id));
  if (savedRaw) {
    try {
      paintConfirmed(JSON.parse(savedRaw));
      return;
    } catch {
      localStorage.removeItem(keyFor(guest.id));
    }
  }

  btnYes.addEventListener("click", () => {
    answer = "yes";
    setActive("yes");
    guestsWrap.style.display = "block";
  });

  btnNo.addEventListener("click", () => {
    answer = "no";
    setActive("no");
    guestsWrap.style.display = "none";
  });

  btnConfirm.addEventListener("click", async () => {
    if (!answer) {
      msg.style.display = "block";
      msg.className = "rsvp-msg error";
      msg.textContent = "Por favor selecciona una opción para continuar.";
      return;
    }

    btnConfirm.disabled = true;

    const state = {
      eventId,
      guestId: guest.id,
      guestName: guest.name,
      assignedPasses: guest.passes,
      answer,
      guests: answer === "yes" ? Number(selectGuests.value || 1) : 0,
      at: Date.now(),
      atLocal: new Date().toISOString(),
    };
    try {
      const rsvpDB = window.RSVPDatabase;
      if (!rsvpDB?.saveConfirmation) throw new Error("RSVP_DATABASE_UNAVAILABLE");
      await rsvpDB.saveConfirmation(eventId, {
        id: guest.id,
        nombre: guest.name,
        pasesAsignados: guest.passes,
        respuesta: answer === "yes" ? "si" : "no",
        cantidadConfirmada: answer === "yes" ? Number(selectGuests.value || 1) : 0,
        fechaConfirmacion: Date.now(),
      });
      localStorage.setItem(keyFor(guest.id), JSON.stringify(state));
    } catch (error) {
      console.error(error);
      btnConfirm.disabled = false;
      msg.style.display = "block";
      msg.className = "rsvp-msg error";
      msg.textContent = error?.code === "RSVP_ALREADY_CONFIRMED"
        ? "Esta invitación ya fue confirmada anteriormente."
        : "No pudimos enviar tu confirmación. Verifica tu conexión e inténtalo de nuevo.";
      return;
    }

    const popupText =
      answer === "yes"
        ? "Gracias por confirmar tu asistencia. Te vemos pronto."
        : "Lamentamos que no puedas acompañarnos. Te extrañaremos.";

    showResult(popupText);
    paintConfirmed(state);
  });
});
