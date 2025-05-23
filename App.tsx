import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingContent from './components/LandingContent';
import InvitationContent from './components/InvitationContent';
import AdminContent from './components/AdminContent';
import {
  ADMIN_PASSWORD,
  Guest,
  getGuests,
  getGuestByEmail,
  PLACE_DINNER,
  PLACE_PARTY,
} from './config';

// Context for Admin Authentication
interface AuthContextType {
  isAdminAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}
export const AuthContext = React.createContext<AuthContextType | null>(null);

const App: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('isAdminAuthenticated');
  };

  useEffect(() => {
    if (sessionStorage.getItem('isAdminAuthenticated') === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // This component protects admin routes
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isAdminAuthenticated) {
      return <Navigate to="/admin-login" replace />;
    }
    return <>{children}</>;
  };

  // Component for Admin Login page
  const AdminLoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = React.useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (auth?.login(password)) {
        navigate('/adm'); // Redirigir al dashboard
      } else {
        setError('Contraseña incorrecta.');
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
        <h1 className="text-3xl font-bold text-red-500 mb-6 filter drop-shadow-[0_0_3px_#fff] drop-shadow-[0_0_8px_#ef4444]">
          Acceso Administrador
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-sm"
        >
          <div className="mb-4">
            <label htmlFor="password" className="block text-blue-300 text-sm font-bold mb-2">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border border-blue-500 rounded w-full py-2 px-3 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              aria-describedby={error ? 'password-error' : undefined}
            />
          </div>
          {error && (
            <p id="password-error" className="text-red-500 text-xs italic mb-4">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline transition-colors duration-150"
          >
            Ingresar
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          Para desarrollo: la contraseña es 'supersecretpassword'.
        </p>
      </div>
    );
  };

  // Public guest lists component
  const PublicGuestList: React.FC<{ listType: 'cena' | 'party' }> = ({ listType }) => {
    const [confirmedGuests, setConfirmedGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchConfirmedGuests = async () => {
        setLoading(true);
        try {
          const allGuests = await getGuests();
          const filtered = allGuests.filter(
            (g) => g.approved === true && (listType === 'cena' ? g.diner : g.party)
          );
          setConfirmedGuests(filtered);
        } catch (error) {
          console.error('Error fetching confirmed guests:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchConfirmedGuests();
    }, [listType]);

    const title =
      listType === 'cena'
        ? `Invitados Confirmados Cena - ${PLACE_DINNER.name}`
        : `Invitados Confirmados Fiesta - ${PLACE_PARTY.name}`;
    const placeInfo = listType === 'cena' ? PLACE_DINNER : PLACE_PARTY;

    if (loading) {
      return (
        <div
          className="min-h-screen flex items-center justify-center text-xl text-blue-300"
          role="status"
          aria-live="polite"
        >
          Cargando lista de invitados...
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-red-500 mb-6 filter drop-shadow-[0_0_3px_#fff] drop-shadow-[0_0_8px_#ef4444]">
          {title}
        </h1>
        <div className="bg-slate-800 shadow-2xl rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-lg text-blue-300 mb-1">Horario: {placeInfo.schedule}</p>
          <p className="text-sm text-slate-400 mb-6">Total confirmados: {confirmedGuests.length}</p>
          {confirmedGuests.length > 0 ? (
            <ul className="space-y-3">
              {confirmedGuests.map((guest) => (
                <li key={guest.id} className="bg-slate-700 p-3 rounded-md shadow text-slate-200">
                  {guest.name} {guest.lastname}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-400 py-4">
              No hay invitados confirmados para {listType === 'cena' ? 'la cena' : 'la fiesta'} por
              el momento.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthContext.Provider value={{ isAdminAuthenticated, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingContent />} />
          <Route path="/invitation" element={<InvitationContent />} />
          <Route path="/inv/:guestEmail" element={<InvitationContent isPersonalized={true} />} />

          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route
            path="/adm"
            element={
              <ProtectedRoute>
                <AdminContent section="dashboard" />
              </ProtectedRoute>
            }
          />
          <Route path="/adm/cena" element={<PublicGuestList listType="cena" />} />
          <Route path="/adm/party" element={<PublicGuestList listType="party" />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
