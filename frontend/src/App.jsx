import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Scoreboard from "./pages/Scoreboard.jsx";
import Schedule from "./pages/Schedule.jsx";
import MapPage from "./pages/MapPage.jsx";
import Login from "./pages/Login.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

// Protected route wrapper — redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Home component with premium design
const Home = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-10">
      <div className="text-center max-w-2xl">
        <img
          src="/D-con.png"
          alt="D-Con Logo"
          className="w-80 h-80 mx-auto drop-shadow-xl object-contain"
        />
        <h1 className="-mt-10 text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-teal-500 mb-4 relative z-10">
          Welcome to D-Con
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          D-CON is a conference to gather priests and servants from different
          churches' STEAM development centers.
        </p>

        {isAuthenticated && (
          <div className="bg-gradient-to-r from-gray-50 to-teal-50 rounded-2xl p-6 mb-8 border border-teal-200">
            <p className="text-gray-700">
              Welcome back,{" "}
              <span className="font-bold text-teal-700">{user?.username}</span>!
              {isAdmin && (
                <span className="ml-2 px-3 py-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-white text-sm rounded-full">
                  Admin
                </span>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scoreboard hidden — uncomment to restore
          <Link
            to="/live-score"
            className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-amber-300"
          >
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-bold text-gray-800 group-hover:text-amber-600 transition-colors">
              Live Standings
            </h3>
            <p className="text-sm text-gray-500">
              Real-time competition scores
            </p>
          </Link>
          */}

          <Link
            to="/schedule"
            className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-teal-300"
          >
            <div className="flex justify-center mb-3">
              <img src="/Nkom-Logo.png" alt="Nkom" className="h-18 w-auto" />
            </div>
            <h3 className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
              Event Schedule
            </h3>
            <p className="text-sm text-gray-500">Today's activities timeline</p>
          </Link>

          <Link
            to="/map"
            className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-teal-300 flex flex-col"
          >
            <div className="flex-grow flex items-center justify-center rounded-lg overflow-hidden">
              <img
                src="/D-con Map.png"
                alt="D-con Map"
                className="w-full h-26 object-cover"
              />
            </div>
            <div className="mt-auto">
              <h3 className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
                D-con Map
              </h3>
              <p className="text-sm text-gray-500">Find your way around</p>
            </div>
          </Link>
        </div>

        {/* Branding footer */}
        <div className="mt-12 flex items-center justify-center gap-4 opacity-70">
          <span className="text-sm text-gray-500 font-medium">Powered by</span>
          <img
            src="/Nkom-NBNY-Logo.jpg"
            alt="Nkom NBNY Logo"
            className="h-16 rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );
};

// Navigation component
const Navigation = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-5">
          <ul className="flex space-x-6 font-semibold items-center">
            <li>
              <Link
                to="/"
                className="hover:text-teal-400 transition-colors flex items-center gap-2"
              >
                <img
                  src="/D-con-white.jpg"
                  alt="D-Con"
                  className="h-16 w-auto rounded object-contain"
                />{" "}
                {/* Home */}
              </Link>
            </li>
            {/* Scoreboard hidden — uncomment to restore
            <li>
              <Link
                to="/live-score"
                className="hover:text-teal-400 transition-colors flex items-center gap-2"
              >
                Scoreboard
              </Link>
            </li>
            */}
            <li>
              <Link
                to="/schedule"
                className="hover:text-teal-400 transition-colors flex items-center gap-2"
              >
                <img
                  src="/Nkom-NBNY-Logo.jpg"
                  alt="Nkom"
                  className="h-16 w-auto rounded object-contain"
                />{" "}
                {/* Schedule */}
              </Link>
            </li>
            <li>
              <Link
                to="/map"
                className="hover:text-teal-400 transition-colors flex items-center gap-2"
              >
                {/* <span>📍</span> */}
                Map
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-300 text-sm">
                {user?.username}
                {isAdmin && (
                  <span className="ml-2 px-2 py-0.5 bg-teal-500/20 text-teal-200 text-xs rounded-full border border-teal-400/30">
                    Admin
                  </span>
                )}
              </span>
              <Link
                to="/change-password"
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                title="Change Password"
              >
                🔑
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/users"
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                  title="Manage Users"
                >
                  👥
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-teal-500 text-white hover:bg-teal-600 rounded-lg transition-colors text-sm font-semibold shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

// Main App wrapper
const AppContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 text-gray-900">
      <Navigation />
      <div className="container mx-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/live-score" element={<ProtectedRoute><Scoreboard /></ProtectedRoute>} /> */}
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
