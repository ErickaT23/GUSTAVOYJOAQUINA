const config = {
    event: {
        defaultEventId: "joaquina-gustavo-2026",
        eventIdParam: "eventId",
        legacyFallback: {
            read: false,
            write: false,
            subscribe: false
        }
    },

    admin: {
        adminKey: "twodesign123",
        keyParam: "key",
        legacyKeyParam: "admin"
    },

    seo: {
        titulo: "Joaquina & Gustavo | Nuestra boda",
        descripcion: "Invitación de boda de Joaquina y Gustavo",
        autor: "Two Design"
    },

    pareja: {
        nombres: "Joaquina & Gustavo",
        fecha: "12-12-2026",
        fechaVisible: "12.12.2026"
    },

    musica: {
        titulo: "Nuestra Canción",
        archivo: "music.mp3"
    },

    evento: {
        ceremonia: {
            titulo: "Ceremonia",
            lugar: "Escuela de Cristo",
            hora: "10:00 a.m.",
            direccion: "Calle de los Pasos y Calle de Fray Rodrigo de la Cruz, Antigua, Sacatepéquez",
            ubicacionUrl: "https://waze.com/ul/h9fx6z2uqy"
        },
        recepcion: {
            titulo: "Recepción",
            lugar: "Jardín de Eventos Santa Inés",
            hora: "Hora por confirmar",
            direccion: "Callejón La Cruz Casa 1, Aldea Santa Inés, Antigua Guatemala, Sacatepéquez",
            ubicacionUrl: ""
        }
    },

    textos: {
        mensajeInvitado: "Eres muy especial para nosotros",
        mensajePases: "Hemos reservado para ti {pases} lugares especiales"
    },

    footer: {
        hashtag: "#JoaquinaYGustavo",
        instagramUrl: "https://www.instagram.com/thetwodesign",
        facebookUrl: "https://www.facebook.com/thetwodesign",
        marcaTexto: "Diseño",
        marcaNombre: "Two Design",
        marcaUrl: "https://twodesign.com"
    }
};

window.config = config;
