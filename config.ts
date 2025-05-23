import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  Firestore,
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);

// --- Constants ---
export const MY_NAME = 'Alfonso';
export const BIRTHDAY_DATE_TEXT = 'Sábado 31 de Mayo';
export const MY_EMAIL = import.meta.env.VITE_MY_EMAIL || '';
export const WEB_URL_PRODUCTION = import.meta.env.VITE_WEB_URL_PRODUCTION || '';
export const WEB_URL_FOR_EMAIL = import.meta.env.VITE_WEB_URL_FOR_EMAIL || 'http://localhost:3000';
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'supersecretpassword';

export const YOUTUBE_VIDEO_IDS = [
  'FGBhQbmPwH8', // One More Time - Daft Punk
  'PWgvGjAhvIw', // Hey Ya! - Outkast
  '79fzeNUqQbQ', // Like a Prayer - Madonna
  'GxBSyx85Kp8', // Yeah! - Usher ft. Lil Jon & Ludacris
  'H5v3kku4y6Q', // As It Was - Harry Styles
  'rblt2EtFfC4', // 1999 - Prince
];

export const PLACE_DINNER = {
  name: 'Bar Bless',
  schedule: 'Sábado 31 de Mayo, de 21:00 hs a 01:00 hs',
  mapsLink: 'https://maps.app.goo.gl/NZMi5fmaydSpDFAe8',
  mapButtonText: 'Ver ubicación de la Cena en Google Maps',
  instagramLink: 'https://www.instagram.com/bless.sgo',
  instagramButtonText: 'Visitar Instagram del Bar Bless',
};

export const PLACE_PARTY = {
  name: 'Boliche Club Meet',
  schedule: 'Domingo 1 de Junio, de 01:00 hs a 06:00 hs',
  mapsLink: 'https://maps.app.goo.gl/N4hoguoExeH9LbQb8',
  mapButtonText: 'Ver ubicación de la Fiesta en Google Maps',
  instagramLink: 'https://www.instagram.com/clubmeetoficial',
  instagramButtonText: 'Visitar Instagram del Club Meet',
};

// --- Types ---
export interface Guest {
  id?: string;
  name: string;
  lastname: string;
  email: string;
  diner: boolean;
  party: boolean;
  approved: boolean | null;
  createdAt?: Timestamp;
}

export interface PlaceDetails {
  name: string;
  schedule: string;
  mapsLink: string;
  mapButtonText: string;
  instagramLink: string;
  instagramButtonText: string;
}

// --- Firebase Firestore Service Functions ---
const guestsCollection = collection(db, 'guests');

export const addGuest = async (
  guestData: Omit<Guest, 'id' | 'createdAt' | 'approved'>
): Promise<string> => {
  // Verificar si el correo ya existe
  const emailQuery = query(guestsCollection, where('email', '==', guestData.email));
  const querySnapshot = await getDocs(emailQuery);

  if (!querySnapshot.empty) {
    throw new Error('El correo ya está registrado.');
  }

  // Agregar nuevo invitado si no existe
  const newGuest: Omit<Guest, 'id'> = {
    ...guestData,
    approved: null,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(guestsCollection, newGuest);
  return docRef.id;
};

export const getGuests = async (): Promise<Guest[]> => {
  const q = query(guestsCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Guest));
};

