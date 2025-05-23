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
import { createHTMLString } from './utils/createHTMLString';

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
  // Faint (Official Music Video) [4K UPGRADE] – Linkin Park
  '7odTcs48adrK9uq',
  // Red Hot Chili Peppers - Can't Stop [Official Music Video]
  'uSG4GFDlZF7cwFZb',
  // Nickelback - Burn It to the Ground [OFFICIAL HD VIDEO]
  'Bml1plCaMpcXRNH9',
  // The Black Eyed Peas - I Gotta Feeling (Official Music Video)
  'Fwd1Mbjqt1Kwqb3K',
  // David Guetta - Titanium ft. Sia (Official Video)
  'klFxMgKjTCJSAW9r',
];

export const PLACE_DINNER = {
  name: 'Bar Bless',
  schedule: 'Sábado 31 de Mayo, de 21:00 hs a 01:00 hs',
  mapsLink: 'https://maps.app.goo.gl/NZMi5fmaydSpDFAe8',
  mapButtonText: 'Ver en Google Maps',
  instagramLink: 'https://www.instagram.com/bless.sgo',
  instagramButtonText: 'Ver en Instatram',
};

export const PLACE_PARTY = {
  name: 'Boliche Club Meet',
  schedule: 'Domingo 1 de Junio, de 01:00 hs a 06:00 hs',
  mapsLink: 'https://maps.app.goo.gl/N4hoguoExeH9LbQb8',
  mapButtonText: 'Ver en Google Maps',
  instagramLink: 'https://www.instagram.com/clubmeetoficial',
  instagramButtonText: 'Ver en Instatram',
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
    text: `Tu invitación está en: ${WEB_URL_PRODUCTION}/#/inv/${guest.email}`,
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
    alert(`Error al enviar el email a ${guest.name} ${guest.lastname} (${guest.email}).`);
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
