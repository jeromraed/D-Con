import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Scoreboard from "./pages/Scoreboard.jsx";
import Schedule from "./pages/Schedule.jsx";
import MapPage from "./pages/MapPage.jsx";
// Placeholder components (We will move these to separate files later)
const Home = () => <div className="p-10 text-2xl font-bold">🏠 Home Page</div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        {/* Navigation Bar (Temporary) */}
        <nav className="bg-blue-600 p-4 text-white shadow-md">
          <ul className="flex space-x-6 justify-center font-semibold">
            <li>
              <Link to="/" className="hover:text-blue-200">
                Home
              </Link>
            </li>
            <li>
              <Link to="/live-score" className="hover:text-blue-200">
                Scoreboard
              </Link>
            </li>
            <li>
              <Link to="/schedule" className="hover:text-blue-200">
                Schedule
              </Link>
            </li>
            <li>
              <Link to="/map" className="hover:text-blue-200">
                Map
              </Link>
            </li>
          </ul>
        </nav>

        {/* Page Content */}
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live-score" element={<Scoreboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
