import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MY_NAME,
  PLACE_DINNER,
  PLACE_PARTY,
  Guest,
  PlaceDetails,
  addGuest,
  getGuestByEmail,
  deleteGuest,
} from '../config';
import LandingContent from './LandingContent';
import { MyVideoAndMusicBackground } from './MyVideoAndMusicBackground';

// Reusable LuminousText component
const LuminousText: React.FC<{
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
  customGlow?: string;
}> = ({ text, className = '', as = 'p', customGlow }) => {
  const Component = as;
  const defaultGlow =
    'filter drop-shadow-[0_0_2px_rgba(255,255,255,0.7)] drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] drop-shadow-[0_0_12px_rgba(239,68,68,0.4)] drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]'; // White base, red primary, blue secondary glow
  const glowStyle = customGlow || defaultGlow;
  // Se agrega text-center por defecto
  return <Component className={`text-center ${glowStyle} ${className}`}>{text}</Component>;
};

const PlaceInfoModal: React.FC<{ place: PlaceDetails; onClose: () => void }> = ({
  place,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="place-info-title"
    >
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full text-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-slate-400 hover:text-white text-3xl leading-none"
          aria-label="Cerrar modal"
        >
          &times;
        </button>
        <h3 id="place-info-title" className="text-2xl font-bold text-red-400 mb-3">
          {place.name}
        </h3>
        <p className="text-slate-300 mb-2">{place.schedule}</p>
        <a
          href={place.instagramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-150 text-sm"
        >
          {place.instagramButtonText}
        </a>
        <a
          href={place.mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-150 text-sm"
        >
          {place.mapButtonText}
        </a>
      </div>
    </div>
  );
};

interface InvitationContentProps {
  isPersonalized?: boolean;
}

const InvitationContent: React.FC<InvitationContentProps> = ({ isPersonalized = false }) => {
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', lastname: '', email: '' });
  const [diner, setDiner] = useState(false);
  const [party, setParty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [modalPlace, setModalPlace] = useState<PlaceDetails | null>(null);

  const [personalizedGuest, setPersonalizedGuest] = useState<Guest | null>(null);
  const [loadingPersonalized, setLoadingPersonalized] = useState(isPersonalized);
  const { guestEmail } = useParams<{ guestEmail?: string }>();
  const navigate = useNavigate();

  const [isEntered, setIsEntered] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isPersonalized && guestEmail) {
      // guardar el correo en localStorage
      localStorage.setItem('guestEmail', guestEmail);
      const fetchGuest = async () => {
        setLoadingPersonalized(true);
        try {
          const guest = await getGuestByEmail(guestEmail);
          if (guest && guest.approved) {
            setPersonalizedGuest(guest);
          } else if (guest && guest.approved === false) {
            setSubmissionMessage(
              'Tu confirmación anterior no pudo ser aprobada. Por favor, contacta a Alfonso.'
            );
          } else if (guest && guest.approved === null) {
            setSubmissionMessage(
              'Tu asistencia está registrada pero aún no ha sido aprobada... ¡Pronto recibirás noticias!'
            );
          } else {
            setSubmissionMessage(
              'No se encontró una invitación para este correo o no ha sido aprobada.'
            );
          }
        } catch (error) {
          console.error('Error fetching personalized guest data:', error);
          setSubmissionMessage('Error al cargar la invitación personalizada.');
        } finally {
          setLoadingPersonalized(false);
        }
      };
      fetchGuest();
    }
  }, [isPersonalized, guestEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.lastname || !formData.email) {
      setSubmissionMessage('Por favor, completa todos los campos.');
      return;
    }
    if (!diner && !party) {
      setSubmissionMessage('Por favor, confirma asistencia a la cena, la fiesta o ambas.');
      return;
    }
    setSubmitting(true);
    setSubmissionMessage(null); // Clear previous messages
    try {
      await addGuest({ ...formData, diner, party });
      localStorage.setItem('guestEmail', formData.email);
      setSubmissionMessage(
        `¡Gracias ${formData.name}! Tu respuesta ha sido enviada. ${MY_NAME} te avisará cuando esté confirmada.`
      );
      setShowRsvpForm(false); // Hide form only on success
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      if (error instanceof Error && error.message === 'El correo ya está registrado.') {
        setSubmissionMessage('Este correo ya está registrado. Por favor, utiliza otro correo.');
      } else {
        setSubmissionMessage(
          'Hubo un error al enviar tu respuesta. Por favor, inténtalo de nuevo.'
        );
      }
      // Form remains visible due to catch block
    } finally {
      setSubmitting(false);
      // No need to explicitly set setShowRsvpForm(true) here
    }
  };

  if (loadingPersonalized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-900"
        role="status"
        aria-live="polite"
      >
        <LuminousText
          text="Cargando tu invitación personalizada..."
          className="text-2xl text-blue-300"
        />
      </div>
    );
  }

  if (isPersonalized) {
    if (!personalizedGuest) {
      if (!isEntered) return <LandingContent enterFunction={() => setIsEntered(true)} />;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-center relative">
          <MyVideoAndMusicBackground />
          <div className="z-10 bg-slate-950/55 p-8 rounded-xl shadow-2xl">
            <LuminousText
              text={submissionMessage || 'Invitación no válida o pendiente.'}
              as="h1"
              className="text-3xl text-red-400"
            />
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            >
              Actualizar
            </button>
          </div>
        </div>
      );
    }
    const validityTextParts = [];
    if (personalizedGuest.diner) validityTextParts.push(PLACE_DINNER.name);
    if (personalizedGuest.party) validityTextParts.push(PLACE_PARTY.name);
    const validityText =
      validityTextParts.length > 0
        ? `* Invitación válida para: ${validityTextParts.join(' y ')}.`
        : '* Contacta a Alfonso para detalles.';

    if (!isEntered) return <LandingContent enterFunction={() => setIsEntered(true)} />;

    if (showDeleteWarning)
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-center relative">
          <MyVideoAndMusicBackground />
          <div className="z-10 bg-slate-950/55 p-8 rounded-xl shadow-2xl max-w-lg w-full">
            <LuminousText
              text="¿Estás seguro de que quieres eliminar tu invitación?"
              as="h1"
              className="text-2xl text-red-400 mb-4"
            />
            <p className="text-slate-200 mb-6">
              Esta acción <span className="font-bold text-red-500">no se puede deshacer</span>{' '}
              <br /> y {MY_NAME} estará muy triste 😢.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowDeleteWarning(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors duration-150"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!personalizedGuest?.email) return;
                  setDeleting(true);
                  try {
                    await deleteGuest(personalizedGuest.id || '');
                    localStorage.removeItem('guestEmail');
                    navigate('/');
                  } catch (e) {
                    setDeleting(false);
                    alert('Error al eliminar la invitación. Intenta de nuevo.');
                  }
                }}
                className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors duration-150"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar invitación'}
              </button>
            </div>
          </div>
        </div>
      );

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-center relative">
        <MyVideoAndMusicBackground />
        <div className="z-10 bg-slate-950/55 p-8 rounded-xl shadow-2xl max-w-lg w-full">
          <LuminousText
            text={`¡Hola ${personalizedGuest.name} ${personalizedGuest.lastname}!`}
            as="h1"
            className="text-3xl sm:text-4xl font-bold text-red-400 mb-4"
          />
          <LuminousText
            text={`${MY_NAME} te espera para celebrar su cumpleaños.`}
            as="p"
            className="text-lg sm:text-xl text-blue-300 mb-6"
          />
          {personalizedGuest.diner && (
            <div className="mb-3 text-left bg-slate-800/70 p-3 rounded">
              <p className="font-semibold text-blue-300">Cena:</p>
              <p className="text-slate-200 text-center">
                {PLACE_DINNER.name} - {PLACE_DINNER.schedule}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <a
                  href={PLACE_DINNER.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors duration-150"
                >
                  {PLACE_DINNER.instagramButtonText}
                </a>
                <a
                  href={PLACE_DINNER.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors duration-150"
                >
                  {PLACE_DINNER.mapButtonText}
                </a>
              </div>
            </div>
          )}
          {personalizedGuest.party && (
            <div className="mb-3 text-left bg-slate-800/70 p-3 rounded">
              <p className="font-semibold text-blue-300">Fiesta:</p>
              <p className="text-slate-200 text-center">
                {PLACE_PARTY.name} - {PLACE_PARTY.schedule}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <a
                  href={PLACE_PARTY.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors duration-150"
                >
                  {PLACE_PARTY.instagramButtonText}
                </a>
                <a
                  href={PLACE_PARTY.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors duration-150"
                >
                  {PLACE_PARTY.mapButtonText}
                </a>
              </div>
            </div>
          )}
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => {
                localStorage.removeItem('guestEmail');
                navigate('/');
              }}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors duration-150"
            >
              Pedir otra entrada
            </button>
            <button
              onClick={() => setShowDeleteWarning(true)}
              className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors duration-150 border border-red-300 opacity-80"
            >
              Eliminar mi entrada
            </button>
          </div>
          <p className="text-sm text-slate-400 mt-6">{validityText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-center relative overflow-hidden z-10">
      <MyVideoAndMusicBackground />
      <div
        className="z-10 relative transition-all duration-500 ease-in-out w-full max-w-xl"
        style={{ transform: showRsvpForm ? 'translateY(-60px)' : 'translateY(0)' }}
      >
        {!submissionMessage && !showRsvpForm && (
          <div className="bg-slate-950/70 p-2 rounded-xl shadow-2xl">
            <LuminousText
              text={`¡Te invito a festejar mi cumpleaños!`}
              as="h1"
              className="text-4xl sm:text-5xl font-bold text-red-600 mb-8"
              customGlow="filter drop-shadow-[0_0_2px_#fff] drop-shadow-[0_0_8px_#fff] drop-shadow-[0_0_20px_#ef4444] drop-shadow-[0_0_30px_#ef4444]"
            />
            <LuminousText
              text="¡Se viene el cumple del más amigable de la historia!"
              as="h2"
              className="text-2xl sm:text-3xl font-bold text-white mb-2"
              customGlow="filter drop-shadow-[0_0_2px_#fff] drop-shadow-[0_0_8px_#ef4444] drop-shadow-[0_0_16px_#ef4444]"
            />
            <p className="text-slate-200 text-base sm:text-lg mb-2 font-semibold">
              ¡Festejemos a lo grande!
            </p>
            <p className="text-slate-300 text-base mb-4">¡Hooola! ¿Todo bien por ahí?</p>
            <p className="text-slate-200 text-base mb-2">
              Prepárate que este <span className="font-bold text-red-400">sábado 31 de mayo</span>{' '}
              (¡sí, el cumple de este humilde servidor!) se arma un fiestón que va a quedar en la
              historia. Olvídate de la rutina, porque la noche se viene picante y no puedes faltar.
            </p>
            <p className="text-slate-200 text-base mb-2">
              Vamos a arrancar tempranito, a las{' '}
              <span className="font-bold text-blue-300">21:00 HS. PUNTUAL</span> (¡no te hagas el
              remolón!), comiendo y brindando en el{' '}
              <span className="font-bold text-pink-400">Bless Bar</span>. Ese lugar es un golazo:
              tienen unas ofertas de comida rápida que te explotan la cabeza y unos tragos en vasos
              exóticos que son una locura. ¡La panza llena y el corazón contento para lo que se
              viene!
            </p>
            <p className="text-slate-200 text-base mb-2">
              A la medianoche, soplamos la velita del cumple, nos llenamos de azúcar con la torta y
              nos preparamos para seguirla de largo. Porque la cosa no termina ahí. <br />
              <span className="font-bold text-rose-400">¡Que salpique la joda!</span>
            </p>
            <p className="text-slate-200 text-base mb-2">
              Después de la torta, nos vamos directo al boliche{' '}
              <span className="font-bold text-blue-400">Club Meet</span>, que nos espera a la{' '}
              <span className="font-bold text-blue-300">1:00 HS del domingo</span>. ¡Sí, el Club
              Meet! Ese lugar donde la música es la mejor de todas las épocas, para que bailes hasta
              que te duelan los pies. Además, nos tienen preparados unos vouchers de bebida para que
              celebremos como se debe, <span className="font-bold text-yellow-300">¡EXPLOTA!</span>
            </p>
            <p className="text-slate-200 text-base mb-2">
              La fiesta se pone buenísima hasta las{' '}
              <span className="font-bold text-blue-300">6:00 HS del domingo</span>. ¡Aguante la
              energía! Y lo mejor de todo es que ambos lugares quedan cerca, ¡así que nos
              trasladamos cómodamente!
            </p>
            <p className="text-slate-200 text-base mb-2 mt-4">
              <span className="font-bold text-red-400">¡Importante!</span>
              <br />
              Para que organicemos todo de diez y no le fallemos a nadie, es re importante que
              confirmes tu asistencia. Necesito saber si vas a la cena en Bless, a la fiesta en Club
              Meet, o ¡si te prendes a ambas cosas!
            </p>
            <p className="text-slate-200 text-base mb-2">
              Porfa, llena el formulario cuando Confirmes Asistencia para que tengamos la lista
              armada y se la pasemos al bar y al boliche. <br />
              <span className="font-bold text-blue-300">
                ¡Tu confirmación es clave para que todo salga joya!
              </span>
            </p>
            <p className="text-slate-200 text-base mb-2">
              ¡No veo la hora de festejar con vos, mi amigo/a querido/a! <br />
              <span className="font-bold text-yellow-200">¡Será una noche inolvidable!</span>
            </p>
            <p className="text-slate-200 text-base mb-2">¡Nos vemos el sábado!</p>
            <p className="text-slate-400 text-base mt-4">
              Un abrazo gigante,
              <br />
              <span className="font-bold text-white">Alfonso MO.-</span>
            </p>
            <button
              onClick={() => setShowRsvpForm(true)}
              className="my-6 bg-blue-500/25 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full shadow-md transition-colors duration-150"
              aria-label="Confirmar asistencia"
            >
              Confirmar Asistencia
            </button>
          </div>
        )}
      </div>

      {submissionMessage && !showRsvpForm && (
        <div className="z-10 mt-8 bg-slate-950/55 p-6 rounded-xl shadow-2xl text-center">
          <LuminousText text={submissionMessage} as="p" className="text-xl text-sky-300" />{' '}
          {/* Brighter blue for success */}
          <button
            onClick={() => {
              setSubmissionMessage(null);
              navigate('/');
            }}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
          >
            Entendido
          </button>
        </div>
      )}

      {showRsvpForm && (
        <div className="z-10 mt-4 bg-slate-800/75 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg">
          <form onSubmit={handleSubmitRsvp} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-blue-300 text-left">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-red-500 focus:border-red-500 text-center"
              />
              <p className="mt-1 text-xs text-slate-400">
                * El Nombre y el Apellido son para armar la lista de invitados.
              </p>
            </div>
            <div>
              <label
                htmlFor="lastname"
                className="block text-sm font-medium text-blue-300 text-left"
              >
                Apellido
              </label>
              <input
                type="text"
                name="lastname"
                id="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-red-500 focus:border-red-500 text-center"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-300 text-left">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-red-500 focus:border-red-500 text-center"
              />
              <p className="mt-1 text-xs text-slate-400">
                * Te llegará la invitación cuando tu solicitud sea aprobada.
              </p>
            </div>

            <fieldset className="pt-4">
              <legend className="text-lg font-medium text-blue-300 mb-2 text-left">
                ¿A qué te apuntas?
              </legend>
              <div className="flex items-center justify-between mb-3 bg-slate-700/70 p-3 rounded-md">
                <span
                  className="text-sm font-medium text-slate-200 hover:text-blue-300 cursor-pointer"
                  onClick={() => setModalPlace(PLACE_DINNER)}
                >
                  Participar en la Cena ({PLACE_DINNER.name})
                </span>
                <button
                  type="button"
                  aria-pressed={diner}
                  onClick={() => setDiner(!diner)}
                  className={`${
                    diner ? 'bg-red-600' : 'bg-slate-600'
                  } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500`}
                >
                  <span
                    className={`${
                      diner ? 'translate-x-[12px]' : 'translate-x-[2px]'
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between bg-slate-700/70 p-3 rounded-md">
                <span
                  className="text-sm font-medium text-slate-200 hover:text-blue-300 cursor-pointer"
                  onClick={() => setModalPlace(PLACE_PARTY)}
                >
                  Participar en la Fiesta ({PLACE_PARTY.name})
                </span>
                <button
                  type="button"
                  aria-pressed={party}
                  onClick={() => setParty(!party)}
                  className={`${
                    party ? 'bg-red-600' : 'bg-slate-600'
                  } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500`}
                >
                  <span
                    className={`${
                      party ? 'translate-x-[12px]' : 'translate-x-[2px]'
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                  />
                </button>
              </div>
            </fieldset>

            {submissionMessage && <p className="text-red-500 text-sm mt-2">{submissionMessage}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 bg-blue-500/25 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full shadow-md transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Enviar Confirmación'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRsvpForm(false);
                setSubmissionMessage(null);
              }}
              className="w-full mt-3 bg-red-500/25 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition-colors duration-150"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
      {modalPlace && <PlaceInfoModal place={modalPlace} onClose={() => setModalPlace(null)} />}
    </div>
  );
};

export default InvitationContent;