export const getGuestByEmail = async (email: string): Promise<Guest | null> => {
  const q = query(guestsCollection, where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  // Assuming email is unique
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Guest;
};

export const updateGuestApproval = async (id: string, approved: boolean | null): Promise<void> => {
  const guestDoc = doc(db, 'guests', id);
  await updateDoc(guestDoc, { approved });
};

export const deleteGuest = async (id: string): Promise<void> => {
  const guestDoc = doc(db, 'guests', id);
  await deleteDoc(guestDoc);
};

export const sendApprovalNotification = async (guest: Guest): Promise<void> => {
  const EmailParams: {
    bussinessName: string;
    fromName: string;
    fromEmail: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
  } = {
    bussinessName: 'Alfonso Fiesta 2025',
    fromName: MY_NAME,
    fromEmail: MY_EMAIL,
    to: [guest.email],
    subject: 'Invitación a Alfonso Party 2025',
    text: `Tu invitación está en: ${WEB_URL_PRODUCTION}/inv/${guest.email}`,
    html: createHTMLString(guest),
  };
  try {
    const response = await fetch(WEB_URL_FOR_EMAIL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(EmailParams),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    console.log(`Email enviado a ${guest.email}`);
  } catch (error) {
    console.error(`Error al enviar el email a ${guest.email}:`, error);
  }
};

export const getYouTubeEmbedUrl = (videoId: string): string => {
  // Ensure autoplay with sound after user interaction. Mute might be necessary for initial load depending on browser policy.
  // For this app, user clicks "Enter" first, which counts as interaction.
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;
};

// Helper for sorting guests in admin panel
export const sortGuests = (guests: Guest[]): Guest[] => {
  return [...guests].sort((a, b) => {
    const valA = a.approved === null ? 0 : a.approved === true ? 1 : 2;
    const valB = b.approved === null ? 0 : b.approved === true ? 1 : 2;
    if (valA !== valB) {
      return valA - valB;
    }
    // Secondary sort by creation date if approval status is the same
    const timeA = a.createdAt?.toMillis() || 0;
    const timeB = b.createdAt?.toMillis() || 0;
    return timeB - timeA; // Newest first within the same approval group
  });
};

function createHTMLString(guest: Guest): string {
  const invitationUrl = `${WEB_URL_PRODUCTION}/inv/${guest.email}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Estás invitado a la fiesta de ${MY_NAME}!</title>
        <style>
            body { margin: 0; padding: 0; font-family: sans-serif; background-color: #0f172a; color: #e2e8f0; }
            table { border-collapse: collapse; width: 100%; }
            td { padding: 0; }
            img { border: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 8px; overflow: hidden; }
            .header { background-color: #334155; padding: 20px; text-align: center; }
            .header img { max-width: 100px; height: auto; }
            .content { padding: 30px; text-align: center; }
            .title { color: #f87171; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            .greeting { color: #93c5fd; font-size: 18px; margin-bottom: 20px; }
            .event-details { background-color: #334155; padding: 15px; border-radius: 4px; margin-bottom: 15px; text-align: left; }
            .event-details p { margin: 5px 0; }
            .event-title { font-weight: bold; color: #93c5fd; }
            .button-container { text-align: center; margin-top: 30px; }
            .button { display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 9999px; transition: background-color 0.3s ease; }
            .button:hover { background-color: #b91c1c; }
            .footer { background-color: #334155; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px; }
        </style>
    </head>
    <body>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td style="padding: 20px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="container">
                        <tr>
                            <td class="header">
                                <img src="${WEB_URL_PRODUCTION}/img/maskable_icon_x192.png" alt="Icono de la fiesta">
                            </td>
                        </tr>
                        <tr>
                            <td class="content">
                                <h1 class="title">¡Estás invitado a la fiesta de ${MY_NAME}!</h1>
                                <p class="greeting">¡Hola ${guest.name} ${guest.lastname}!</p>
                                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                                    ¡Prepárate para celebrar mi cumpleaños a lo grande! 🎉
                                    Te espero para compartir un momento especial.
                                </p>

                                ${
                                  guest.diner
                                    ? `
                                <div class="event-details">
                                    <p class="event-title">Cena:</p>
                                    <p>${PLACE_DINNER.name} - ${PLACE_DINNER.schedule}</p>
                                </div>
                                `
                                    : ''
                                }

                                ${
                                  guest.party
                                    ? `
                                <div class="event-details">
                                    <p class="event-title">Fiesta:</p>
                                    <p>${PLACE_PARTY.name} - ${PLACE_PARTY.schedule}</p>
                                </div>
                                `
                                    : ''
                                }

                                <div class="button-container">
                                    <a href="${invitationUrl}" class="button">Ver invitación</a>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer">
                                <p>&copy; ${new Date().getFullYear()} Alfonso Party. Todos los derechos reservados.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;
}
