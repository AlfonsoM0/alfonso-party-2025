import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Guest,
  getGuests,
  updateGuestApproval,
  deleteGuest,
  sendApprovalNotification,
  sortGuests,
} from '../config';
import { AuthContext } from '../App';

// Reusable LuminousText component
const LuminousText: React.FC<{
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
}> = ({ text, className = '', as = 'p' }) => {
  const Component = as;
  // Dominant red glow with blue accent for admin panel to match theme but differentiate slightly
  const baseStyle =
    'filter drop-shadow-[0_0_2px_rgba(255,255,255,0.7)] drop-shadow-[0_0_5px_rgba(239,68,68,0.6)] drop-shadow-[0_0_10px_rgba(239,68,68,0.4)] drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]';
  return <Component className={`${baseStyle} ${className}`}>{text}</Component>;
};

interface AdminContentProps {
  section: 'dashboard';
}

const AdminContent: React.FC<AdminContentProps> = ({ section }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useContext(AuthContext);

  const [loadingApprove, setLoadingApprove] = useState(false);

  const fetchGuestsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedGuests = await getGuests();
      setGuests(sortGuests(fetchedGuests));
    } catch (err) {
      console.error('Error fetching guests:', err);
      setError('Error al cargar los invitados. Intenta recargar la página.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuestsData();
  }, [fetchGuestsData]);

  const handleApprove = async (guest: Guest) => {
    if (guest.id) {
      setLoadingApprove(true);
      const success = await sendApprovalNotification({ ...guest, approved: true });
      if (success) {
        await updateGuestApproval(guest.id, true);
        fetchGuestsData();
      }
      setLoadingApprove(false);
    }
  };

  const handleDisapprove = async (guestId: string) => {
    await updateGuestApproval(guestId, false);
    fetchGuestsData();
  };

  const handleSetPending = async (guestId: string) => {
    await updateGuestApproval(guestId, null);
    fetchGuestsData();
  };

  const handleDelete = async (guestId: string) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar a este invitado? Esta acción no se puede deshacer.'
      )
    ) {
      await deleteGuest(guestId);
      fetchGuestsData();
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-xl text-blue-300"
        role="status"
        aria-live="polite"
      >
        Cargando panel de administración...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-xl text-red-500 p-4"
        role="alert"
      >
        {error}
      </div>
    );
  }

  const getApprovalStatusText = (approved: boolean | null) => {
    if (approved === null) return <span className="text-yellow-400">Pendiente</span>;
    if (approved === true) return <span className="text-sky-400">Aprobado</span>; // Bright blue for approved
    return <span className="text-red-400">Rechazado</span>;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 relative z-10 overflow-x-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <LuminousText
            text="Panel de Administración"
            as="h1"
            className="text-3xl sm:text-4xl font-bold text-red-500"
          />
          <button
            onClick={auth?.logout}
            className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <Link
            to="/adm/cena"
            target="_blank"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Ver Lista Cena (Pública)
          </Link>
          <Link
            to="/adm/party"
            target="_blank"
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            {' '}
            {/* Rose for a different red touch */}
            Ver Lista Fiesta (Pública)
          </Link>
        </div>

        {section === 'dashboard' && (
          <div className="bg-slate-800 shadow-2xl rounded-lg overflow-x-auto">
            <table className="w-full min-w-max text-sm text-left text-slate-300">
              <thead className="text-xs text-blue-300 uppercase bg-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Cena
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Fiesta
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No hay invitados registrados.
                    </td>
                  </tr>
                )}
                {guests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-100 whitespace-nowrap">
                      {guest.name} {guest.lastname}
                    </td>
                    <td className="px-4 py-3">{guest.email}</td>
                    <td className="px-4 py-3 text-center">{guest.diner ? '✔️' : '❌'}</td>
                    <td className="px-4 py-3 text-center">{guest.party ? '✔️' : '❌'}</td>
                    <td className="px-4 py-3 text-center">
                      {getApprovalStatusText(guest.approved)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                        {guest.approved !== true && (
                          <button
                            onClick={() => handleApprove(guest)}
                            className="p-1.5 text-xs bg-sky-600 hover:bg-sky-700 rounded-md transition-colors text-white"
                            title="Aprobar"
                          >
                            {loadingApprove ? '⏳ Cargando' : '✅ Aprobar'}
                          </button>
                        )}
                        {guest.approved !== false && (
                          <button
                            onClick={() => guest.id && handleDisapprove(guest.id)}
                            className="p-1.5 text-xs bg-red-600 hover:bg-red-700 rounded-md transition-colors text-white"
                            title="Rechazar"
                          >
                            ❌ Rechazar
                          </button>
                        )}
                        {guest.approved !== null && (
                          <button
                            onClick={() => guest.id && handleSetPending(guest.id)}
                            className="p-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 rounded-md transition-colors text-slate-800"
                            title="Marcar como Pendiente"
                          >
                            ⏳ Pendiente
                          </button>
                        )}
                        <button
                          onClick={() => guest.id && handleDelete(guest.id)}
                          className="p-1.5 text-xs bg-slate-600 hover:bg-slate-500 rounded-md transition-colors text-white"
                          title="Eliminar"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContent;
